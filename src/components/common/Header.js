import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { NAV_ITEMS } from './Navigation';
import { useApp } from '../../context/AppContext';

export const Header = ({ title, subtitle, currentTab, onSelectTab }) => {
  const { logout, employees = [], attendance = {}, validateAttendance, validateAllPendingAttendance, setEmployeeAttendance } = useApp();
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isMobile = width < 768;
  const isSmall = width < 480;

  // Calculate all pending attendances across all dates
  const pendingAttendances = useMemo(() => {
    const list = [];
    Object.keys(attendance || {}).forEach((dateKey) => {
      const dayRecs = attendance[dateKey] || {};
      Object.keys(dayRecs).forEach((empId) => {
        const rec = dayRecs[empId];
        if (typeof rec === 'object' && rec?.pendingValidation) {
          const emp = (employees || []).find((e) => e.id === empId);
          list.push({
            dateKey,
            empId,
            employeeName: emp ? emp.name : 'Colaborador',
            area: emp?.area || 'Personal',
            notifiedAt: rec.notifiedAt || '--:--',
            note: rec.note || 'Notificación de asistencia',
          });
        }
      });
    });
    return list;
  }, [attendance, employees]);

  const handleSelectSection = (id) => {
    if (onSelectTab) onSelectTab(id);
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleValidateOne = (dateKey, empId) => {
    validateAttendance(dateKey, empId);
  };

  const handleRejectOne = (dateKey, empId) => {
    setEmployeeAttendance(dateKey, empId, null);
  };

  const handleValidateAll = () => {
    const uniqueDates = Array.from(new Set(pendingAttendances.map((p) => p.dateKey)));
    uniqueDates.forEach((d) => validateAllPendingAttendance(d));
    setIsNotificationsOpen(false);
  };

  const pendingCount = pendingAttendances.length;

  return (
    <>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.titleContainer}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={13} color={THEME.colors.primary} />
            <Text style={styles.badgeText}>ADMINISTRADOR • COTUFAS SYSTEM</Text>
          </View>
          <Text style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={1}>{title}</Text>
          {subtitle && !isSmall ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.headerRight}>
          {/* Attendance Notifications Bell Button */}
          <TouchableOpacity
            style={[
              styles.notifBtn,
              pendingCount > 0 && styles.notifBtnActive,
            ]}
            onPress={() => setIsNotificationsOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.bellWrapper}>
              <Ionicons
                name={pendingCount > 0 ? "notifications" : "notifications-outline"}
                size={18}
                color={pendingCount > 0 ? "#ffffff" : THEME.colors.textMuted}
              />
              {pendingCount > 0 && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
                </View>
              )}
            </View>
            {!isSmall && (
              <Text style={[styles.notifText, pendingCount > 0 && styles.notifTextActive]}>
                {pendingCount > 0 ? `${pendingCount} Asistencia${pendingCount > 1 ? 's' : ''}` : 'Asistencias'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Mobile Menu Button */}
          {isMobile && (
            <TouchableOpacity style={styles.mobileMenuBtn} onPress={() => setIsMenuOpen(true)} activeOpacity={0.7}>
              <Ionicons name="apps" size={17} color={THEME.colors.primary} />
              <Text style={styles.mobileMenuBtnText}>Menú</Text>
            </TouchableOpacity>
          )}

          {/* Lock / Logout Button */}
          <TouchableOpacity style={[styles.logoutBtn, isSmall && styles.logoutBtnSmall]} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="lock-closed" size={14} color={THEME.colors.danger} />
            {!isSmall && <Text style={styles.logoutText}>Bloquear</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal visible={isNotificationsOpen} transparent animationType="fade" onRequestClose={() => setIsNotificationsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.notifCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.notifIconHeader, pendingCount > 0 && styles.notifIconHeaderActive]}>
                  <Ionicons name="notifications" size={18} color={pendingCount > 0 ? '#ffffff' : THEME.colors.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Validación de Asistencias</Text>
                  <Text style={styles.notifSubTitle}>
                    {pendingCount > 0
                      ? `${pendingCount} colaborador${pendingCount > 1 ? 'es' : ''} esperando validación`
                      : 'No hay notificaciones pendientes'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsNotificationsOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {pendingCount > 0 ? (
              <>
                <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
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
                          style={styles.actionValidBtn}
                          onPress={() => handleValidateOne(item.dateKey, item.empId)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                          <Text style={styles.actionValidBtnText}>Validar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionRejectBtn}
                          onPress={() => handleRejectOne(item.dateKey, item.empId)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trash-outline" size={15} color={THEME.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.notifFooter}>
                  <TouchableOpacity
                    style={styles.validateAllFooterBtn}
                    onPress={handleValidateAll}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                    <Text style={styles.validateAllFooterBtnText}>Validar Todas ({pendingCount})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.gotoAttendanceBtn}
                    onPress={() => handleSelectSection('attendance')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="open-outline" size={15} color={THEME.colors.primary} />
                    <Text style={styles.gotoAttendanceBtnText}>Ver Módulo de Asistencias</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyNotifBox}>
                <Ionicons name="checkmark-circle-outline" size={52} color={THEME.colors.success} />
                <Text style={styles.emptyNotifTitle}>¡Todo al día!</Text>
                <Text style={styles.emptyNotifSub}>No tienes solicitudes de asistencia pendientes por validar en este momento.</Text>
                <TouchableOpacity
                  style={styles.gotoAttendanceBtn}
                  onPress={() => handleSelectSection('attendance')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people-outline" size={16} color={THEME.colors.primary} />
                  <Text style={styles.gotoAttendanceBtnText}>Ir al Control de Asistencia</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Mobile Navigation Grid Modal */}
      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="grid" size={18} color={THEME.colors.primary} />
                <Text style={styles.modalTitle}>Menú de Secciones ({NAV_ITEMS.length})</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {NAV_ITEMS.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <TouchableOpacity key={item.id} style={[styles.gridItem, isActive && styles.gridItemActive]} onPress={() => handleSelectSection(item.id)} activeOpacity={0.7}>
                    <View style={[styles.gridIconBox, isActive && styles.gridIconBoxActive]}>
                      <Ionicons name={isActive ? item.activeIcon : item.icon} size={18} color={isActive ? '#ffffff' : THEME.colors.primary} />
                    </View>
                    <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 8 },
  headerMobile: { paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.sm },
  titleContainer: { flex: 1, minWidth: 90 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  badgeText: { color: THEME.colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: THEME.colors.textMain, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  titleSmall: { fontSize: 15 },
  subtitle: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  notifBtnActive: { backgroundColor: THEME.colors.warning, borderColor: THEME.colors.warning },
  bellWrapper: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  badgeDot: { position: 'absolute', top: -6, right: -8, backgroundColor: THEME.colors.danger, borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#ffffff' },
  badgeDotText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  notifText: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  notifTextActive: { color: '#ffffff', fontWeight: '800' },
  mobileMenuBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 9, paddingVertical: 6, borderRadius: THEME.radius.sm },
  mobileMenuBtnText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, gap: 5 },
  logoutBtnSmall: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  notifCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, width: '100%', maxWidth: 520, maxHeight: '85%' },
  notifIconHeader: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  notifIconHeaderActive: { backgroundColor: THEME.colors.warning },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  notifSubTitle: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  modalCloseBtn: { padding: 4 },
  notifList: { maxHeight: 340, marginBottom: 12 },
  notifItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  notifItemInfo: { flex: 1 },
  notifItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  notifItemName: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  notifTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  notifTimeText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  notifItemDate: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  notifItemNote: { color: THEME.colors.textDim, fontSize: 11, fontStyle: 'italic' },
  notifItemActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionValidBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.success, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  actionValidBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  actionRejectBtn: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notifFooter: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, gap: 8 },
  validateAllFooterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.success, paddingVertical: 12, borderRadius: 10 },
  validateAllFooterBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  gotoAttendanceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  gotoAttendanceBtnText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '700' },
  emptyNotifBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  emptyNotifTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  emptyNotifSub: { color: THEME.colors.textMuted, fontSize: 12, textAlign: 'center', maxWidth: 300, marginBottom: 8 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, maxHeight: '85%' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 10, borderRadius: 10 },
  gridItemActive: { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.primary },
  gridIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  gridIconBoxActive: { backgroundColor: THEME.colors.primaryDark, borderColor: THEME.colors.primaryDark },
  gridLabel: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700', flex: 1 },
  gridLabelActive: { color: '#ffffff', fontWeight: '800' },
});

