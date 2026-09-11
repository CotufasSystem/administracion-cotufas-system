import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useAgendaReminders } from '../../hooks/useAgendaReminders';
import { HeaderNotificationsModal } from './HeaderNotificationsModal';
import { HeaderMobileMenuModal } from './HeaderMobileMenuModal';
import { updateAppBadge } from '../../services/badgeService';

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

  // Actualizar el globo con el número de notificaciones en el icono de la app / inicio
  React.useEffect(() => {
    updateAppBadge(totalAlertsCount);
  }, [totalAlertsCount]);

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
        {/* Left Side: Mobile Menu Drawer Toggle */}
        {isMobile && (
          <TouchableOpacity
            style={[styles.mobileMenuBtn, isSmall && styles.mobileMenuBtnSmall]}
            onPress={() => setIsMenuOpen(true)}
            activeOpacity={0.7}
            accessibilityLabel="Menú"
            title="Abrir Menú"
          >
            <Ionicons name="menu" size={isSmall ? 20 : 22} color={THEME.colors.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={isSmall ? 11 : 13} color={THEME.colors.primary} />
            <Text style={[styles.badgeText, isSmall && styles.badgeTextSmall]} numberOfLines={1}>
              {isSmall ? "ADMIN • COTUFAS" : "ADMINISTRADOR • COTUFAS SYSTEM"}
            </Text>
          </View>
          <Text style={[styles.title, isMobile && styles.titleMobile, isSmall && styles.titleSmall]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && !isSmall ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.headerRight}>
          {/* Notifications & Agenda Alarm Button */}
          <TouchableOpacity
            style={[
              styles.notifBtn,
              isSmall && styles.iconBtnCompact,
              hasTomorrowAlarm ? styles.notifBtnAlarm : (pendingCount > 0 ? styles.notifBtnActive : null),
            ]}
            onPress={() => setIsNotificationsOpen(true)}
            activeOpacity={0.8}
            title="Notificaciones"
          >
            <View style={styles.bellWrapper}>
              <Ionicons
                name={totalAlertsCount > 0 ? "notifications" : "notifications-outline"}
                size={isSmall ? 17 : 18}
                color={hasTomorrowAlarm ? "#ea580c" : (pendingCount > 0 ? "#ffffff" : THEME.colors.textMuted)}
              />
              {totalAlertsCount > 0 && (
                <View style={[styles.badgeDot, hasTomorrowAlarm && styles.badgeDotAlarm]}>
                  <Text style={styles.badgeDotText}>{totalAlertsCount > 99 ? '99+' : totalAlertsCount}</Text>
                </View>
              )}
            </View>
            {!isMobile && (
              <Text style={[styles.notifText, hasTomorrowAlarm ? styles.notifTextAlarm : (pendingCount > 0 && styles.notifTextActive)]}>
                Notificaciones
              </Text>
            )}
          </TouchableOpacity>

          {/* Lock / Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, isSmall && styles.iconBtnCompact]}
            onPress={logout}
            activeOpacity={0.8}
            title="Bloquear sesión"
          >
            <Ionicons name="lock-closed" size={isSmall ? 13 : 14} color={THEME.colors.danger} />
            {!isMobile && <Text style={styles.logoutText}>Bloquear</Text>}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  headerMobile: { paddingHorizontal: THEME.spacing.md, paddingVertical: 10 },
  titleContainer: { flex: 1, minWidth: 90 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  badgeText: { color: THEME.colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  badgeTextSmall: { fontSize: 8, letterSpacing: 0.4 },
  title: { color: THEME.colors.textMain, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  titleMobile: { fontSize: 15 },
  titleSmall: { fontSize: 13 },
  subtitle: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  notifBtnActive: { backgroundColor: THEME.colors.warning, borderColor: THEME.colors.warning, shadowColor: THEME.colors.warning, shadowOpacity: 0.25 },
  notifBtnAlarm: { backgroundColor: 'rgba(234, 88, 12, 0.1)', borderColor: 'rgba(234, 88, 12, 0.35)' },
  bellWrapper: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  badgeDot: {
    position: 'absolute',
    top: -7,
    right: -9,
    backgroundColor: THEME.colors.danger,
    borderRadius: 9999,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: THEME.colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeDotAlarm: { backgroundColor: '#ea580c' },
  badgeDotText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  notifText: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '800' },
  notifTextActive: { color: '#ffffff', fontWeight: '900' },
  notifTextAlarm: { color: '#ea580c', fontWeight: '900' },
  mobileMenuBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },
  mobileMenuBtnSmall: { paddingHorizontal: 7, paddingVertical: 6 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  iconBtnCompact: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '800' },
});
