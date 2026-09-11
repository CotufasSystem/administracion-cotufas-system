import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency, getLocalDateString } from '../../utils/formatters';

export const PayrollEmployeeRow = ({
  employee,
  onEditEmployee,
  onPayIndividual,
  onPayBonusStandalone,
  onDeletePayment,
  isPaid,
  paymentRecord,
  paymentDate,
}) => {
  const [bonusInput, setBonusInput] = useState(employee.bonus ? String(employee.bonus) : '');

  const bonusVal = Number(bonusInput) || 0;
  const totalNetToPay = Math.max(0, (employee.netPayment || 0) + bonusVal);

  const handlePayPress = () => {
    if (onPayIndividual) {
      onPayIndividual({
        empId: employee.id,
        empName: employee.name,
        baseSalary: employee.baseSalary,
        grossPayment: employee.grossPayment,
        advanceDeduction: employee.advanceDeduction || 0,
        bonus: bonusVal,
        netPayment: totalNetToPay,
        date: paymentDate || getLocalDateString(new Date()),
      });
    }
  };

  const handleBonusStandalonePress = () => {
    if (onPayBonusStandalone && bonusVal > 0) {
      onPayBonusStandalone({
        empId: employee.id,
        empName: employee.name,
        bonus: bonusVal,
        date: paymentDate || getLocalDateString(new Date()),
      });
      setBonusInput('');
    }
  };

  return (
    <View style={[styles.card, isPaid && styles.cardPaid]}>
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{employee.name}</Text>
          <View style={styles.salaryBadge}>
            <Text style={styles.salaryBadgeText}>Base: {formatCurrency(employee.baseSalary)}</Text>
          </View>
          {isPaid && (
            <View style={styles.paidBadgeGroup}>
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={12} color={THEME.colors.success} />
                <Text style={styles.paidBadgeText}>Pagado: {paymentRecord?.date || 'Hoy'}</Text>
              </View>
              {paymentRecord?.id && (
                <TouchableOpacity
                  style={styles.cancelPaymentBtn}
                  onPress={() => onDeletePayment(paymentRecord.id)}
                  activeOpacity={0.7}
                  title="Anular/Eliminar este pago"
                >
                  <Ionicons name="trash-outline" size={12} color={THEME.colors.danger} />
                  <Text style={styles.cancelPaymentText}>Anular</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => onEditEmployee(employee)} activeOpacity={0.7} title="Editar empleado">
          <Ionicons name="pencil" size={14} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Binance Info */}
      <View style={styles.binanceRow}>
        <View style={styles.binanceIconBadge}>
          <Ionicons name="logo-bitcoin" size={11} color="#000" />
          <Text style={styles.binanceLabel}>Binance:</Text>
        </View>
        <Text style={styles.binanceValue} numberOfLines={1}>
          {employee.binance || 'No registrada (Manual)'}
        </Text>
      </View>

      {/* Bonus & Split Grid */}
      <View style={styles.splitGrid}>
        <View style={styles.splitBox}>
          <Text style={styles.splitLabel}>Bruto ({Math.round(employee.appliedPercentage || 100)}%)</Text>
          <Text style={styles.splitValue}>{formatCurrency(employee.grossPayment)}</Text>
        </View>

        {employee.advances > 0 && (
          <View style={styles.splitBox}>
            <Text style={[styles.splitLabel, { color: THEME.colors.warning }]}>Deducir Adelanto</Text>
            <Text style={[styles.splitValue, { color: THEME.colors.warning }]}>-{formatCurrency(employee.advanceDeduction)}</Text>
          </View>
        )}

        <View style={styles.splitBox}>
          <Text style={[styles.splitLabel, { color: THEME.colors.success }]}>Bono ($)</Text>
          <TextInput
            style={styles.bonusInput}
            value={bonusInput}
            onChangeText={setBonusInput}
            placeholder="0"
            placeholderTextColor={THEME.colors.textDim}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.splitBox, styles.netPayBox]}>
          <Text style={styles.netPayLabel}>TOTAL NETO</Text>
          <Text style={styles.netPayValue}>{formatCurrency(totalNetToPay)}</Text>
        </View>
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.bottomRow}>
        {employee.remainingAdvance > 0 && (
          <Text style={styles.remainingText}>
            Resta adelanto: {formatCurrency(employee.remainingAdvance)}
          </Text>
        )}

        <View style={styles.buttonsWrapper}>
          {bonusVal > 0 && (
            <TouchableOpacity
              style={styles.payBonusOnlyBtn}
              onPress={handleBonusStandalonePress}
              activeOpacity={0.8}
              title="Pagar este bono de inmediato como un extra independiente de la nómina"
            >
              <Ionicons name="gift" size={13} color="#ffffff" />
              <Text style={styles.payBonusOnlyBtnText}>
                Pagar Solo Bono (${bonusVal}) Fuera de Nómina
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.payIndividualBtn, isPaid && styles.payIndividualBtnDone]}
            onPress={handlePayPress}
            activeOpacity={0.8}
          >
            <Ionicons name={isPaid ? "checkmark-done" : "cash-outline"} size={14} color="#ffffff" />
            <Text style={styles.payIndividualBtnText}>
              {isPaid ? "Registrar Re-pago" : `Pagar a ${employee.name} (${formatCurrency(totalNetToPay)})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    padding: 15,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPaid: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    shadowColor: '#10b981',
    shadowOpacity: 0.1,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nameBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  name: { color: THEME.colors.textMain, fontSize: 14.5, fontWeight: '900', letterSpacing: -0.2 },
  salaryBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  salaryBadgeText: { color: THEME.colors.primary, fontSize: 10.5, fontWeight: '800' },
  paidBadgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#bbf7d0' },
  paidBadgeText: { color: '#15803d', fontSize: 10.5, fontWeight: '800' },
  cancelPaymentBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef2f2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },
  cancelPaymentText: { color: THEME.colors.danger, fontSize: 10.5, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { padding: 7, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  binanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  binanceIconBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.binanceYellow, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, gap: 2 },
  binanceLabel: { color: '#000', fontSize: 9, fontWeight: '900' },
  binanceValue: { color: THEME.colors.textMuted, fontSize: 11, flex: 1, fontWeight: '600' },
  splitGrid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  splitBox: { flex: 1, minWidth: 75, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  splitLabel: { color: THEME.colors.textDim, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  splitValue: { color: THEME.colors.textMain, fontSize: 12.5, fontWeight: '800', marginTop: 2 },
  bonusInput: { color: THEME.colors.success, fontSize: 12.5, fontWeight: '900', textAlign: 'center', paddingVertical: 0, marginTop: 2, outlineStyle: 'none' },
  netPayBox: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: THEME.colors.primary, borderWidth: 1.5 },
  netPayLabel: { color: THEME.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  netPayValue: { color: THEME.colors.primary, fontSize: 14, fontWeight: '900', marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  remainingText: { color: THEME.colors.warning, fontSize: 11, fontStyle: 'italic', fontWeight: '600' },
  buttonsWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' },
  payBonusOnlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  payBonusOnlyBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  payIndividualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  payIndividualBtnDone: { backgroundColor: THEME.colors.success, shadowColor: THEME.colors.success },
  payIndividualBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
});
