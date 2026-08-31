import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { FinanceModal } from '../components/finances/FinanceModal';
import { FinancePeriodSummary } from '../components/finances/FinancePeriodSummary';
import { AdvanceModal } from '../components/payroll/AdvanceModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const FinanceScreen = () => {
  const { extraIncomes, addExtraIncome, deleteExtraIncome, debts, saveDebt, deleteDebt, employees, projects, addAdvance, clearOrApplyAdvances } = useApp();
  const [modalType, setModalType] = useState(null);
  const [selectedEmpForAdvance, setSelectedEmpForAdvance] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);

  const totalExtraIncome = extraIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const payableDebts = debts.filter(d => d.category === 'debt_payable');
  const receivableDebts = debts.filter(d => d.category === 'debt_receivable');
  const totalPayableDebt = payableDebts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalReceivableDebt = receivableDebts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const employeesWithAdvances = employees.filter(e => Number(e.advances) > 0);

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    if (deletingRecord.type === 'income') deleteExtraIncome(deletingRecord.id);
    else if (deletingRecord.type === 'debt') deleteDebt(deletingRecord.id);
    else if (deletingRecord.type === 'advance') clearOrApplyAdvances(deletingRecord.id, deletingRecord.amount);
    setDeletingRecord(null);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topActions}>
          <PrimaryButton title="+ Ingreso" icon="add-circle" variant="success" onPress={() => setModalType('income')} small />
          <PrimaryButton title="+ Deuda / Cuenta" icon="add-circle" variant="danger" onPress={() => setModalType('debt')} small />
        </View>
      </View>

      <FinancePeriodSummary extraIncomes={extraIncomes} debts={debts} projects={projects} employees={employees} />

      {employeesWithAdvances.length > 0 && (
        <Card title="Control de Adelantos Activos" icon="cash-outline">
          {employeesWithAdvances.map((emp) => (
            <View key={emp.id} style={styles.advanceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.advanceName}>{emp.name}</Text>
                <Text style={styles.advanceHint}>Se descontará en nómina</Text>
              </View>
              <View style={styles.advanceActionsBox}>
                <View style={styles.advanceAmountBadge}>
                  <Text style={styles.advanceAmountText}>{formatCurrency(emp.advances)}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedEmpForAdvance(emp)} style={styles.actionIconBtn} activeOpacity={0.7}>
                  <Ionicons name="pencil" size={14} color={THEME.colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeletingRecord({ type: 'advance', id: emp.id, amount: emp.advances, title: `Adelanto de ${emp.name}` })} style={styles.actionIconBtn} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={14} color={THEME.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* 3 Columnas */}
      <View style={styles.columnsGrid}>
        <Card title={`Ingresos Extras (${formatCurrency(totalExtraIncome)})`} icon="trending-up-outline" style={styles.columnCard}>
          {extraIncomes.length > 0 ? extraIncomes.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: THEME.colors.success }]}>+{formatCurrency(item.amount)}</Text>
              <TouchableOpacity onPress={() => setDeletingRecord({ type: 'income', id: item.id, title: item.title })} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          )) : <Text style={styles.emptyText}>No hay ingresos extras</Text>}
        </Card>

        <Card title={`Por Pagar (${formatCurrency(totalPayableDebt)})`} icon="arrow-down-circle-outline" style={styles.columnCard}>
          {payableDebts.length > 0 ? payableDebts.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: THEME.colors.danger }]}>{formatCurrency(item.amount)}</Text>
              <TouchableOpacity onPress={() => setDeletingRecord({ type: 'debt', id: item.id, title: item.title })} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          )) : <Text style={styles.emptyText}>No hay deudas por pagar</Text>}
        </Card>

        <Card title={`Por Cobrar (${formatCurrency(totalReceivableDebt)})`} icon="arrow-up-circle-outline" style={styles.columnCard}>
          {receivableDebts.length > 0 ? receivableDebts.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: THEME.colors.accent }]}>{formatCurrency(item.amount)}</Text>
              <TouchableOpacity onPress={() => setDeletingRecord({ type: 'debt', id: item.id, title: item.title })} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          )) : <Text style={styles.emptyText}>No hay cuentas por cobrar</Text>}
        </Card>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Ingresos Extras</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.success }]}>{formatCurrency(totalExtraIncome)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Deudas por Pagar</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.danger }]}>{formatCurrency(totalPayableDebt)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Cuentas por Cobrar</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.primary }]}>{formatCurrency(totalReceivableDebt)}</Text>
        </View>
      </View>

      <FinanceModal visible={Boolean(modalType)} type={modalType} onClose={() => setModalType(null)} onSave={(d) => modalType === 'income' ? addExtraIncome(d) : saveDebt(d)} />
      <AdvanceModal visible={Boolean(selectedEmpForAdvance)} employee={selectedEmpForAdvance} onClose={() => setSelectedEmpForAdvance(null)} onSave={addAdvance} />

      <PinConfirmModal
        visible={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación Financiera"
        description={`Se eliminará permanentemente: "${deletingRecord?.title || 'este registro'}"`}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  topActions: { flexDirection: 'row', gap: 6 },
  columnsGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  columnCard: { flex: 1, minWidth: 260, marginBottom: 0 },
  kpiGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 140, marginBottom: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.lg, padding: 14 },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  advanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 12, borderRadius: THEME.radius.md, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  advanceName: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '700' },
  advanceHint: { color: THEME.colors.textDim, fontSize: 11 },
  advanceActionsBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  advanceAmountBadge: { backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.3)' },
  advanceAmountText: { color: THEME.colors.warning, fontSize: 14, fontWeight: '800' },
  actionIconBtn: { backgroundColor: '#f8fafc', padding: 6, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 12, borderRadius: THEME.radius.md, marginBottom: 6, gap: 8, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  itemTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '700' },
  itemNote: { color: THEME.colors.textMuted, fontSize: 11 },
  itemDate: { color: THEME.colors.textDim, fontSize: 10, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '800' },
  deleteBtn: { padding: 6 },
  emptyText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
});
