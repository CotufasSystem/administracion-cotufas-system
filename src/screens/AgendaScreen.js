import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { CalendarView } from '../components/agenda/CalendarView';
import { AgendaModal } from '../components/agenda/AgendaModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { autoDispatchTomorrowReminders, getSentReminders, buildReminderEmailContent } from '../utils/emailNotifier';
import { formatCurrency, formatDate, getLocalDateString } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const AgendaScreen = () => {
  const { agenda, saveAgendaItem, deleteAgendaItem, negotiations, saveNegotiation, deleteNegotiation } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [modalState, setModalState] = useState({ visible: false, item: null, isNegotiation: false });
  const [deletingId, setDeletingId] = useState(null);
  const [sentLog, setSentLog] = useState({});

  const tomorrowStr = useMemo(() => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    return getLocalDateString(tm);
  }, []);

  const allEvents = useMemo(() => [
    ...agenda.map(a => ({ ...a, type: 'agenda' })),
    ...negotiations.map(n => ({ ...n, type: 'negotiation' }))
  ], [agenda, negotiations]);

  const tomorrowEvents = allEvents.filter(e => (e.dateTime || '').startsWith(tomorrowStr));
  const selectedDateEvents = allEvents.filter(e => (e.dateTime || '').startsWith(selectedDate));
  const totalPipeline = negotiations.filter(n => n.status === 'ongoing').reduce((acc, n) => acc + (Number(n.dealAmount) || 0), 0);
  const totalWonDeals = negotiations.filter(n => n.status === 'won').reduce((acc, n) => acc + (Number(n.dealAmount) || 0), 0);

  useEffect(() => {
    const runAutoDispatch = async () => {
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      await autoDispatchTomorrowReminders(allEvents);
      const log = await getSentReminders();
      setSentLog(log || {});
    };
    runAutoDispatch();
  }, [allEvents]);

  const handleSendReminderEmail = (item) => {
    const targetEmail = (item.email || item.contactEmail || '').trim();
    const { subject, body } = buildReminderEmailContent(item, item.dateTime?.slice(0, 10) || tomorrowStr);
    if (Platform.OS === 'web') {
      window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    } else {
      Alert.alert('Recordatorio', `Abriendo correo hacia ${targetEmail || 'cliente'}...`);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topActions}>
          <PrimaryButton title="+ Cita" icon="calendar" onPress={() => setModalState({ visible: true, item: { dateTime: `${selectedDate} 10:00` }, isNegotiation: false })} small />
          <PrimaryButton title="+ Negociación" icon="briefcase" variant="warning" onPress={() => setModalState({ visible: true, item: { dateTime: `${selectedDate} 10:00` }, isNegotiation: true })} small />
        </View>
      </View>

      {/* Tomorrow Automatic Reminder Banner */}
      {tomorrowEvents.length > 0 && (
        <Card style={styles.reminderBanner}>
          <View style={styles.reminderHeader}>
            <Ionicons name="notifications" size={18} color={THEME.colors.primary} />
            <Text style={styles.reminderTitle}>Recordatorio Automático: {tomorrowEvents.length} Cita(s) para Mañana ({formatDate(tomorrowStr)})</Text>
          </View>
          {tomorrowEvents.map(e => {
            const email = e.email || e.contactEmail;
            const logKey = `${e.id}_${tomorrowStr}`;
            const isAutoSent = Boolean(sentLog[logKey]);

            return (
              <View key={e.id} style={styles.reminderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderItemTitle}>📌 {e.title} {e.client ? `(${e.client})` : ''}</Text>
                  <Text style={styles.reminderItemTime}>Hora: {e.dateTime} • {email ? `📧 ${email}` : '⚠️ Sin correo registrado'}</Text>
                  {isAutoSent && (
                    <Text style={styles.autoSentText}>✅ Notificación enviada automáticamente a las 24h previas</Text>
                  )}
                </View>
                <View style={styles.bannerActionGroup}>
                  {!email && (
                    <TouchableOpacity
                      style={styles.addEmailBtn}
                      onPress={() => setModalState({ visible: true, item: e, isNegotiation: e.type === 'negotiation' })}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={13} color={THEME.colors.primary} />
                      <Text style={styles.addEmailBtnText}>+ Asignar Correo</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.emailBtn, isAutoSent && styles.emailBtnSent]} onPress={() => handleSendReminderEmail(e)} activeOpacity={0.8}>
                    <Ionicons name={isAutoSent ? "checkmark-done" : "mail"} size={13} color="#ffffff" />
                    <Text style={styles.emailBtnText}>
                      {isAutoSent ? "Re-enviar" : "Enviar Correo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* Interactive Calendar Card */}
      <Card title="Calendario Mensual Interactivo" icon="calendar-outline">
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} events={allEvents} />
      </Card>

      {/* Selected Day Agenda */}
      <Card title={`Actividades: ${formatDate(selectedDate)} (${selectedDateEvents.length})`} icon="time-outline">
        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map((item) => {
            const isNeg = item.type === 'negotiation';
            return (
              <View key={item.id} style={styles.cardItem}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.client ? <Text style={styles.itemClient}>Cliente: {item.client}</Text> : null}
                    {item.email ? <Text style={styles.emailSub}>📧 {item.email}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.emailMiniBtn} onPress={() => handleSendReminderEmail(item)} title="Enviar Recordatorio">
                    <Ionicons name="mail-outline" size={14} color={THEME.colors.primary} />
                    <Text style={styles.emailMiniText}>Recordatorio</Text>
                  </TouchableOpacity>
                </View>

                {item.dealAmount > 0 && <Text style={styles.dealText}>Monto: {formatCurrency(item.dealAmount)}</Text>}
                {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
                <Text style={styles.timeText}>Hora: {item.dateTime}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => setModalState({ visible: true, item, isNegotiation: isNeg })} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={13} color={THEME.colors.primary} />
                    <Text style={styles.actionBtnText}>Editar / Correo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDeletingId({ id: item.id, isNeg })} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={13} color={THEME.colors.danger} />
                    <Text style={[styles.actionBtnText, { color: THEME.colors.danger }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noEventsBox}>
            <Ionicons name="calendar-outline" size={24} color={THEME.colors.textDim} />
            <Text style={styles.emptyText}>Sin citas ni negociaciones para este día.</Text>
          </View>
        )}
      </Card>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Pipeline de Negociación</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.primary }]}>{formatCurrency(totalPipeline)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Negociaciones Ganadas</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.success }]}>{formatCurrency(totalWonDeals)}</Text>
        </View>
      </View>

      <AgendaModal
        visible={modalState.visible}
        item={modalState.item}
        isNegotiation={modalState.isNegotiation}
        onClose={() => setModalState({ visible: false, item: null, isNegotiation: false })}
        onSave={(data) => modalState.isNegotiation ? saveNegotiation(data) : saveAgendaItem(data)}
      />

      <PinConfirmModal
        visible={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => { if (deletingId) { if (deletingId.isNeg) deleteNegotiation(deletingId.id); else deleteAgendaItem(deletingId.id); } }}
        title="Eliminar Evento de Agenda"
        description="Esta cita o negociación será eliminada permanentemente."
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  topActions: { flexDirection: 'row', gap: 6 },
  reminderBanner: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.2)', borderWidth: 1, gap: 8 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reminderTitle: { color: THEME.colors.primary, fontSize: 13, fontWeight: '800' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 10, borderRadius: THEME.radius.md, gap: 8, flexWrap: 'wrap', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  reminderItemTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  reminderItemTime: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  autoSentText: { color: THEME.colors.success, fontSize: 10, fontWeight: '700', marginTop: 3 },
  bannerActionGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addEmailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  addEmailBtnText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  emailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  emailBtnSent: { backgroundColor: THEME.colors.success },
  emailBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  kpiGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 150, marginBottom: 0, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.lg, padding: 14 },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  cardItem: { backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: 12, borderRadius: THEME.radius.md, marginBottom: 8, gap: 4, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { color: THEME.colors.textMain, fontSize: 15, fontWeight: '700' },
  itemClient: { color: THEME.colors.textMuted, fontSize: 12, marginTop: 2 },
  emailSub: { color: THEME.colors.textDim, fontSize: 11, marginTop: 2 },
  emailMiniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  emailMiniText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  dealText: { color: THEME.colors.success, fontSize: 14, fontWeight: '800' },
  notesText: { color: THEME.colors.textMuted, fontSize: 12 },
  timeText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(37, 99, 235, 0.15)', paddingTop: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: THEME.colors.primary },
  noEventsBox: { alignItems: 'center', paddingVertical: 14, gap: 6 },
  emptyText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic' },
});
