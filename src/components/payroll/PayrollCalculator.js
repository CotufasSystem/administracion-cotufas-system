import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export const PayrollCalculator = ({
  budgetInput,
  setBudgetInput,
  calculationMode,
  setCalculationMode,
  targetPercentage,
  setTargetPercentage,
  paymentDate,
  setPaymentDate,
  includeRent,
  setIncludeRent,
  summaryData,
  onApplyQuincenaPreset,
  q1PaidInfo,
}) => {
  const [percentText, setPercentText] = useState(String(targetPercentage));

  useEffect(() => {
    if (calculationMode !== 'percentage') {
      setPercentText(String(summaryData.effectivePercentage));
    }
  }, [summaryData.effectivePercentage, calculationMode]);

  const handlePercentageChange = (val) => {
    const normalized = val.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    const clean = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;
    setPercentText(clean);

    const num = Number(clean) || 0;
    setTargetPercentage(clean === '' ? 0 : num);
    setCalculationMode('percentage');
    const rentExtra = includeRent ? 300 : 0;
    const baseTotal = summaryData.totalBaseSalary || 0;
    const calculatedBudget = Math.round((baseTotal * (num / 100)) + rentExtra);
    setBudgetInput(String(calculatedBudget));
  };

  const handleBudgetChange = (val) => {
    setBudgetInput(val);
    setCalculationMode('budget');
  };

  const q1Label = q1PaidInfo?.hasQ1Paid
    ? `Quincena 1 (${q1PaidInfo.q1Percent}% Pagada 🔒)`
    : 'Quincena 1 (30% Nómina)';

  const q2Label = q1PaidInfo?.hasQ1Paid
    ? `Quincena 2 (${q1PaidInfo.q2Percent}% Restante + Alquiler $300)`
    : 'Quincena 2 (70% + Alquiler $300)';

  return (
    <View style={styles.container}>
      {/* Freeze Notification if Q1 Paid */}
      {q1PaidInfo?.hasQ1Paid && (
        <View style={styles.freezeBanner}>
          <Ionicons name="lock-closed" size={15} color={THEME.colors.primary} />
          <Text style={styles.freezeBannerText}>
            1ra Quincena congelada al <Text style={styles.bold}>{q1PaidInfo.q1Percent}%</Text>. La 2da Quincena queda fijada automáticamente al <Text style={styles.bold}>{q1PaidInfo.q2Percent}%</Text> restante para completar el 100% de los sueldos.
          </Text>
        </View>
      )}

      {/* Date & Preset Row */}
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={[styles.presetBtn, calculationMode === 'preset-05' && styles.presetBtnActive]}
          onPress={() => onApplyQuincenaPreset(5)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={15} color={calculationMode === 'preset-05' ? "#ffffff" : THEME.colors.primary} />
          <Text style={[styles.presetTitle, calculationMode === 'preset-05' && styles.presetTitleActive]}>
            {q1Label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetBtn, calculationMode === 'preset-20' && styles.presetBtnActive]}
          onPress={() => onApplyQuincenaPreset(20)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={15} color={calculationMode === 'preset-20' ? "#ffffff" : THEME.colors.primary} />
          <Text style={[styles.presetTitle, calculationMode === 'preset-20' && styles.presetTitleActive]}>
            {q2Label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date, Budget & Percentage Grid */}
      <View style={styles.inputsGrid}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>Fecha de Pago Asignada</Text>
          <View style={styles.textInputWrapper}>
            <Ionicons name="calendar-outline" size={15} color={THEME.colors.primary} style={{ marginRight: 6 }} />
            <TextInput
              style={styles.textInput}
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Presupuesto ($)</Text>
          <View style={styles.textInputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.textInput}
              value={budgetInput}
              onChangeText={handleBudgetChange}
              placeholder="Ej: 1400"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>% Aplicado a Sueldos</Text>
          <View style={styles.textInputWrapper}>
            <Ionicons name="pie-chart" size={15} color={THEME.colors.primary} style={{ marginRight: 4 }} />
            <TextInput
              style={styles.textInput}
              value={percentText}
              onChangeText={handlePercentageChange}
              placeholder="30"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="decimal-pad"
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>
      </View>

      {/* Rent Checkbox Switch */}
      <View style={styles.switchRow}>
        <View style={styles.switchLabelBox}>
          <Ionicons name="home" size={16} color={THEME.colors.primary} />
          <View>
            <Text style={styles.switchTitle}>Incluir Alquiler de Oficina ($300)</Text>
            <Text style={styles.switchSubtitle}>Se descuenta del presupuesto global</Text>
          </View>
        </View>
        <Switch
          value={includeRent}
          onValueChange={setIncludeRent}
          trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryDark }}
          thumbColor={includeRent ? THEME.colors.primary : '#f4f3f4'}
        />
      </View>

      {/* Metrics Banner */}
      <View style={styles.metricsBanner}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Total Sueldos Base</Text>
          <Text style={styles.metricValue}>{formatCurrency(summaryData.totalBaseSalary)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Pago Neto Empleados</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.primary }]}>
            {formatCurrency(summaryData.totalDistributed)}
          </Text>
        </View>
        {summaryData.rentToPay > 0 && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Alquiler</Text>
            <Text style={[styles.metricValue, { color: THEME.colors.primaryDark }]}>
              {formatCurrency(summaryData.rentToPay)}
            </Text>
          </View>
        )}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Desembolso Total</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.success }]}>
            {formatCurrency(summaryData.totalPayrollOutflow)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: THEME.spacing.md },
  freezeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', padding: 10, borderRadius: THEME.radius.md },
  freezeBannerText: { color: THEME.colors.textMain, fontSize: 12, lineHeight: 17, flex: 1 },
  bold: { color: THEME.colors.primary, fontWeight: '800' },
  presetsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  presetBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  presetBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  presetTitle: { color: THEME.colors.primaryDark, fontSize: 11.5, fontWeight: '700', textAlign: 'center' },
  presetTitleActive: { color: '#ffffff', fontWeight: '800' },
  inputsGrid: { flexDirection: 'row', gap: 8 },
  inputBox: { flex: 1 },
  label: { color: THEME.colors.textMuted, fontSize: 9, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', height: 24, textAlignVertical: 'bottom' },
  textInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: THEME.radius.md, paddingHorizontal: 8, height: 42 },
  currencySymbol: { color: THEME.colors.primary, fontSize: 14, fontWeight: '800', marginRight: 3 },
  percentSymbol: { color: THEME.colors.primary, fontSize: 13, fontWeight: '800', marginLeft: 2 },
  textInput: { flex: 1, color: THEME.colors.textMain, fontSize: 13, fontWeight: '700', paddingVertical: 0 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  switchLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  switchTitle: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  switchSubtitle: { color: THEME.colors.textMuted, fontSize: 10 },
  metricsBanner: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: '#f8fafc', padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: '#e2e8f0' },
  metricItem: { flex: 1, minWidth: 80 },
  metricLabel: { color: THEME.colors.textMuted, fontSize: 9, fontWeight: '600' },
  metricValue: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800', marginTop: 2 },
});
