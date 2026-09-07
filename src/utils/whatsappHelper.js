import { Linking, Platform } from 'react-native';
import { formatCurrency } from './formatters';

export const cleanPhoneNumber = (phone = '') => {
  let clean = String(phone || '').replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '58' + clean.slice(1);
  } else if (clean.length === 10 && !clean.startsWith('58')) {
    clean = '58' + clean;
  }
  return clean;
};

export const buildRestaurantBillingMessage = (restaurant) => {
  return `Estimado Cliente:

Le recordamos que la mensualidad correspondiente a su aplicación *Maseasy tu sistema operativo de gestion* vence el 01 de este mes de 2026. Para garantizar la continuidad de sus servicios, le invitamos a realizar el pago.

*si se pasa de la fecha limite 03 de este mes quedaría cortado el sistema y para la reconexion debe pagar 15$ adicional*

*Importante:*
Debido a la actual volatilidad del mercado cambiario, lamentamos informarles que, por el momento, *no* podemos aceptar pagos en bolívares. Agradecemos su comprensión ante esta situación.

FORMAS DE PAGO ACEPTADAS:
* Efectivo en dólares americanos
* Zelle: cotufassystem@gmail.com (Sofía Mora)
* Binance: michelleazorca@gmail.com

Agradecemos su pronta atención a este asunto. Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.

Atentamente,
Javier Mora
Departamento de Administración
Cotufas System`;
};

export const buildEmployeeMovementMessage = ({
  employee,
  movementType = 'advance',
  amount = '',
  note = '',
  paymentMethod = '',
  date = '',
}) => {
  const titles = {
    advance: 'ADELANTO DE SUELDO',
    payroll: 'PAGO DE NÓMINA / SUELDO',
    bonus: 'BONO / RECOMPENSA',
    general: 'COMPROBANTE DE PAGO',
  };

  const title = titles[movementType] || 'COMPROBANTE DE MOVIMIENTO';
  const displayDate = date || new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const lines = [
    `*COTUFAS SYSTEM - ${title}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Colaborador:* ${employee?.name || ''}`,
  ];

  if (employee?.idCard) {
    lines.push(`🪪 *C.I.:* ${employee.idCard}`);
  }
  if (employee?.area) {
    lines.push(`💼 *Cargo / Área:* ${employee.area}`);
  }

  lines.push('');

  const numAmount = parseFloat(amount);
  if (!isNaN(numAmount) && numAmount > 0) {
    lines.push(`💰 *Monto:* ${formatCurrency(numAmount)}`);
  } else if (amount) {
    lines.push(`💰 *Monto:* ${amount}`);
  }

  lines.push(`📅 *Fecha:* ${displayDate}`);

  if (paymentMethod) {
    lines.push(`💳 *Forma de Pago:* ${paymentMethod}`);
  }
  if (note && note.trim()) {
    lines.push(`📝 *Concepto / Nota:* ${note.trim()}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Comprobante administrativo emitido por Cotufas System._`);

  return lines.join('\n');
};

export const sendWhatsAppMessage = (phone, text) => {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url).catch((err) => console.error('Error opening WhatsApp:', err));
  }
};

