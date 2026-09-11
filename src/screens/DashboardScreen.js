import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card } from '../components/common/UIComponents';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const DashboardScreen = ({ onNavigate }) => {
  const { employees, projects, debts } = useApp();

  const totalProjectIncome = projects.reduce((acc, p) => p.status === 'active' ? acc + (Number(p.monthlyIncome) || 0) : acc, 0);
  const totalBaseSalaries = employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
  const rentExpense = 300;
  const totalMonthlyExpenses = totalBaseSalaries + rentExpense;
  const netEstimatedBalance = totalProjectIncome - totalMonthlyExpenses;
  const totalAdvancesActive = employees.reduce((acc, e) => acc + (Number(e.advances) || 0), 0);
  const pendingDebts = debts.filter(d => d.category === 'debt_payable').reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.quickPayBtn} onPress={() => onNavigate('payroll')} activeOpacity={0.85}>
          <Ionicons name="calculator" size={15} color="#ffffff" />
          <Text style={styles.quickPayText}>Calcular Quincena</Text>
        </TouchableOpacity>
      </View>

      {/* Main KPI Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Ingresos Proyectos / Mes</Text>
            <View style={styles.statIconBox}>
              <Ionicons name="trending-up" size={16} color={THEME.colors.success} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: THEME.colors.success }]}>
            {formatCurrency(totalProjectIncome)}
          </Text>
          <Text style={styles.statHint}>{projects.filter(p => p.status === 'active').length} proyectos activos</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Costo Nómina + Alquiler</Text>
            <View style={styles.statIconBox}>
              <Ionicons name="cash-outline" size={16} color={THEME.colors.warning} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: THEME.colors.warning }]}>
            {formatCurrency(totalMonthlyExpenses)}
          </Text>
          <Text style={styles.statHint}>{employees.length} empleados + $300 alquiler</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Balance Mensual Estimado</Text>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={16} color={netEstimatedBalance >= 0 ? THEME.colors.primary : THEME.colors.danger} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: netEstimatedBalance >= 0 ? THEME.colors.primary : THEME.colors.danger }]}>
            {formatCurrency(netEstimatedBalance)}
          </Text>
          <Text style={styles.statHint}>Diferencia ingresos vs costos fijos</Text>
        </View>
      </View>

      {/* Alerts & Pending Row */}
      <View style={styles.alertsGrid}>
        <TouchableOpacity style={styles.alertCard} onPress={() => onNavigate('advances')} activeOpacity={0.85}>
          <View style={styles.alertIconBox}>
            <Ionicons name="alert-circle" size={18} color={THEME.colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Adelantos Acumulados</Text>
            <Text style={styles.alertValue}>{formatCurrency(totalAdvancesActive)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={THEME.colors.textDim} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.alertCard} onPress={() => onNavigate('finances')} activeOpacity={0.85}>
          <View style={styles.alertIconBox}>
            <Ionicons name="receipt-outline" size={18} color={THEME.colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Deudas por Pagar</Text>
            <Text style={styles.alertValue}>{formatCurrency(pendingDebts)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={THEME.colors.textDim} />
        </TouchableOpacity>
      </View>

      {/* Quick Access Tiles */}
      <Card title="Accesos Rápidos" icon="grid-outline">
        <View style={styles.tilesGrid}>
          {[
            { id: 'payroll', label: 'Nómina & Reparto', icon: 'calculator-outline', color: THEME.colors.primary },
            { id: 'employees', label: 'Empleados A-Z', icon: 'people-outline', color: THEME.colors.accent },
            { id: 'projects', label: 'Proyectos & Tarifas', icon: 'briefcase-outline', color: THEME.colors.success },
            { id: 'attendance', label: 'Asistencia Hoy', icon: 'time-outline', color: THEME.colors.warning },
            { id: 'agenda', label: 'Citas & Negociaciones', icon: 'calendar-outline', color: '#8b5cf6' },
            { id: 'rules', label: 'Reglas & Exportar', icon: 'document-text-outline', color: '#06b6d4' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.tile}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.tileIcon}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.tileLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 18 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  quickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  quickPayText: { color: '#ffffff', fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  statsGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  statCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  statLabel: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  statValue: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  statHint: { color: THEME.colors.textDim, fontSize: 11, marginTop: 5, fontWeight: '600' },
  alertsGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  alertCard: {
    flex: 1,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  alertIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  alertValue: { color: THEME.colors.textMain, fontSize: 18, fontWeight: '900', marginTop: 2 },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: {
    flex: 1,
    minWidth: 145,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  tileIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tileLabel: { color: THEME.colors.textMain, fontSize: 12.5, fontWeight: '800', textAlign: 'center' },
});
