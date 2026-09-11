import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card } from '../components/common/UIComponents';
import { AdvanceModal } from '../components/payroll/AdvanceModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const AdvancesScreen = () => {
  const { employees, addAdvance, clearOrApplyAdvances, deleteAdvanceEntry } = useApp();
  const [filter, setFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [clearingEmp, setClearingEmp] = useState(null);

  const employeesWithAdvances = employees.filter(e => Number(e.advances) > 0);
  const totalAdvancesAmount = employeesWithAdvances.reduce((sum, e) => sum + Number(e.advances), 0);

  const displayedEmployees = employees.filter(e => {
    const hasAdvance = Number(e.advances) > 0;
    if (filter === 'with_advance') return hasAdvance;
    if (filter === 'no_advance') return !hasAdvance;
    return true;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Adelantado Activo</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.warning }]}>{formatCurrency(totalAdvancesAmount)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Empleados con Adelanto</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.primary }]}>{employeesWithAdvances.length} de {employees.length}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Deducción en Próxima Nómina</Text>
          <Text style={[styles.kpiValue, { color: THEME.colors.danger }]}>-{formatCurrency(totalAdvancesAmount)}</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterPill, filter === 'all' && styles.filterPillActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos ({employees.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterPill, filter === 'with_advance' && styles.filterPillActive]} onPress={() => setFilter('with_advance')}>
          <Text style={[styles.filterText, filter === 'with_advance' && styles.filterTextActive]}>Con Adelanto ({employeesWithAdvances.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterPill, filter === 'no_advance' && styles.filterPillActive]} onPress={() => setFilter('no_advance')}>
          <Text style={[styles.filterText, filter === 'no_advance' && styles.filterTextActive]}>Sin Adelanto ({employees.length - employeesWithAdvances.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Employees Advance Cards List */}
      <Card title="Listado de Empleados" icon="card-outline">
        {displayedEmployees.map((emp) => {
          const hasAdvance = Number(emp.advances) > 0;
          const history = Array.isArray(emp.advancesHistory) && emp.advancesHistory.length > 0 ? emp.advancesHistory : [];

          return (
            <View key={emp.id} style={styles.employeeCard}>
              <View style={styles.empHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.empName}>{emp.name}</Text>
                    {emp.isOwner && <Text style={styles.ownerBadge}>👑 SOCIO</Text>}
                  </View>
                  <Text style={styles.empSub}>Base: {formatCurrency(emp.salary)} • {emp.area || 'Operaciones'}</Text>
                  {emp.binance ? <Text style={styles.binanceText} numberOfLines={1}>🟡 {emp.binance}</Text> : null}
                </View>

                <View style={[styles.statusBox, hasAdvance ? styles.statusBoxActive : styles.statusBoxNone]}>
                  <Ionicons name={hasAdvance ? "alert-circle" : "checkmark-circle"} size={14} color={hasAdvance ? THEME.colors.warning : THEME.colors.success} />
                  <Text style={[styles.statusText, hasAdvance ? styles.statusTextActive : styles.statusTextNone]}>
                    {hasAdvance ? `${formatCurrency(emp.advances)} Total` : 'Al día / $0'}
                  </Text>
                </View>
              </View>

              {history.length > 0 && (
                <View style={styles.entriesBox}>
                  {history.map((h) => (
                    <View key={h.id} style={styles.entryRow}>
                      <Text style={styles.entryDate}>📅 {formatDate(h.date)}</Text>
                      <Text style={styles.entryAmount}>+{formatCurrency(h.amount)}</Text>
                      {h.note ? <Text style={styles.entryNote} numberOfLines={1}>({h.note})</Text> : null}
                      <TouchableOpacity
                        onPress={() => deleteAdvanceEntry(emp.id, h.id)}
                        style={styles.entryDeleteBtn}
                        activeOpacity={0.7}
                        title="Eliminar este adelanto"
                      >
                        <Ionicons name="trash-outline" size={13} color={THEME.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.btnAction, styles.btnManage]} onPress={() => setSelectedEmployee(emp)} activeOpacity={0.7}>
                  <Ionicons name={hasAdvance ? "add-circle-outline" : "add-circle"} size={14} color={THEME.colors.primary} />
                  <Text style={styles.btnManageText}>{hasAdvance ? "+ Sumar / Ver Adelantos" : "+ Dar Adelanto"}</Text>
                </TouchableOpacity>

                {hasAdvance && (
                  <TouchableOpacity style={[styles.btnAction, styles.btnClear]} onPress={() => setClearingEmp(emp)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={13} color={THEME.colors.danger} />
                    <Text style={styles.btnClearText}>Poner en $0</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </Card>

      <AdvanceModal
        visible={Boolean(selectedEmployee)}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSave={addAdvance}
      />

      <PinConfirmModal
        visible={Boolean(clearingEmp)}
        onClose={() => setClearingEmp(null)}
        onConfirm={() => { if (clearingEmp) clearOrApplyAdvances(clearingEmp.id, clearingEmp.advances); }}
        title="Reiniciar Saldo de Adelanto"
        description={`Se pondrá en $0 el adelanto pendiente de ${clearingEmp?.name || 'este empleado'}.`}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  kpiGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 140, marginBottom: 0, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.lg, padding: 14 },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterPill: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.radius.full },
  filterPillActive: { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.primary },
  filterText: { color: THEME.colors.primaryDark, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#ffffff', fontWeight: '900' },
  employeeCard: { backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: 12, borderRadius: THEME.radius.md, marginBottom: 8, gap: 8, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  empHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  empName: { color: THEME.colors.textMain, fontSize: 15, fontWeight: '700' },
  ownerBadge: { color: THEME.colors.primary, fontSize: 10, fontWeight: '800' },
  empSub: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  binanceText: { color: THEME.colors.binanceYellow, fontSize: 11, fontWeight: '600', marginTop: 2 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1 },
  statusBoxActive: { backgroundColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  statusBoxNone: { backgroundColor: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.3)' },
  statusText: { fontSize: 12, fontWeight: '800' },
  statusTextActive: { color: THEME.colors.warning },
  statusTextNone: { color: THEME.colors.success },
  entriesBox: { backgroundColor: '#ffffff', padding: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)', gap: 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDate: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  entryAmount: { color: THEME.colors.warning, fontSize: 12, fontWeight: '800' },
  entryNote: { color: THEME.colors.textDim, fontSize: 11, fontStyle: 'italic', flex: 1 },
  entryDeleteBtn: { padding: 4, borderRadius: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(37, 99, 235, 0.15)', paddingTop: 6 },
  btnAction: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm, borderWidth: 1 },
  btnManage: { backgroundColor: '#ffffff', borderColor: 'rgba(37, 99, 235, 0.2)' },
  btnManageText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  btnClear: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: THEME.colors.danger },
  btnClearText: { color: THEME.colors.danger, fontSize: 11, fontWeight: '700' },
});
