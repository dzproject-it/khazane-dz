import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, X } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import type { StockMovement, PaginatedResponse } from '../types';

interface StockExitVoucherProps {
  open: boolean;
  onClose: () => void;
}

export function StockExitVoucher({ open, onClose }: StockExitVoucherProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();
  const { theme } = useTheme();

  const { data, isLoading } = useQuery<PaginatedResponse<StockMovement>>({
    queryKey: ['movements-out-voucher'],
    queryFn: () =>
      api.get('/movements', { params: { page: 1, per_page: 100, type: 'OUT' } }).then((r) => r.data),
    enabled: open,
  });

  if (!open) return null;

  const movements = data?.data || [];
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR';
  const now = new Date();
  const voucherNumber = `BS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const totalQty = movements.reduce((sum, m) => sum + m.quantity, 0);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <title>${t.voucher.title} - ${voucherNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 20mm; font-size: 11pt; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #1e3a5f; padding-bottom: 16px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-left img { max-height: 50px; max-width: 120px; }
    .company-name { font-size: 16pt; font-weight: 700; color: #1e3a5f; }
    .header-right { text-align: ${locale === 'ar' ? 'left' : 'right'}; font-size: 10pt; color: #555; }
    .voucher-title { text-align: center; font-size: 18pt; font-weight: 700; color: #1e3a5f; margin: 20px 0; text-transform: uppercase; letter-spacing: 2px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; margin-bottom: 20px; padding: 12px 16px; background: #f5f7fa; border-radius: 6px; font-size: 10pt; }
    .meta-grid .label { font-weight: 600; color: #333; }
    .meta-grid .value { color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #1e3a5f; color: white; padding: 10px 8px; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; text-align: ${locale === 'ar' ? 'right' : 'left'}; }
    tbody td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 10pt; vertical-align: top; }
    tbody tr:nth-child(even) { background: #fafbfc; }
    tbody tr:hover { background: #f0f4f8; }
    .num-col { text-align: center; font-weight: 600; }
    .qty-col { text-align: center; font-weight: 700; font-size: 11pt; }
    .totals-row { background: #e8edf2 !important; font-weight: 700; }
    .totals-row td { border-top: 2px solid #1e3a5f; padding: 10px 8px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig-block { text-align: center; }
    .sig-label { font-weight: 600; font-size: 10pt; margin-bottom: 50px; color: #333; }
    .sig-line { border-top: 1px solid #999; padding-top: 6px; font-size: 9pt; color: #666; }
    .footer { margin-top: 30px; text-align: center; font-size: 8pt; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 10mm; } }
  </style>
</head>
<body>`);

    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  }

  function formatLocation(m: StockMovement): string {
    const loc = m.sourceLocation;
    if (!loc) return '—';
    const parts: string[] = [];
    if (loc.zone?.site?.name) parts.push(loc.zone.site.name);
    if (loc.zone?.name) parts.push(loc.zone.name);
    if (loc.code) parts.push(loc.code);
    return parts.join(' › ') || '—';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      {/* Toolbar */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg"
          style={{ backgroundColor: `hsl(${theme.primaryHue}, ${theme.primarySaturation}%, 42%)` }}
        >
          <Printer size={18} />
          {t.voucher.print}
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
        >
          <X size={18} />
          {t.voucher.close}
        </button>
      </div>

      {/* Printable content */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-16">
        <div ref={printRef} className="p-10">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '3px solid #1e3a5f', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {theme.logoUrl && (
                <img src={theme.logoUrl} alt="Logo" style={{ maxHeight: 50, maxWidth: 120 }} />
              )}
              <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1e3a5f' }}>
                {theme.appName || 'Khazane-DZ'}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10pt', color: '#555' }}>
              <div><strong>{t.voucher.voucherNumber} :</strong> {voucherNumber}</div>
              <div><strong>{t.voucher.date} :</strong> {now.toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 700, color: '#1e3a5f', margin: '20px 0', textTransform: 'uppercase', letterSpacing: 2 }}>
            {t.voucher.title}
          </h1>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px', marginBottom: 20, padding: '12px 16px', background: '#f5f7fa', borderRadius: 6, fontSize: '10pt' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>{t.voucher.generatedOn} : </span>
              <span style={{ color: '#555' }}>{now.toLocaleString(dateLocale)}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: '#333' }}>{t.voucher.totalItems} : </span>
              <span style={{ color: '#555' }}>{movements.length}</span>
            </div>
            {movements.length > 0 && movements[0].client && (
              <div>
                <span style={{ fontWeight: 600, color: '#333' }}>{t.movements.client} : </span>
                <span style={{ color: '#555' }}>{movements[0].client.code} — {movements[0].client.name}</span>
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>{t.common.loading}</div>
          ) : movements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>{t.voucher.noExits}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', width: 40 }}>N°</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.ref}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.sku}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.product}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>{t.voucher.quantity}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.sourceLocation}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.reason}</th>
                  <th style={{ background: '#1e3a5f', color: 'white', padding: '10px 8px', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' }}>{t.voucher.date}</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m, idx) => (
                  <tr key={m.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontFamily: 'monospace', fontSize: '9pt' }}>{m.reference.slice(0, 8)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontFamily: 'monospace', fontSize: '9pt' }}>{m.product?.sku || '—'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{m.product?.name || '—'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'center', fontWeight: 700, fontSize: '11pt' }}>{m.quantity}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontSize: '9pt' }}>{formatLocation(m)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontSize: '9pt', color: '#555' }}>{m.reason || '—'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontSize: '9pt', color: '#555' }}>{new Date(m.createdAt).toLocaleDateString(dateLocale)}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ background: '#e8edf2', fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: '10px 8px', borderTop: '2px solid #1e3a5f', textAlign: 'right' }}>{t.voucher.totalQuantity}</td>
                  <td style={{ padding: '10px 8px', borderTop: '2px solid #1e3a5f', textAlign: 'center', fontSize: '12pt' }}>{totalQty}</td>
                  <td colSpan={3} style={{ padding: '10px 8px', borderTop: '2px solid #1e3a5f' }}></td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginTop: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '10pt', marginBottom: 50, color: '#333' }}>{t.voucher.preparedBy}</div>
              <div style={{ borderTop: '1px solid #999', paddingTop: 6, fontSize: '9pt', color: '#666' }}>{t.voucher.signature}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '10pt', marginBottom: 50, color: '#333' }}>{t.voucher.approvedBy}</div>
              <div style={{ borderTop: '1px solid #999', paddingTop: 6, fontSize: '9pt', color: '#666' }}>{t.voucher.signature}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '10pt', marginBottom: 50, color: '#333' }}>{t.voucher.receivedBy}</div>
              <div style={{ borderTop: '1px solid #999', paddingTop: 6, fontSize: '9pt', color: '#666' }}>{t.voucher.signature}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 30, textAlign: 'center', fontSize: '8pt', color: '#999', borderTop: '1px solid #ddd', paddingTop: 10 }}>
            {theme.appName || 'Khazane-DZ'} — {t.voucher.generatedOn} {now.toLocaleString(dateLocale)}
          </div>
        </div>
      </div>
    </div>
  );
}
