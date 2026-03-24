import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, ScanLine } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: Props) {
  const { t } = useI18n();
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const scannerId = 'barcode-scanner-region';

    // Small delay to let the DOM render the container
    const timer = setTimeout(async () => {
      if (cancelled) return;

      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          setError(t.scanner.noCamera);
          return;
        }

        // Prefer back camera on mobile
        const backCamera = cameras.find(
          (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('arrière')
        );
        const cameraId = backCamera?.id ?? cameras[0].id;

        await scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            handleClose();
          },
          () => {
            // Ignore scan failures (no code in frame)
          }
        );
      } catch (err) {
        if (!cancelled) {
          setError(t.scanner.permissionDenied);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopScanner();
    };
  }, [open]);

  function stopScanner() {
    const scanner = scannerRef.current;
    if (scanner) {
      try { scanner.stop().catch(() => {}); } catch (_) { /* not running */ }
      try { scanner.clear(); } catch (_) { /* not started */ }
      scannerRef.current = null;
    }
  }

  function handleClose() {
    try { stopScanner(); } catch (_) { /* ignore */ }
    setError('');
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={handleClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t.scanner.title}</h3>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3">{t.scanner.instructions}</p>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border border-gray-200"
          >
            <div id="barcode-scanner-region" className="w-full" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <ScanLine className="w-16 h-16 text-primary-500/30 animate-pulse" />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t.scanner.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
