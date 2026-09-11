import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatDate } from '../../utils/formatters';

export const HeaderNotificationsModal = ({
  visible,
  onClose,
  tomorrowEvents = [],
  todayEvents = [],
  pendingAttendances = [],
  onValidateOne,
  onRejectOne,
  onValidateAll,
  onGoToAgenda,
  onPlayAlarm,
}) => {
  const [activeTab, setActiveTab] = useState(() =>
    tomorrowEvents.length > 0 || todayEvents.length > 0 ? 'agenda' : 'attendance'
  );

  const totalAgendaReminders = tomorrowEvents.length + todayEvents.length;
  const pendingAttendanceCount = pendingAttendances.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.notifCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Centro de Notificaciones & Alarmas</Text>
                <Text style={styles.notifSubTitle}>
                  {totalAgendaReminders > 0
                    ? `Tienes ${totalAgendaReminders} cita(s)/reunión(es) próximas`
                    : 'Cotufas System'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'agenda' && styles.tabBtnActive]}
              onPress={() => setActiveTab('agenda')}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={14} color={activeTab === 'agenda' ? THEME.colors.primary : THEME.colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'agenda' && styles.tabTextActive]}>
                Citas y Reuniones ({totalAgendaReminders})
              </Text>
              {tomorrowEvents.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>Mañana: {tomorrowEvents.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'attendance' && styles.tabBtnActive]}
              onPress={() => setActiveTab('attendance')}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={14} color={activeTab === 'attendance' ? THEME.colors.primary : THEME.colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>
                Asistencias ({pendingAttendanceCount})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={true}>
            {/* TAB 1: AGENDA Y CITAS DE MAÑANA / HOY */}
            {activeTab === 'agenda' && (
              <View style={styles.section}>
                {/* Alarm bar */}
                <View style={styles.alarmBar}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alarmBarTitle}>🔔 Alarma de Recordatorios</Text>
                    <Text style={styles.alarmBarSub}>Avisa automáticamente 24 horas antes de cada evento</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <TouchableOpacity style={styles.chimeBtn} onPress={onPlayAlarm} activeOpacity={0.7}>
                      <Ionicons name="volume-high" size={14} color="#ffffff" />
                      <Text style={styles.chimeBtnText}>Probar Sonido</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tomorrow Events */}
                {tomorrowEvents.length > 0 && (
                  <View style={styles.group}>
                    <View style={styles.groupHeaderRow}>
                      <View style={styles.badgeTomorrow}>
                        <Ionicons name="alert-circle" size={13} color="#ffffff" />
                        <Text style={styles.badgeTomorrowText}>MAÑANA ({tomorrowEvents.length} Evento{tomorrowEvents.length > 1 ? 's' : ''})</Text>
                      </View>
                    </View>

                    {tomorrowEvents.map((item, idx) => (
                      <View key={`tm-${item.id || idx}`} style={styles.agendaItemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.agendaItemTitle}>📌 {item.title}</Text>
                          <Text style={styles.agendaItemTime}>⏰ Hora: {item.dateTime?.split(' ')[1] || item.dateTime} • {formatDate(item.dateTime?.slice(0, 10))}</Text>
                          {item.client ? <Text style={styles.agendaItemClient}>👤 Cliente / Contacto: {item.client}</Text> : null}
                          {item.note ? <Text style={styles.agendaItemNote}>📝 {item.note}</Text> : null}
                        </View>
                        <TouchableOpacity
                          style={styles.actionLinkBtn}
                          onPress={() => { onGoToAgenda?.(); onClose(); }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="eye-outline" size={13} color={THEME.colors.primary} />
                          <Text style={styles.actionLinkText}>Ver</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Today Events */}
                {todayEvents.length > 0 && (
                  <View style={styles.group}>
                    <View style={styles.groupHeaderRow}>
                      <View style={styles.badgeToday}>
                        <Ionicons name="today-outline" size={13} color="#ffffff" />
                        <Text style={styles.badgeTodayText}>HOY ({todayEvents.length})</Text>
                      </View>
                    </View>

                    {todayEvents.map((item, idx) => (
                      <View key={`td-${item.id || idx}`} style={styles.agendaItemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.agendaItemTitle}>📌 {item.title}</Text>
                          <Text style={styles.agendaItemTime}>⏰ Hora: {item.dateTime?.split(' ')[1] || item.dateTime}</Text>
                          {item.client ? <Text style={styles.agendaItemClient}>👤 {item.client}</Text> : null}
                        </View>
                        <TouchableOpacity
                          style={styles.actionLinkBtn}
                          onPress={() => { onGoToAgenda?.(); onClose(); }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="eye-outline" size={13} color={THEME.colors.primary} />
                          <Text style={styles.actionLinkText}>Ver</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {totalAgendaReminders === 0 && (
                  <View style={styles.emptyBox}>
                    <Ionicons name="calendar-clear-outline" size={32} color={THEME.colors.textDim} />
                    <Text style={styles.emptyTitle}>Sin Citas Próximas</Text>
                    <Text style={styles.emptySub}>No tienes citas ni reuniones agendadas para hoy ni mañana.</Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB 2: ASISTENCIAS PENDIENTES */}
            {activeTab === 'attendance' && (
              <View style={styles.section}>
                {pendingAttendanceCount > 0 ? (
                  <>
                    {pendingAttendances.map((item, idx) => (
                      <View key={`${item.dateKey}-${item.empId}-${idx}`} style={styles.notifItem}>
                        <View style={styles.notifItemInfo}>
                          <View style={styles.notifItemHeader}>
                            <Text style={styles.notifItemName}>{item.employeeName}</Text>
                            <View style={styles.notifTimeBadge}>
                              <Ionicons name="time-outline" size={12} color={THEME.colors.primary} />
                              <Text style={styles.notifTimeText}>{item.notifiedAt}</Text>
                            </View>
                          </View>
                          <Text style={styles.notifItemDate}>Fecha: {item.dateKey} • {item.area}</Text>
                          <Text style={styles.notifItemNote}>💬 {item.note}</Text>
                        </View>

                        <View style={styles.notifItemActions}>
                          <TouchableOpacity
                            style={styles.notifApproveBtn}
                            onPress={() => onValidateOne(item.dateKey, item.empId)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark-circle" size={15} color="#ffffff" />
                            <Text style={styles.notifApproveText}>Aprobar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.notifRejectBtn}
                            onPress={() => onRejectOne(item.dateKey, item.empId)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close-circle" size={15} color={THEME.colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyBox}>
                    <Ionicons name="checkmark-done-circle-outline" size={32} color={THEME.colors.success} />
                    <Text style={styles.emptyTitle}>Todo al día</Text>
                    <Text style={styles.emptySub}>No hay asistencias pendientes por validar.</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.chimeBtn, { backgroundColor: '#3b82f6', marginRight: 'auto' }]}
              onPress={async () => {
                try {
                  if (typeof Notification !== 'undefined') {
                    const res = await Notification.requestPermission();
                    if (res !== 'granted') {
                      alert('Por favor autoriza las notificaciones en el navegador para activar el globo en el icono.');
                      return;
                    }
                  }
                  const { updateAppBadge } = require('../../services/badgeService');
                  await updateAppBadge(5);
                  alert('¡Prueba enviada! Revisa el icono de la app en tu pantalla o pestaña.');
                } catch (e) {
                  alert('Error al probar: ' + e.message);
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-circle" size={15} color="#ffffff" />
              <Text style={styles.chimeBtnText}>Probar Globo (5)</Text>
            </TouchableOpacity>

            {activeTab === 'attendance' && pendingAttendanceCount > 0 ? (
              <TouchableOpacity style={styles.validateAllBtn} onPress={onValidateAll} activeOpacity={0.8}>
                <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                <Text style={styles.validateAllBtnText}>Validar Todas ({pendingAttendanceCount})</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.footerCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.footerCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  notifCard: { width: '100%', maxWidth: 540, maxHeight: '85%', backgroundColor: '#ffffff', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(37, 99, 235, 0.15)' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: THEME.colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  notifSubTitle: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 1 },
  modalCloseBtn: { padding: 4 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(37, 99, 235, 0.12)', backgroundColor: '#f8fafc' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: THEME.colors.primary, backgroundColor: '#ffffff' },
  tabText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: THEME.colors.primaryDark, fontWeight: '800' },
  tabBadge: { backgroundColor: '#ea580c', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { color: '#ffffff', fontSize: 9.5, fontWeight: '900' },
  contentScroll: { padding: 12 },
  section: { gap: 10 },
  alarmBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(234, 88, 12, 0.08)', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.2)' },
  alarmBarTitle: { color: '#ea580c', fontSize: 12, fontWeight: '800' },
  alarmBarSub: { color: THEME.colors.textMuted, fontSize: 10.5, marginTop: 1 },
  chimeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ea580c', paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  chimeBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  group: { gap: 6 },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  badgeTomorrow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ea580c', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm },
  badgeTomorrowText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  badgeToday: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm },
  badgeTodayText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  agendaItemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', gap: 8 },
  agendaItemTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  agendaItemTime: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2 },
  agendaItemClient: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 1 },
  agendaItemNote: { color: THEME.colors.textDim, fontSize: 10.5, fontStyle: 'italic', marginTop: 2 },
  actionLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  actionLinkText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  notifItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(37, 99, 235, 0.05)', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', gap: 8 },
  notifItemInfo: { flex: 1, gap: 2 },
  notifItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifItemName: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  notifTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: THEME.radius.sm },
  notifTimeText: { color: THEME.colors.primaryDark, fontSize: 10, fontWeight: '700' },
  notifItemDate: { color: THEME.colors.textMuted, fontSize: 11 },
  notifItemNote: { color: THEME.colors.accent, fontSize: 10.5, fontStyle: 'italic' },
  notifItemActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifApproveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  notifApproveText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  notifRejectBtn: { padding: 4 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 6 },
  emptyTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  emptySub: { color: THEME.colors.textDim, fontSize: 11, textAlign: 'center' },
  modalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(37, 99, 235, 0.15)', gap: 10, backgroundColor: '#f8fafc' },
  validateAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: THEME.radius.sm },
  validateAllBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  footerCloseBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgSurface },
  footerCloseText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
});
