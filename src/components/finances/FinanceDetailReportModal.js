import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency, formatDate, getLocalDateString } from '../../utils/formatters';
import { printFinanceStatementPdf } from '../../utils/financePdfPrinter';
import { useApp } from '../../context/AppContext';

const TABS = [
  { id: 'all', label: 'Todo el Flujo' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'payroll', label: 'Pagos Nómina' },
  { id: 'advances', label: 'Adelantos' },
  { id: 'payable', label: 'Por Pagar' },
  { id: 'receivable', label: 'Por Cobrar' },
  { id: 'incomes', label: 'Ingresos Extras' },
];

export const FinanceDetailReportModal = ({ visible, onClose, periodLabel, startDate, endDate, extraIncomes = [], debts = [], employees = [], projects = [] }) => {
  const { profileImage } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const inRange = (dStr) => {
    if (!dStr) return true;
    const k = dStr.slice(0, 10);
    return k >= startDate && k <= endDate;
  };

  const projectsList = useMemo(() => {
    return projects.filter(p => p.status !== 'completed').map(p => ({
      id: p.id, title: p.name, description: p.description || 'Facturación mensual', amount: Number(p.monthlyIncome) || 0, date: periodLabel
    }));
  }, [projects, periodLabel]);

  const incomesList = useMemo(() => extraIncomes.filter(i => inRange(i.date)).map(i => ({
    id: i.id, title: i.title, note: i.note, date: i.date, amount: Number(i.amount) || 0
  })), [extraIncomes, startDate, endDate]);

  const advancesList = useMemo(() => {
    const list = [];
    employees.forEach(emp => {
      if (Array.isArray(emp.advancesHistory)) {
        emp.advancesHistory.forEach(adv => {
          if (inRange(adv.date)) list.push({
            id: adv.id, empName: emp.name, title: `Adelanto a ${emp.name}`, note: adv.note || 'Descuento en nómina', date: adv.date, amount: Number(adv.amount) || 0
          });
        });
      }
    });
    return list;
  }, [employees, startDate, endDate]);

  const payableList = useMemo(() => debts.filter(d => d.category === 'debt_payable' && inRange(d.date || d.createdAt)).map(d => ({
    id: d.id, title: d.title, note: d.note, date: d.date || d.createdAt, amount: Number(d.amount) || 0
  })), [debts, startDate, endDate]);

  const receivableList = useMemo(() => debts.filter(d => d.category === 'debt_receivable' && inRange(d.date || d.createdAt)).map(d => ({
    id: d.id, title: d.title, note: d.note, date: d.date || d.createdAt, amount: Number(d.amount) || 0
  })), [debts, startDate, endDate]);

  const payrollList = useMemo(() => {
    return employees.map(emp => {
      const sal = Number(emp.salary) || 0;
      const adv = Number(emp.advances) || 0;
      const net = Math.max(0, sal - adv);
      return { id: emp.id, empName: emp.name, area: emp.area || 'Operaciones', salary: sal, discount: adv, netPay: net, date: getLocalDateString(new Date()) };
    });
  }, [employees]);

  const totalProjects = projectsList.reduce((s, p) => s + p.amount, 0);
  const totalIn = incomesList.reduce((s, i) => s + i.amount, 0);
  const totalAdv = advancesList.reduce((s, a) => s + a.amount, 0);
  const totalDebtsPay = payableList.reduce((s, d) => s + d.amount, 0);
  const totalDebtsRec = receivableList.reduce((s, d) => s + d.amount, 0);
  const totalPayrollNet = payrollList.reduce((s, p) => s + p.netPay, 0);
  const grandTotalExpenses = totalAdv + totalDebtsPay + totalPayrollNet;
  const grandTotalIncome = totalProjects + totalIn + totalDebtsRec;

  const handlePrint = () => {
    printFinanceStatementPdf({
      profileImage,
      periodLabel,
      grandTotalIncome,
      grandTotalExpenses,
      projectsList,
      incomesList,
      receivableList,
      payrollList,
      advancesList,
      payableList,
    });
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={`Auditoría Financiera (${periodLabel})`}
      maxWidth={840}
      minHeight={620}
      height={Platform.OS === 'web' ? '82vh' : 620}
    >
      <View style={styles.container}>
        {/* Top Actions & Print */}
        <View style={styles.topActionBar}>
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.8}>
            <Ionicons name="print-outline" size={15} color="#ffffff" />
            <Text style={styles.printBtnText}>Imprimir / Exportar PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiBox, { borderColor: THEME.colors.success }]}>
            <Text style={styles.kpiLabel}>Total Entradas</Text>
            <Text style={[styles.kpiVal, { color: THEME.colors.success }]}>+{formatCurrency(grandTotalIncome)}</Text>
          </View>
          <View style={[styles.kpiBox, { borderColor: THEME.colors.danger }]}>
            <Text style={styles.kpiLabel}>Total Salidas / Pagos</Text>
            <Text style={[styles.kpiVal, { color: THEME.colors.danger }]}>-{formatCurrency(grandTotalExpenses)}</Text>
          </View>
          <View style={[styles.kpiBox, { borderColor: THEME.colors.primary }]}>
            <Text style={styles.kpiLabel}>Flujo Neto</Text>
            <Text style={[styles.kpiVal, { color: grandTotalIncome >= grandTotalExpenses ? THEME.colors.primary : THEME.colors.danger }]}>
              {formatCurrency(grandTotalIncome - grandTotalExpenses)}
            </Text>
          </View>
        </View>

        <View style={styles.tabScroll}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.id} style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]} onPress={() => setActiveTab(tab.id)}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listScrollContent} showsVerticalScrollIndicator={true}>
          {/* Projects Income */}
          {(activeTab === 'all' || activeTab === 'projects') && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: THEME.colors.success }]}>💼 Ingresos por Proyectos ({formatCurrency(totalProjects)})</Text>
              {projectsList.length > 0 ? projectsList.map(p => (
                <View key={p.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.title}</Text>
                    <Text style={styles.rowDetail}>{p.description} • Fecha: 📅 {p.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.success }]}>+{formatCurrency(p.amount)}</Text>
                    <Text style={styles.rowDate}>📅 {p.date}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>No hay proyectos registrados</Text>}
            </View>
          )}

          {/* Extra Incomes */}
          {(activeTab === 'all' || activeTab === 'incomes') && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>⭐ Ingresos Extras ({formatCurrency(totalIn)})</Text>
              {incomesList.length > 0 ? incomesList.map(i => (
                <View key={i.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{i.title}</Text>
                    <Text style={styles.rowDetail}>{i.note ? `${i.note} • ` : ''}Fecha ingreso: 📅 {formatDate(i.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.success }]}>+{formatCurrency(i.amount)}</Text>
                    <Text style={styles.rowDate}>📅 {formatDate(i.date)}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>No hay ingresos extras en este período</Text>}
            </View>
          )}

          {/* Cuentas Por Cobrar */}
          {(activeTab === 'all' || activeTab === 'receivable') && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: THEME.colors.accent }]}>🔵 Cuentas por Cobrar ({formatCurrency(totalDebtsRec)})</Text>
              {receivableList.length > 0 ? receivableList.map(d => (
                <View key={d.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{d.title}</Text>
                    <Text style={styles.rowDetail}>{d.note ? `${d.note} • ` : ''}Fecha registro: 📅 {formatDate(d.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.accent }]}>+{formatCurrency(d.amount)}</Text>
                    <Text style={styles.rowDate}>📅 {formatDate(d.date)}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>No hay cuentas por cobrar en este período</Text>}
            </View>
          )}

          {/* Payroll List */}
          {(activeTab === 'all' || activeTab === 'payroll') && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: THEME.colors.warning }]}>👥 Nómina y Pagos a Empleados ({formatCurrency(totalPayrollNet)})</Text>
              {payrollList.map(p => (
                <View key={p.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.empName} <Text style={styles.rowSub}>({p.area})</Text></Text>
                    <Text style={styles.rowDetail}>Base: {formatCurrency(p.salary)} • Adelanto Restado: -{formatCurrency(p.discount)} • Fecha: 📅 {formatDate(p.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.warning }]}>{formatCurrency(p.netPay)}</Text>
                    <Text style={styles.rowDate}>📅 {formatDate(p.date)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Advances List */}
          {(activeTab === 'all' || activeTab === 'advances') && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: THEME.colors.danger }]}>💳 Adelantos Entregados ({formatCurrency(totalAdv)})</Text>
              {advancesList.length > 0 ? advancesList.map((a, idx) => (
                <View key={`${a.id}-${idx}`} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{a.title}</Text>
                    <Text style={styles.rowDetail}>{a.note ? `${a.note} • ` : ''}Fecha entrega: 📅 {formatDate(a.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.danger }]}>-{formatCurrency(a.amount)}</Text>
                    <Text style={styles.rowDate}>📅 {formatDate(a.date)}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>No hay adelantos en este período</Text>}
            </View>
          )}

          {/* Deudas Por Pagar */}
          {(activeTab === 'all' || activeTab === 'payable') && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: THEME.colors.danger }]}>🔴 Deudas por Pagar ({formatCurrency(totalDebtsPay)})</Text>
              {payableList.length > 0 ? payableList.map(d => (
                <View key={d.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{d.title}</Text>
                    <Text style={styles.rowDetail}>{d.note ? `${d.note} • ` : ''}Fecha límite / registro: 📅 {formatDate(d.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: THEME.colors.danger }]}>-{formatCurrency(d.amount)}</Text>
                    <Text style={styles.rowDate}>📅 {formatDate(d.date)}</Text>
                  </View>
                </View>
              )) : <Text style={styles.emptyText}>No hay deudas por pagar en este período</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10, flex: 1 },
  topActionBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  printBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.radius.sm },
  printBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  kpiRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  kpiBox: { flex: 1, minWidth: 120, backgroundColor: '#f8fafc', padding: 8, borderRadius: THEME.radius.md, borderWidth: 1 },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  kpiVal: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  tabScroll: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: 4, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: '#e2e8f0' },
  tabBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  tabBtnActive: { backgroundColor: THEME.colors.primary },
  tabText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#ffffff', fontWeight: '900' },
  listScroll: { flex: 1, minHeight: 380 },
  listScrollContent: { minHeight: 380, paddingBottom: 16 },
  section: { marginBottom: 14 },
  sectionHeader: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 10, borderRadius: THEME.radius.md, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  rowTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  rowSub: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '400' },
  rowDetail: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  rowAmount: { fontSize: 13, fontWeight: '800' },
  rowDate: { color: THEME.colors.textDim, fontSize: 10, marginTop: 2, fontWeight: '600' },
  emptyText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic', paddingVertical: 14, textAlign: 'center' },
});
