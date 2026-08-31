import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { FinanceDetailReportModal } from './FinanceDetailReportModal';
import { formatCurrency, getLocalDateString } from '../../utils/formatters';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const FinancePeriodSummary = ({ extraIncomes = [], debts = [], projects = [], employees = [] }) => {
  const [periodMode, setPeriodMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);

  const period = useMemo(() => {
    const d = new Date(currentDate);
    if (periodMode === 'day') {
      const s = getLocalDateString(d);
      return { start: s, end: s, label: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) };
    }
    if (periodMode === 'week') {
      const day = d.getDay();
      const mon = new Date(d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { start: getLocalDateString(mon), end: getLocalDateString(sun), label: `Sem: ${mon.getDate()} ${MONTHS[mon.getMonth()]} - ${sun.getDate()} ${MONTHS[sun.getMonth()]}` };
    }
    if (periodMode === 'month') {
      const f = new Date(d.getFullYear(), d.getMonth(), 1), l = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start: getLocalDateString(f), end: getLocalDateString(l), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
    }
    return { start: '1970-01-01', end: '2099-12-31', label: 'Histórico Global (Todo)' };
  }, [currentDate, periodMode]);

  const handleNav = (delta) => {
    if (periodMode === 'all') return;
    const n = new Date(currentDate);
    if (periodMode === 'day') n.setDate(n.getDate() + delta);
    else if (periodMode === 'week') n.setDate(n.getDate() + delta * 7);
    else if (periodMode === 'month') n.setMonth(n.getMonth() + delta);
    setCurrentDate(n);
  };

  const stats = useMemo(() => {
    const inRange = (dStr) => {
      if (!dStr || periodMode === 'all') return true;
      const k = dStr.slice(0, 10);
      return k >= period.start && k <= period.end;
    };

    const extras = extraIncomes.filter(i => inRange(i.date)).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const payable = debts.filter(d => d.category === 'debt_payable' && inRange(d.date || d.createdAt)).reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const receivable = debts.filter(d => d.category === 'debt_receivable' && inRange(d.date || d.createdAt)).reduce((s, d) => s + (Number(d.amount) || 0), 0);

    let advances = 0;
    employees.forEach(e => {
      if (Array.isArray(e.advancesHistory)) e.advancesHistory.forEach(a => { if (inRange(a.date)) advances += (Number(a.amount) || 0); });
      else if (Number(e.advances) > 0 && periodMode === 'all') advances += Number(e.advances);
    });

    const factor = periodMode === 'day' ? (1 / 30) : periodMode === 'week' ? (7 / 30) : 1;
    const projIncome = projects.filter(p => p.status !== 'completed').reduce((s, p) => s + (Number(p.monthlyIncome) || 0), 0) * factor;
    const estPayroll = employees.filter(e => e.status !== 'inactive').reduce((s, e) => s + (Number(e.salary) || 0), 0) * factor;

    const generated = projIncome + extras + receivable;
    const expenses = payable + advances + estPayroll;
    const net = generated - expenses;

    return { extras, payable, receivable, advances, projIncome, estPayroll, generated, expenses, net };
  }, [extraIncomes, debts, projects, employees, period, periodMode]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.modeTabs}>
          {[{ id: 'day', l: 'Día' }, { id: 'week', l: 'Semana' }, { id: 'month', l: 'Mes' }, { id: 'all', l: 'Todo' }].map(m => (
            <TouchableOpacity key={m.id} style={[styles.modeBtn, periodMode === m.id && styles.modeBtnActive]} onPress={() => setPeriodMode(m.id)}>
              <Text style={[styles.modeBtnText, periodMode === m.id && styles.modeBtnTextActive]}>{m.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {periodMode !== 'all' && (
            <TouchableOpacity style={styles.todayBtn} onPress={() => setCurrentDate(new Date())}>
              <Ionicons name="today" size={13} color={THEME.colors.primary} />
              <Text style={styles.todayBtnText}>Hoy</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.auditBtn} onPress={() => setShowDetailModal(true)} activeOpacity={0.8}>
            <Ionicons name="document-text" size={13} color="#000" />
            <Text style={styles.auditBtnText}>Ver Desglose Completo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateNavRow}>
        <TouchableOpacity style={[styles.navBtn, periodMode === 'all' && styles.navBtnDisabled]} onPress={() => handleNav(-1)} disabled={periodMode === 'all'}>
          <Ionicons name="chevron-back" size={16} color={THEME.colors.textMain} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.periodTitleBox} onPress={() => setShowDetailModal(true)} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.periodTitleText}>{period.label}</Text>
          <Ionicons name="open-outline" size={12} color={THEME.colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, periodMode === 'all' && styles.navBtnDisabled]} onPress={() => handleNav(1)} disabled={periodMode === 'all'}>
          <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMain} />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <TouchableOpacity style={[styles.metricBox, { borderLeftColor: THEME.colors.success }]} onPress={() => setShowDetailModal(true)} activeOpacity={0.8}>
          <Text style={styles.metricLabel}>Total Generado</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.success }]}>+{formatCurrency(stats.generated)}</Text>
          <Text style={styles.metricHint}>Toca para ver detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.metricBox, { borderLeftColor: THEME.colors.danger }]} onPress={() => setShowDetailModal(true)} activeOpacity={0.8}>
          <Text style={styles.metricLabel}>Total Gastos / Pagos</Text>
          <Text style={[styles.metricValue, { color: THEME.colors.danger }]}>-{formatCurrency(stats.expenses)}</Text>
          <Text style={styles.metricHint}>Toca para ver detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.metricBox, { borderLeftColor: THEME.colors.primary }]} onPress={() => setShowDetailModal(true)} activeOpacity={0.8}>
          <Text style={styles.metricLabel}>Balance Neto</Text>
          <Text style={[styles.metricValue, { color: stats.net >= 0 ? THEME.colors.primary : THEME.colors.danger }]}>
            {stats.net >= 0 ? '+' : ''}{formatCurrency(stats.net)}
          </Text>
          <Text style={styles.metricHint}>Flujo Libre del Período</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.breakdownRow}>
        <View style={styles.badgeItem}><Text style={styles.badgeLabel}>💼 Proyectos:</Text><Text style={styles.badgeVal}>{formatCurrency(stats.projIncome)}</Text></View>
        <View style={styles.badgeItem}><Text style={styles.badgeLabel}>⭐ Extras:</Text><Text style={[styles.badgeVal, { color: THEME.colors.success }]}>+{formatCurrency(stats.extras)}</Text></View>
        <View style={styles.badgeItem}><Text style={styles.badgeLabel}>👥 Nómina Est.:</Text><Text style={styles.badgeVal}>{formatCurrency(stats.estPayroll)}</Text></View>
        <View style={styles.badgeItem}><Text style={styles.badgeLabel}>💳 Adelantos:</Text><Text style={[styles.badgeVal, { color: THEME.colors.warning }]}>{formatCurrency(stats.advances)}</Text></View>
      </View>

      {/* Modal de Desglose y Auditoría Detallada */}
      <FinanceDetailReportModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        periodLabel={period.label}
        startDate={period.start}
        endDate={period.end}
        extraIncomes={extraIncomes}
        debts={debts}
        employees={employees}
        projects={projects}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', padding: THEME.spacing.md, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  modeTabs: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: THEME.radius.md, padding: 3, gap: 4, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: THEME.radius.sm },
  modeBtnActive: { backgroundColor: THEME.colors.primary },
  modeBtnText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  modeBtnTextActive: { color: '#ffffff', fontWeight: '900' },
  todayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  todayBtnText: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '800' },
  auditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  auditBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  dateNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 8, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  periodTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodTitleText: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  navBtn: { backgroundColor: '#f8fafc', padding: 6, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  navBtnDisabled: { opacity: 0.3 },
  metricsGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metricBox: { flex: 1, minWidth: 140, backgroundColor: '#ffffff', borderRadius: THEME.radius.md, padding: 10, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderLeftWidth: 3 },
  metricLabel: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  metricHint: { color: THEME.colors.textDim, fontSize: 9, marginTop: 2 },
  breakdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: '#ffffff', padding: 8, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  badgeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeLabel: { color: THEME.colors.textDim, fontSize: 10, fontWeight: '600' },
  badgeVal: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '800' },
});
