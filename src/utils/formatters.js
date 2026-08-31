export const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const capitalize = (str) => {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const sortEmployeesByName = (employees = []) => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
};

export const getLocalDateString = (dateObj = new Date()) => {
  const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatDate = (dateInput = new Date()) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const [y, m, d] = dateInput.slice(0, 10).split('-').map(Number);
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
  }
  const d = new Date(dateInput);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
