import { useMemo, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { getLocalDateString } from '../utils/formatters';

export const playChimeSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // First chime note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Second chime note (higher)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.18); // A5
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    // Autoplay restrictions or unsupported
  }
};

export const useAgendaReminders = (agenda = [], negotiations = []) => {
  const alertedRef = useRef(false);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    return getLocalDateString(tm);
  }, []);

  const allEvents = useMemo(() => [
    ...agenda.map(a => ({ ...a, eventType: 'agenda' })),
    ...negotiations.map(n => ({
      ...n,
      eventType: 'negotiation',
      title: n.title || `Negociación con ${n.client || 'Cliente'}`,
    })),
  ], [agenda, negotiations]);

  const todayEvents = useMemo(() =>
    allEvents.filter(e => (e.dateTime || '').startsWith(todayStr)),
    [allEvents, todayStr]
  );

  const tomorrowEvents = useMemo(() =>
    allEvents.filter(e => (e.dateTime || '').startsWith(tomorrowStr)),
    [allEvents, tomorrowStr]
  );

  const totalRemindersCount = todayEvents.length + tomorrowEvents.length;

  // Auto trigger alarm sound and notification on initial load if tomorrow has events
  useEffect(() => {
    if (totalRemindersCount > 0 && !alertedRef.current) {
      alertedRef.current = true;
      playChimeSound();

      if (Platform.OS === 'web' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const first = tomorrowEvents[0] || todayEvents[0];
          new Notification('🔔 Cotufas System - Recordatorio de Cita', {
            body: `Tienes ${totalRemindersCount} compromiso(s) programado(s). Próximo: ${first?.title || 'Reunión'} (${first?.dateTime || ''})`,
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    }
  }, [totalRemindersCount, tomorrowEvents, todayEvents]);

  return {
    todayStr,
    tomorrowStr,
    todayEvents,
    tomorrowEvents,
    totalRemindersCount,
    playAlarm: playChimeSound,
  };
};
