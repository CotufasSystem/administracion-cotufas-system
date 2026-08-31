import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
  onNotifyAttendance,
  onLogout,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.empHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>{employee.name}</Text>
          <Text style={styles.empRole}>{employee.area || 'Operaciones'} • {employee.schedule || 'Horario regular'}</Text>
          {employee.idCard ? <Text style={styles.empCi}>CI: {employee.idCard}</Text> : null}
        </View>
        <TouchableOpacity style={styles.logoutEmpBtn} onPress={onLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={14} color={THEME.colors.danger} />
          <Text style={styles.logoutEmpText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Check-in Card */}
      <View style={styles.checkinCard}>
        <View style={styles.checkinHeader}>
          <Text style={styles.cardHeaderTitle}>Asistencia de Hoy</Text>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={12} color={THEME.colors.primary} />
            <Text style={styles.dateBadgeText}>{formatDate(todayStr)}</Text>
          </View>
        </View>

        {isPending ? (
          <View style={[styles.statusBanner, styles.statusBannerPending]}>
            <Ionicons name="time" size={20} color={THEME.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitle}>Asistencia Notificada ({todayRecord?.notifiedAt || 'Hoy'})</Text>
              <Text style={styles.statusBannerSub}>Esperando validación de Administración</Text>
            </View>
          </View>
        ) : isPresent ? (
          <View style={[styles.statusBanner, styles.statusBannerSuccess]}>
            <Ionicons name="checkmark-circle" size={22} color={THEME.colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: THEME.colors.success }]}>¡Asistencia Confirmada Hoy!</Text>
              <Text style={styles.statusBannerSub}>Validada correctamente en el sistema</Text>
            </View>
          </View>
        ) : isAbsent ? (
          <View style={[styles.statusBanner, styles.statusBannerDanger]}>
            <Ionicons name="close-circle" size={20} color={THEME.colors.danger} />
            <Text style={styles.statusBannerTitle}>Falta Registrada</Text>
          </View>
        ) : isPermission ? (
          <View style={[styles.statusBanner, styles.statusBannerInfo]}>
            <Ionicons name="document-text" size={20} color={THEME.colors.primary} />
            <Text style={styles.statusBannerTitle}>Permiso Autorizado</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.notifyBtn} onPress={onNotifyAttendance} activeOpacity={0.85}>
            <Ionicons name="finger-print" size={22} color="#ffffff" />
            <View style={{ alignItems: 'flex-start' }}>
              <Text style={styles.notifyBtnTitle}>Notificar Mi Asistencia de Hoy</Text>
              <Text style={styles.notifyBtnSub}>Registrar hora de llegada al sistema</Text>
            </View>
          </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 14, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  empTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '900' },
  empRole: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  empCi: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '700', marginTop: 2 },
  logoutEmpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm },
  logoutEmpText: { color: THEME.colors.danger, fontSize: 11, fontWeight: '800' },
  checkinCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', gap: 12 },
  checkinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm },
  dateBadgeText: { color: THEME.colors.primaryDark, fontSize: 10, fontWeight: '800' },
  notifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: THEME.colors.success, padding: 12, borderRadius: THEME.radius.md, justifyContent: 'center' },
  notifyBtnTitle: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  notifyBtnSub: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 10, fontWeight: '600' },
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
