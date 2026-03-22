import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, FolderTree, ArrowLeftRight, MapPin, X, Mic, MicOff } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface SearchResults {
  products: Array<{ id: string; sku: string; name: string; barcode: string | null; category: { name: string } | null }>;
  categories: Array<{ id: string; name: string; _count: { products: number } }>;
  movements: Array<{ id: string; reference: string; type: string; quantity: number; createdAt: string; product: { sku: string; name: string } }>;
  locations: Array<{ id: string; label: string | null; code: string; zone: { name: string; site: { name: string } } }>;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    inputRef.current?.focus();
  }, []);
  const { listening, supported: voiceSupported, error: voiceError, toggle: toggleVoice } = useVoiceSearch(handleVoiceResult);

  const flatItems = useCallback(() => {
    if (!results) return [];
    const items: Array<{ type: string; id: string; label: string; sub: string; route: string }> = [];
    results.products.forEach((p) =>
      items.push({ type: 'product', id: p.id, label: p.name, sub: p.sku + (p.category ? ` · ${p.category.name}` : ''), route: `/products?highlight=${p.id}` }),
    );
    results.categories.forEach((c) =>
      items.push({ type: 'category', id: c.id, label: c.name, sub: `${c._count.products} ${t.nav.products.toLowerCase()}`, route: `/products?category=${c.id}` }),
    );
    results.movements.forEach((m) =>
      items.push({ type: 'movement', id: m.id, label: m.reference, sub: `${m.product.name} · ${m.type} · ${m.quantity}`, route: '/movements' }),
    );
    results.locations.forEach((l) =>
      items.push({ type: 'location', id: l.id, label: l.label || l.code, sub: `${l.zone.name} · ${l.zone.site.name}`, route: '/storage' }),
    );
    return items;
  }, [results, t]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query.trim() } });
        setResults(data);
        setOpen(true);
        setSelectedIdx(-1);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    const items = flatItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && selectedIdx < items.length) {
      e.preventDefault();
      navigateTo(items[selectedIdx].route);
    }
  }

  function navigateTo(route: string) {
    setOpen(false);
    setQuery('');
    navigate(route);
  }

  const items = flatItems();
  const totalResults = items.length;
  const hasResults = results && totalResults > 0;
  const noResults = results && totalResults === 0 && query.trim().length > 0;

  const iconForType = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4 text-primary-500" />;
      case 'category': return <FolderTree className="w-4 h-4 text-amber-500" />;
      case 'movement': return <ArrowLeftRight className="w-4 h-4 text-blue-500" />;
      case 'location': return <MapPin className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'product': return t.nav.products;
      case 'category': return t.search.categories;
      case 'movement': return t.nav.movements;
      case 'location': return t.search.locations;
      default: return '';
    }
  };

  // Group items by type for section headers
  let lastType = '';

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={listening ? (t.search.voiceListening || '\uD83C\uDFA4 ...') : voiceError === 'not-allowed' ? (t.search.voiceDenied || '\u26A0 Micro refus\u00e9') : t.search.placeholder}
          className={`w-full ps-9 ${voiceSupported ? 'pe-28' : 'pe-20'} py-2 text-sm border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            listening ? 'border-red-400 ring-2 ring-red-200' : voiceError ? 'border-amber-400' : 'border-gray-300'
          }`}
        />
        <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {voiceSupported && (
            <button
              onClick={toggleVoice}
              title={listening ? (t.search.voiceStop || 'Stop') : (t.search.voiceStart || 'Voice search')}
              className={`p-1 rounded-full transition-colors ${
                listening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
            Ctrl K
          </kbd>
        </div>
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[28rem] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">{t.search.searching}</div>
          )}

          {noResults && !loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              {t.search.noResults}
            </div>
          )}

          {hasResults && !loading && (
            <div className="py-1">
              {items.map((item, idx) => {
                const showHeader = item.type !== lastType;
                lastType = item.type;
                return (
                  <div key={`${item.type}-${item.id}`}>
                    {showHeader && (
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {typeLabel(item.type)}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onClick={() => navigateTo(item.route)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-start text-sm transition-colors ${
                        idx === selectedIdx ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {iconForType(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.label}</p>
                        <p className="truncate text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {hasResults && (
            <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400 flex justify-between">
              <span>{totalResults} {t.search.resultsFound}</span>
              <span>↑↓ {t.search.navigate} · ↵ {t.search.select} · Esc {t.search.closeHint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
