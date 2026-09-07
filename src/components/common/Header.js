import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useAgendaReminders } from '../../hooks/useAgendaReminders';
import { HeaderNotificationsModal } from './HeaderNotificationsModal';
import { HeaderMobileMenuModal } from './HeaderMobileMenuModal';

export const Header = ({ title, subtitle, currentTab, onSelectTab }) => {
  const {
    logout,
    employees = [],
    attendance = {},
    agenda = [],
    negotiations = [],
    validateAttendance,
    validateAllPendingAttendance,
    setEmployeeAttendance,
  } = useApp();

  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isMobile = width < 768;
  const isSmall = width < 480;

  // Reminders for tomorrow and today
  const { tomorrowEvents, todayEvents, totalRemindersCount, playAlarm } = useAgendaReminders(agenda, negotiations);

  // Pending attendances
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

  const pendingCount = pendingAttendances.length;
  const hasTomorrowAlarm = tomorrowEvents.length > 0;
  const totalAlertsCount = pendingCount + totalRemindersCount;

  const handleSelectSection = (id) => {
    if (onSelectTab) onSelectTab(id);
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleValidateAll = () => {
    const uniqueDates = Array.from(new Set(pendingAttendances.map((p) => p.dateKey)));
    uniqueDates.forEach((d) => validateAllPendingAttendance(d));
    setIsNotificationsOpen(false);
  };

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
          {/* Notifications & Agenda Alarm Button */}
          <TouchableOpacity
            style={[
              styles.notifBtn,
              hasTomorrowAlarm ? styles.notifBtnAlarm : (pendingCount > 0 ? styles.notifBtnActive : null),
            ]}
            onPress={() => setIsNotificationsOpen(true)}
            activeOpacity={0.8}
            title="Notificaciones"
          >
            <View style={styles.bellWrapper}>
              <Ionicons
                name={totalAlertsCount > 0 ? "notifications" : "notifications-outline"}
                size={18}
                color={hasTomorrowAlarm ? "#ea580c" : (pendingCount > 0 ? "#ffffff" : THEME.colors.textMuted)}
              />
              {totalAlertsCount > 0 && (
                <View style={[styles.badgeDot, hasTomorrowAlarm && styles.badgeDotAlarm]}>
                  <Text style={styles.badgeDotText}>{totalAlertsCount > 99 ? '99+' : totalAlertsCount}</Text>
                </View>
              )}
            </View>
            {!isSmall && (
              <Text style={[styles.notifText, hasTomorrowAlarm ? styles.notifTextAlarm : (pendingCount > 0 && styles.notifTextActive)]}>
                Notificaciones
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

      {/* Notifications & Alarms Modal */}
      <HeaderNotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        tomorrowEvents={tomorrowEvents}
        todayEvents={todayEvents}
        pendingAttendances={pendingAttendances}
        onValidateOne={(dateKey, empId) => validateAttendance(dateKey, empId)}
        onRejectOne={(dateKey, empId) => setEmployeeAttendance(dateKey, empId, null)}
        onValidateAll={handleValidateAll}
        onGoToAgenda={() => handleSelectSection('agenda')}
        onPlayAlarm={playAlarm}
      />

      {/* Mobile Navigation Drawer */}
      <HeaderMobileMenuModal
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentTab={currentTab}
        onSelectSection={handleSelectSection}
      />
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
  notifBtnAlarm: { backgroundColor: 'rgba(234, 88, 12, 0.1)', borderColor: 'rgba(234, 88, 12, 0.35)' },
  bellWrapper: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  badgeDot: { position: 'absolute', top: -6, right: -8, backgroundColor: THEME.colors.danger, borderRadius: 9, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#ffffff' },
  badgeDotAlarm: { backgroundColor: '#ea580c' },
  badgeDotText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  notifText: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  notifTextActive: { color: '#ffffff', fontWeight: '800' },
  notifTextAlarm: { color: '#ea580c', fontWeight: '800' },
  mobileMenuBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 9, paddingVertical: 6, borderRadius: THEME.radius.sm },
  mobileMenuBtnText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, gap: 5 },
  logoutBtnSmall: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700' },
});
