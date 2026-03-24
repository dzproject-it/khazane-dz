#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Khazane-DZ — Script de déploiement K3s
# Usage: ssh root@87.106.4.161 'bash -s' < scripts/deploy-k8s.sh
#   ou copier le projet puis exécuter sur le serveur
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

APP_NAME="khazane-dz"
NAMESPACE="khazane"
PROJECT_DIR="/opt/khazane-dz"

echo "═══════════════════════════════════════════"
echo "  Khazane-DZ — Déploiement Kubernetes"
echo "═══════════════════════════════════════════"

# ── 1. Mise à jour système ──
echo ""
echo "▶ [1/7] Mise à jour du système..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Installation de K3s ──
echo ""
echo "▶ [2/7] Installation de K3s..."
if command -v k3s &> /dev/null; then
    echo "  K3s est déjà installé."
    k3s --version
else
    curl -sfL https://get.k3s.io | sh -s - \
        --write-kubeconfig-mode 644 \
        --disable traefik
    echo "  K3s installé avec succès."
fi

# Attendre que K3s démarre
echo "  Attente du démarrage du cluster..."
sleep 10
until kubectl get nodes 2>/dev/null | grep -q " Ready"; do
    echo "  En attente..."
    sleep 5
done
echo "  ✓ Cluster K3s opérationnel."

# Configurer kubectl pour l'utilisateur
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> /root/.bashrc 2>/dev/null || true

# ── 3. Installer Traefik via Helm ──
echo ""
echo "▶ [3/7] Installation de Traefik Ingress Controller..."
if ! command -v helm &> /dev/null; then
    curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

kubectl create namespace traefik 2>/dev/null || true
helm repo add traefik https://traefik.github.io/charts 2>/dev/null || true
helm repo update
helm upgrade --install traefik traefik/traefik \
    --namespace traefik \
    --set ports.web.port=8000 \
    --set ports.web.exposedPort=80 \
    --set ports.websecure.port=8443 \
    --set ports.websecure.exposedPort=443 \
    --set service.type=LoadBalancer \
    --wait --timeout 120s
echo "  ✓ Traefik installé."

# ── 4. Construire l'image Docker ──
echo ""
echo "▶ [4/7] Construction de l'image Docker..."

# Installer Docker si nécessaire (pour le build)
if ! command -v docker &> /dev/null; then
    echo "  Installation de Docker..."
    curl -fsSL https://get.docker.com | sh
fi

cd "$PROJECT_DIR"
docker build -t ${APP_NAME}:latest .
echo "  ✓ Image Docker construite."

# ── 5. Importer l'image dans K3s ──
echo ""
echo "▶ [5/7] Import de l'image dans K3s..."
docker save ${APP_NAME}:latest | k3s ctr images import -
echo "  ✓ Image importée dans containerd (K3s)."

# ── 6. Déployer les manifestes K8s ──
echo ""
echo "▶ [6/7] Déploiement des manifestes Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# Attendre que PostgreSQL soit prêt
echo "  Attente de PostgreSQL..."
kubectl -n $NAMESPACE rollout status deployment/postgres --timeout=120s

kubectl apply -f k8s/app.yaml
kubectl apply -f k8s/ingress.yaml

# Attendre que l'app soit prête
echo "  Attente de l'application..."
kubectl -n $NAMESPACE rollout status deployment/khazane-app --timeout=180s

echo "  ✓ Tous les manifestes déployés."

# ── 7. Seed de la base (première fois) ──
echo ""
echo "▶ [7/7] Vérification du seed de la base de données..."
APP_POD=$(kubectl -n $NAMESPACE get pod -l app=khazane-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$APP_POD" ]; then
    echo "  Exécution du seed sur le pod: $APP_POD"
    kubectl -n $NAMESPACE exec "$APP_POD" -- sh -c 'npx prisma db seed 2>/dev/null || echo "Seed déjà appliqué ou non configuré"'
fi

# ── Résumé ──
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✓ Déploiement terminé !"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Cluster:    $(kubectl get nodes -o wide --no-headers | awk '{print $1, $2, $6}')"
echo "  Pods:"
kubectl -n $NAMESPACE get pods -o wide
echo ""
echo "  Services:"
kubectl -n $NAMESPACE get svc
echo ""
echo "  Accès:"
echo "    → http://87.106.4.161"
echo "    → API: http://87.106.4.161/api/v1"
echo "    → Swagger: http://87.106.4.161/api/docs"
echo ""
echo "  Commandes utiles:"
echo "    kubectl -n khazane get pods"
echo "    kubectl -n khazane logs -f deployment/khazane-app"
echo "    kubectl -n khazane exec -it deployment/khazane-app -- sh"
echo ""
