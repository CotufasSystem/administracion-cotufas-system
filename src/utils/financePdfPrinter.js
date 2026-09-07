import { formatCurrency, formatDate } from './formatters';
import { COTUFAS_LOGO_DATA_URL } from '../constants/logoDataUri';

export const printFinanceStatementPdf = ({
  profileImage,
  periodLabel,
  grandTotalIncome,
  grandTotalExpenses,
  projectsList = [],
  incomesList = [],
  receivableList = [],
  payrollList = [],
  advancesList = [],
  payableList = [],
}) => {
  const netFlow = grandTotalIncome - grandTotalExpenses;
  const nowStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const effectiveLogo = profileImage || COTUFAS_LOGO_DATA_URL;
  const logoHtml = effectiveLogo ? `<img src="${effectiveLogo}" alt="Logo" style="max-height: 46px; max-width: 120px; object-fit: contain;" />` : '';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Balance Financiero - Cotufas System</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { padding: 24px; color: #1e293b; background: #fff; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px; }
    .brand-box { display: flex; align-items: center; gap: 10px; }
    .brand-title { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #2563eb; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
    .report-meta { text-align: right; }
    .report-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
    .report-period { font-size: 12px; font-weight: 700; color: #2563eb; margin-top: 2px; }
    .report-date { font-size: 10px; color: #94a3b8; margin-top: 4px; }
    
    .summary-grid { display: flex; gap: 12px; margin-bottom: 20px; }
    .sum-card { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; }
    .sum-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .sum-val { font-size: 18px; font-weight: 900; margin-top: 4px; }
    .val-in { color: #16a34a; }
    .val-out { color: #dc2626; }
    .val-net { color: #d97706; }

    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 16px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; vertical-align: middle; }
    tr:nth-child(even) { background: #fafafa; }
    .text-right { text-align: right; }
    .amount { font-weight: 700; }
    .amount-in { color: #16a34a; }
    .amount-out { color: #dc2626; }
    .empty { color: #94a3b8; font-style: italic; padding: 8px; font-size: 11px; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
    
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; gap: 12px;">
      ${logoHtml}
      <div>
        <div class="brand-title">COTUFAS SYSTEM</div>
        <div class="brand-sub">Administración y Control Financiero</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">Estado de Cuenta y Balance</div>
      <div class="report-period">Período: ${periodLabel}</div>
      <div class="report-date">Emitido: ${nowStr}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="sum-card">
      <div class="sum-label">Total Entradas</div>
      <div class="sum-val val-in">+${formatCurrency(grandTotalIncome)}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Total Salidas / Pagos</div>
      <div class="sum-val val-out">-${formatCurrency(grandTotalExpenses)}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Balance / Flujo Neto</div>
      <div class="sum-val val-net">${netFlow >= 0 ? '+' : ''}${formatCurrency(netFlow)}</div>
    </div>
  </div>

  <!-- 1. Proyectos -->
  ${projectsList.length > 0 ? `
    <div class="section-title">💼 Facturación de Proyectos (+${formatCurrency(projectsList.reduce((s, p) => s + p.amount, 0))})</div>
    <table>
      <thead><tr><th>Proyecto</th><th>Detalle / Concepto</th><th class="text-right">Fecha / Frecuencia</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        ${projectsList.map(p => `<tr><td><strong>${p.title}</strong></td><td>${p.description}</td><td class="text-right">${p.date}</td><td class="text-right amount amount-in">+${formatCurrency(p.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- 2. Ingresos Extras -->
  ${incomesList.length > 0 ? `
    <div class="section-title">⭐ Ingresos Extras (+${formatCurrency(incomesList.reduce((s, i) => s + i.amount, 0))})</div>
    <table>
      <thead><tr><th>Concepto</th><th>Nota</th><th class="text-right">Fecha</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        ${incomesList.map(i => `<tr><td><strong>${i.title}</strong></td><td>${i.note || '-'}</td><td class="text-right">${formatDate(i.date)}</td><td class="text-right amount amount-in">+${formatCurrency(i.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- 3. Cuentas por Cobrar -->
  ${receivableList.length > 0 ? `
    <div class="section-title">🔵 Cuentas por Cobrar (+${formatCurrency(receivableList.reduce((s, d) => s + d.amount, 0))})</div>
    <table>
      <thead><tr><th>Deudor / Concepto</th><th>Nota</th><th class="text-right">Fecha</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        ${receivableList.map(d => `<tr><td><strong>${d.title}</strong></td><td>${d.note || '-'}</td><td class="text-right">${formatDate(d.date)}</td><td class="text-right amount amount-in">+${formatCurrency(d.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- 4. Nómina -->
  ${payrollList.length > 0 ? `
    <div class="section-title">👥 Nómina y Pagos a Empleados (-${formatCurrency(payrollList.reduce((s, p) => s + p.netPay, 0))})</div>
    <table>
      <thead><tr><th>Empleado</th><th>Área</th><th class="text-right">Salario Base</th><th class="text-right">Descuento Adelantos</th><th class="text-right">Fecha</th><th class="text-right">Neto Pagado</th></tr></thead>
      <tbody>
        ${payrollList.map(p => `<tr><td><strong>${p.empName}</strong></td><td>${p.area}</td><td class="text-right">${formatCurrency(p.salary)}</td><td class="text-right amount-out">-${formatCurrency(p.discount)}</td><td class="text-right">${formatDate(p.date)}</td><td class="text-right amount amount-out">-${formatCurrency(p.netPay)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- 5. Adelantos -->
  ${advancesList.length > 0 ? `
    <div class="section-title">💳 Adelantos Entregados (-${formatCurrency(advancesList.reduce((s, a) => s + a.amount, 0))})</div>
    <table>
      <thead><tr><th>Empleado / Concepto</th><th>Motivo</th><th class="text-right">Fecha Entrega</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        ${advancesList.map(a => `<tr><td><strong>${a.title}</strong></td><td>${a.note}</td><td class="text-right">${formatDate(a.date)}</td><td class="text-right amount amount-out">-${formatCurrency(a.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- 6. Deudas por Pagar -->
  ${payableList.length > 0 ? `
    <div class="section-title">🔴 Deudas por Pagar (-${formatCurrency(payableList.reduce((s, d) => s + d.amount, 0))})</div>
    <table>
      <thead><tr><th>Acreedor / Concepto</th><th>Nota</th><th class="text-right">Fecha Registro</th><th class="text-right">Monto</th></tr></thead>
      <tbody>
        ${payableList.map(d => `<tr><td><strong>${d.title}</strong></td><td>${d.note || '-'}</td><td class="text-right">${formatDate(d.date)}</td><td class="text-right amount amount-out">-${formatCurrency(d.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
  ` : ''}

  <div class="footer">
    <div>Cotufas System • Documento Confidencial de Control Interno</div>
    <div>Página 1 / 1</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }
};
