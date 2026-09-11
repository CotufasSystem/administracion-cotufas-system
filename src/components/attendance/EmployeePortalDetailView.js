import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ChangePasswordSection } from './ChangePasswordSection';
import { PortalAdvancesSection } from './PortalAdvancesSection';
import { PortalLeaveSection } from './PortalLeaveSection';
import { PortalJustificationsSection } from './PortalJustificationsSection';

const PORTAL_TABS = [
  { id: 'attendance', label: 'Asistencia', icon: 'time-outline', activeIcon: 'time' },
  { id: 'advances', label: 'Adelantos', icon: 'cash-outline', activeIcon: 'cash' },
  { id: 'leave', label: 'Permisos', icon: 'medkit-outline', activeIcon: 'medkit' },
  { id: 'justifications', label: 'Justificar', icon: 'shield-checkmark-outline', activeIcon: 'shield-checkmark' },
];

export const EmployeePortalDetailView = ({
  employee,
  todayStr,
  todayRecord,
  isPending,
  isPresent,
  isAbsent,
  isPermission,
  myPayments = [],
  myMonthAttendance,
  attendance = {},
  advanceRequests = [],
  leaveRequests = [],
  attendanceJustifications = [],
  onNotifyAttendance,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const checkInTime = typeof todayRecord === 'object' ? (todayRecord?.checkInTime || todayRecord?.notifiedAt) : null;
  const checkOutTime = typeof todayRecord === 'object' ? (todayRecord?.checkOutTime || todayRecord?.checkoutAt) : null;
  const hasCheckedIn = Boolean(checkInTime) || isPresent || isPending;

  // Counts for tab badges
  const pendingAdvancesCount = (advanceRequests || []).filter(r => r.employeeId === employee.id && r.status === 'pending').length;
  const pendingLeavesCount = (leaveRequests || []).filter(r => r.employeeId === employee.id && r.status === 'under_review').length;
  const pendingJustsCount = (attendanceJustifications || []).filter(j => j.employeeId === employee.id && j.status === 'pending').length;

  // Recent resolved responses from Admin (Approved or Rejected)
  const recentResolutions = useMemo(() => {
    const list = [];
    (advanceRequests || []).filter(r => r.employeeId === employee.id && (r.status === 'rejected' || r.status === 'approved')).forEach(r => {
      list.push({
        id: r.id,
        type: 'advance',
        status: r.status,
        title: r.status === 'approved' ? `✅ Adelanto de $${r.amount} APROBADO` : `❌ Solicitud de Adelanto RECHAZADA ($${r.amount})`,
        feedback: r.adminComment || (r.status === 'approved' ? 'El monto fue aprobado y añadido a tu balance.' : 'La administración no autorizó este adelanto.'),
        date: r.resolvedAt || r.updatedAt,
        targetTab: 'advances',
      });
    });

    (leaveRequests || []).filter(l => l.employeeId === employee.id && (l.status === 'rejected' || l.status === 'approved')).forEach(l => {
      list.push({
        id: l.id,
        type: 'leave',
        status: l.status,
        title: l.status === 'approved' ? `✅ Permiso/Reposo APROBADO` : `❌ Permiso/Reposo RECHAZADO`,
        feedback: l.adminFeedback || (l.status === 'approved' ? 'Solicitud autorizada por Administración.' : 'Solicitud no autorizada.'),
        date: l.resolvedAt || l.updatedAt,
        targetTab: 'leave',
      });
    });

    (attendanceJustifications || []).filter(j => j.employeeId === employee.id && (j.status === 'rejected' || j.status === 'approved')).forEach(j => {
      list.push({
        id: j.id,
        type: 'justification',
        status: j.status,
        title: j.status === 'approved' ? `✅ Justificación APROBADA (${j.dateKey})` : `❌ Justificación RECHAZADA (${j.dateKey})`,
        feedback: j.adminComment || (j.status === 'approved' ? 'Tu justificación fue aceptada.' : 'Justificación rechazada.'),
        date: j.resolvedAt || j.updatedAt,
        targetTab: 'justifications',
      });
    });

    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [advanceRequests, leaveRequests, attendanceJustifications, employee.id]);

  const latestResolution = recentResolutions[0];

  return (
    <View style={styles.container}>
      {/* Employee Identity Header Card */}
      <View style={styles.empHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>{employee.portalUsername || employee.name}</Text>
          {employee.portalUsername && employee.portalUsername !== employee.name ? (
            <Text style={styles.empLegalName}>Nombre Legal: {employee.name}</Text>
          ) : null}
          <Text style={styles.empRole}>{employee.area || 'Operaciones'} • {employee.schedule || 'Horario regular'}</Text>
          {employee.idCard ? <Text style={styles.empCi}>CI: {employee.idCard}</Text> : null}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.passwordEmpBtn, isChangingPassword && styles.passwordEmpBtnActive]}
            onPress={() => setIsChangingPassword(!isChangingPassword)}
            activeOpacity={0.8}
            title="Modificar Nombre y Contraseña"
          >
            <Ionicons name="person-outline" size={13} color={THEME.colors.primary} />
            <Text style={styles.passwordEmpText}>Mi Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutEmpBtn} onPress={onLogout} activeOpacity={0.8} title="Cerrar Sesión">
            <Ionicons name="log-out-outline" size={13} color={THEME.colors.danger} />
            <Text style={styles.logoutEmpText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Resolution Notification Banner (e.g. Rejected or Approved) */}
      {latestResolution ? (
        <TouchableOpacity
          style={[
            styles.notifAlertBanner,
            latestResolution.status === 'rejected' ? styles.notifAlertDanger : styles.notifAlertSuccess
          ]}
          onPress={() => setActiveTab(latestResolution.targetTab)}
          activeOpacity={0.85}
        >
          <View style={styles.notifAlertIconWrapper}>
            <Ionicons
              name={latestResolution.status === 'rejected' ? "alert-circle" : "checkmark-circle"}
              size={22}
              color={latestResolution.status === 'rejected' ? THEME.colors.danger : THEME.colors.success}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.notifAlertTitle,
              { color: latestResolution.status === 'rejected' ? THEME.colors.danger : '#15803d' }
            ]}>
              {latestResolution.title}
            </Text>
            <Text style={styles.notifAlertSub} numberOfLines={2}>
              {latestResolution.feedback}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={THEME.colors.textDim} />
        </TouchableOpacity>
      ) : null}

      {/* Change Profile & Password Section (Collapsible) */}
      {isChangingPassword ? (
        <ChangePasswordSection
          employee={employee}
          onSaveProfile={(updatedData) => {
            onUpdateProfile?.(updatedData);
          }}
          onClose={() => setIsChangingPassword(false)}
        />
      ) : null}

      {/* Segmented Tab Navigation for Self-Service Modules */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {PORTAL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount =
              tab.id === 'advances'
                ? pendingAdvancesCount
                : tab.id === 'leave'
                ? pendingLeavesCount
                : tab.id === 'justifications'
                ? pendingJustsCount
                : 0;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={15}
                  color={isActive ? '#ffffff' : THEME.colors.primary}
                />
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
                {badgeCount > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Tab Content */}
      {activeTab === 'attendance' && (
        <>
          {/* Quick Check-in Card */}
          <View style={styles.checkinCard}>
            <View style={styles.checkinHeader}>
              <Text style={styles.cardHeaderTitle}>Asistencia de Hoy</Text>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-outline" size={12} color={THEME.colors.primary} />
                <Text style={styles.dateBadgeText}>{formatDate(todayStr)}</Text>
              </View>
            </View>

            {/* Timestamps status row */}
            <View style={styles.checkinTimesRow}>
              <View style={[styles.timeChip, Boolean(checkInTime || isPresent) && styles.timeChipActive]}>
                <Ionicons name="log-in-outline" size={14} color={checkInTime || isPresent ? THEME.colors.success : THEME.colors.textDim} />
                <Text style={styles.timeChipLabel}>Entrada:</Text>
                <Text style={[styles.timeChipVal, Boolean(checkInTime || isPresent) && { color: THEME.colors.success }]}>
                  {checkInTime || (isPresent ? 'Confirmada' : (isPending ? 'Pendiente' : 'Por marcar'))}
                </Text>
              </View>
              <View style={[styles.timeChip, Boolean(checkOutTime) && styles.timeChipActive]}>
                <Ionicons name="log-out-outline" size={14} color={checkOutTime ? THEME.colors.warning : THEME.colors.textDim} />
                <Text style={styles.timeChipLabel}>Salida:</Text>
                <Text style={[styles.timeChipVal, Boolean(checkOutTime) && { color: THEME.colors.warning }]}>
                  {checkOutTime || 'Por marcar'}
                </Text>
              </View>
            </View>

            {isAbsent ? (
              <View style={[styles.statusBanner, styles.statusBannerDanger]}>
                <Ionicons name="close-circle" size={20} color={THEME.colors.danger} />
                <Text style={styles.statusBannerTitle}>Falta Registrada</Text>
              </View>
            ) : isPermission ? (
              <View style={[styles.statusBanner, styles.statusBannerInfo]}>
                <Ionicons name="document-text" size={20} color={THEME.colors.primary} />
                <Text style={styles.statusBannerTitle}>Permiso Autorizado</Text>
              </View>
            ) : !hasCheckedIn ? (
              <TouchableOpacity style={styles.notifyBtnEntry} onPress={() => onNotifyAttendance('checkin')} activeOpacity={0.85}>
                <Ionicons name="log-in-outline" size={22} color="#ffffff" />
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={styles.notifyBtnTitle}>Notificar Hora de Entrada</Text>
                  <Text style={styles.notifyBtnSub}>Registrar mi llegada al trabajo</Text>
                </View>
              </TouchableOpacity>
            ) : !checkOutTime ? (
              <View style={{ gap: 8 }}>
                <View style={[styles.statusBanner, isPending ? styles.statusBannerPending : styles.statusBannerSuccess]}>
                  <Ionicons name={isPending ? "time" : "checkmark-circle"} size={20} color={isPending ? THEME.colors.warning : THEME.colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusBannerTitle}>
                      Entrada Registrada ({checkInTime || 'Hoy'})
                    </Text>
                    <Text style={styles.statusBannerSub}>
                      {isPending ? 'Esperando validación de Administración' : 'Asistencia validada en el sistema'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.notifyBtnExit} onPress={() => onNotifyAttendance('checkout')} activeOpacity={0.85}>
                  <Ionicons name="log-out-outline" size={22} color="#ffffff" />
                  <View style={{ alignItems: 'flex-start' }}>
                    <Text style={styles.notifyBtnTitle}>Notificar Hora de Salida</Text>
                    <Text style={styles.notifyBtnSub}>Registrar fin de jornada laboral</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <View style={[styles.statusBanner, styles.statusBannerSuccess]}>
                  <Ionicons name="checkmark-done-circle" size={22} color={THEME.colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusBannerTitle, { color: THEME.colors.success }]}>
                      ¡Jornada de Hoy Completa!
                    </Text>
                    <Text style={styles.statusBannerSub}>
                      Entrada: {checkInTime} • Salida: {checkOutTime}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.reNotifyBtn} onPress={() => onNotifyAttendance('checkout')} activeOpacity={0.7}>
                  <Ionicons name="refresh-outline" size={13} color={THEME.colors.primary} />
                  <Text style={styles.reNotifyText}>Actualizar hora de salida ({checkOutTime})</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Financial Status Summary */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Sueldo Base Mensual</Text>
              <Text style={[styles.kpiVal, { color: THEME.colors.primary }]}>{formatCurrency(employee.salary)}</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Adelanto Activo</Text>
              <Text style={[styles.kpiVal, { color: Number(employee.advances) > 0 ? THEME.colors.danger : THEME.colors.success }]}>
                {Number(employee.advances) > 0 ? `-${formatCurrency(employee.advances)}` : 'Sin deudas ($0)'}
              </Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Asistencias este Mes</Text>
              <Text style={[styles.kpiVal, { color: THEME.colors.success }]}>{myMonthAttendance.presentCount} Días</Text>
            </View>
          </View>

          {/* Payments & Receipts */}
          <View style={styles.historySection}>
            <Text style={styles.sectionHeader}>Mis Pagos y Abonos Recibidos</Text>
            {myPayments.length > 0 ? (
              myPayments.map((p) => (
                <View key={p.id} style={styles.paymentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentTitle}>{p.isStandaloneBonus ? '🎁 Bono Extra Fuera de Nómina' : '💵 Pago de Nómina / Quincena'}</Text>
                    <Text style={styles.paymentDetail}>Fecha: 📅 {formatDate(p.date)} {p.bonus > 0 ? `• Bono: +$${p.bonus}` : ''} {p.advanceDeduction > 0 ? `• Adelanto restado: -$${p.advanceDeduction}` : ''}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmount}>+{formatCurrency(p.netPayment)}</Text>
                    <Text style={styles.paymentBadge}>Pagado</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No tienes pagos registrados en el historial</Text>
            )}
          </View>
        </>
      )}

      {/* Module 1: Solicitud de Adelantos de Sueldo */}
      {activeTab === 'advances' && (
        <PortalAdvancesSection
          employee={employee}
          advanceRequests={advanceRequests}
        />
      )}

      {/* Module 2: Reposos Médicos y Permisos */}
      {activeTab === 'leave' && (
        <PortalLeaveSection
          employee={employee}
          leaveRequests={leaveRequests}
        />
      )}

      {/* Module 3: Justificación de Inasistencias y Tardanzas */}
      {activeTab === 'justifications' && (
        <PortalJustificationsSection
          employee={employee}
          attendance={attendance}
          attendanceJustifications={attendanceJustifications}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    flexWrap: 'wrap',
    gap: 10,
  },
  empTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '900' },
  empLegalName: { color: THEME.colors.textMuted, fontSize: 11, fontStyle: 'italic', marginTop: 1 },
  empRole: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  empCi: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '700', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  passwordEmpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  passwordEmpBtnActive: { backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: THEME.colors.primary },
  passwordEmpText: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '800' },
  logoutEmpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  logoutEmpText: { color: THEME.colors.danger, fontSize: 11, fontWeight: '800' },

  /* Admin Notification Alert Banner */
  notifAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifAlertDanger: {
    backgroundColor: '#fff1f2',
    borderColor: '#fca5a5',
  },
  notifAlertSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  notifAlertIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifAlertTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  notifAlertSub: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },

  /* Segmented Nav Tabs */
  tabsContainer: {
    backgroundColor: '#f1f5f9',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  tabBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  tabBadgeTextActive: {
    color: '#ffffff',
  },

  /* Attendance Card */
  checkinCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', gap: 12 },
  checkinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm },
  dateBadgeText: { color: THEME.colors.primaryDark, fontSize: 10, fontWeight: '800' },
  checkinTimesRow: { flexDirection: 'row', gap: 8 },
  timeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 7, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border },
  timeChipActive: { backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.2)' },
  timeChipLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  timeChipVal: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800' },
  notifyBtnEntry: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: THEME.colors.success, padding: 12, borderRadius: THEME.radius.md, justifyContent: 'center' },
  notifyBtnExit: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#d97706', padding: 12, borderRadius: THEME.radius.md, justifyContent: 'center' },
  notifyBtnTitle: { color: '#ffffff', fontSize: 13.5, fontWeight: '900' },
  notifyBtnSub: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 10, fontWeight: '600' },
  reNotifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  reNotifyText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: THEME.radius.md, borderWidth: 1 },
  statusBannerPending: { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: THEME.colors.warning },
  statusBannerSuccess: { backgroundColor: 'rgba(22, 163, 74, 0.12)', borderColor: THEME.colors.success },
  statusBannerDanger: { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: THEME.colors.danger },
  statusBannerInfo: { backgroundColor: 'rgba(37, 99, 235, 0.12)', borderColor: THEME.colors.primary },
  statusBannerTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  statusBannerSub: { color: THEME.colors.textMuted, fontSize: 10, marginTop: 2 },
  kpiGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  kpiBox: { flex: 1, minWidth: 120, backgroundColor: '#ffffff', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  kpiVal: { fontSize: 14, fontWeight: '900', marginTop: 3 },
  historySection: { gap: 8, marginTop: 4 },
  sectionHeader: { color: THEME.colors.primaryDark, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  paymentTitle: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  paymentDetail: { color: THEME.colors.textMuted, fontSize: 10, marginTop: 2 },
  paymentAmount: { color: THEME.colors.success, fontSize: 13, fontWeight: '900' },
  paymentBadge: { color: THEME.colors.textDim, fontSize: 9, fontWeight: '700', marginTop: 2 },
  emptyText: { color: THEME.colors.textDim, fontSize: 11, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
});
