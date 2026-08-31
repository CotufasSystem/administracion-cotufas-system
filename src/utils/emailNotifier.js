import { Platform } from 'react-native';
import { getLocalDateString, formatDate } from './formatters';

const SENT_REMINDERS_KEY = '@cotufas_sent_reminders';

export const getSentReminders = async () => {
  try {
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem(SENT_REMINDERS_KEY);
      return stored ? JSON.parse(stored) : {};
    }
  } catch (e) {
    console.error('Error reading sent reminders', e);
  }
  return {};
};

export const markReminderAsSent = async (eventId, dateStr, email) => {
  try {
    const key = `${eventId}_${dateStr}`;
    const sent = await getSentReminders();
    sent[key] = {
      sentAt: new Date().toISOString(),
      email,
      dateStr,
    };
    if (Platform.OS === 'web') {
      localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(sent));
    }
    return sent;
  } catch (e) {
    console.error('Error saving sent reminder', e);
  }
};

export const buildReminderEmailContent = (item, tomorrowStr) => {
  const subject = encodeURIComponent(`⏰ Recordatorio de Cita Mañana: ${item.title} - Cotufas System`);
  const body = encodeURIComponent(
    `Estimado(a) ${item.contactName || item.client || 'Cliente'},\n\n` +
    `Le recordamos que el día de MAÑANA (${formatDate(tomorrowStr)}) tiene una cita programada con el equipo de Cotufas System.\n\n` +
    `📌 Asunto / Motivo: ${item.title}\n` +
    `⏰ Hora pautada: ${item.time || 'A coordinar'}\n` +
    `🏢 Modalidad / Ubicación: ${item.location || item.type || 'Oficina / Virtual'}\n` +
    `${item.description ? `📝 Notas: ${item.description}\n` : ''}\n` +
    `Por favor confirmar su asistencia respondiendo a este mensaje.\n\n` +
    `Atentamente,\nDirección General & Administración - Cotufas System`
  );
  return { subject, body };
};

export const autoDispatchTomorrowReminders = async (agenda = [], onNotificationSent) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);
  const sentLog = await getSentReminders();

  const tomorrowEvents = agenda.filter(item => item.date === tomorrowStr && (item.contactEmail || item.email));
  const newlyDispatched = [];

  for (const item of tomorrowEvents) {
    const targetEmail = (item.contactEmail || item.email || '').trim();
    if (!targetEmail) continue;

    const logKey = `${item.id}_${tomorrowStr}`;
    if (!sentLog[logKey]) {
      const { subject, body } = buildReminderEmailContent(item, tomorrowStr);
      
      // Auto-trigger mailto background link or web notification
      if (Platform.OS === 'web') {
        const mailUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
        const hiddenIframe = document.createElement('iframe');
        hiddenIframe.style.display = 'none';
        hiddenIframe.src = mailUrl;
        document.body.appendChild(hiddenIframe);
        setTimeout(() => {
          if (hiddenIframe.parentNode) hiddenIframe.parentNode.removeChild(hiddenIframe);
        }, 1500);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Recordatorio Enviado a ${item.contactName || item.title}`, {
            body: `Cita mañana a las ${item.time || '10:00 AM'} con ${targetEmail}`,
            icon: '🍿'
          });
        }
      }

      await markReminderAsSent(item.id, tomorrowStr, targetEmail);
      newlyDispatched.push({ id: item.id, title: item.title, email: targetEmail, time: item.time });
    }
  }

  if (newlyDispatched.length > 0 && onNotificationSent) {
    onNotificationSent(newlyDispatched);
  }

  return newlyDispatched;
};
