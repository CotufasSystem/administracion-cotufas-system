import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { getLocalDateString } from '../../utils/formatters';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = [
  { key: 0, label: 'Lun' },
  { key: 1, label: 'Mar' },
  { key: 2, label: 'Mié' },
  { key: 3, label: 'Jue' },
  { key: 4, label: 'Vie' },
];

export const AttendanceReportModal = ({ visible, onClose, employees = [], attendance = {} }) => {
  const [reportType, setReportType] = useState('weekly'); // 'weekly' | 'monthly'
  const [baseDate, setBaseDate] = useState(() => new Date());

  const activeEmployees = employees.filter(e => !e.exemptAttendance && e.status !== 'inactive');

  // --- WEEKLY (5 DAYS) ---
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const monday = getMonday(baseDate);
  const weekDays = WEEKDAYS.map((w, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dateKey = getLocalDateString(dayDate);
    const dNum = String(dayDate.getDate()).padStart(2, '0');
    const mNum = String(dayDate.getMonth() + 1).padStart(2, '0');
    return { ...w, dateKey, dateFormatted: `${dNum}/${mNum}`, isToday: dateKey === getLocalDateString(new Date()) };
  });

  // --- MONTHLY (ALL WEEKS OF MONTH) ---
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Group workdays of month into weeks
  const monthWeeks = [];
  let curMonday = getMonday(firstOfMonth);

  while (curMonday <= lastOfMonth) {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(curMonday);
      d.setDate(curMonday.getDate() + i);
      if (d.getMonth() === month) {
        const dKey = getLocalDateString(d);
        days.push({
          dateKey: dKey,
          dayNum: d.getDate(),
          label: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][i],
          isToday: dKey === getLocalDateString(new Date()),
        });
      }
    }
    if (days.length > 0) {
      monthWeeks.push({ weekStart: new Date(curMonday), days });
    }
    curMonday.setDate(curMonday.getDate() + 7);
  }

  const changePeriod = (delta) => {
    const newD = new Date(baseDate);
    if (reportType === 'weekly') newD.setDate(newD.getDate() + delta * 7);
    else newD.setMonth(newD.getMonth() + delta);
    setBaseDate(newD);
  };

  const getCellStatus = (dateKey, empId) => {
    const rec = (attendance[dateKey] || {})[empId];
    if (!rec) return null;
    return typeof rec === 'object' ? rec : { status: rec };
  };

  const renderStatusBox = (rec) => {
    if (!rec || !rec.status) return <Text style={styles.cellEmptyText}>-</Text>;
    if (rec.status === 'present') return <View style={[styles.statusBox, styles.statusPresent]}><Text style={styles.statusTextPresent}>P</Text></View>;
    if (rec.status === 'absent') return <View style={[styles.statusBox, styles.statusAbsent]}><Text style={styles.statusTextAbsent}>F</Text></View>;
    if (rec.status === 'permission') return <View style={[styles.statusBox, styles.statusPerm]}><Text style={styles.statusTextPerm}>PERM</Text></View>;
    return <Text style={styles.cellEmptyText}>-</Text>;
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Planilla de Asistencia (Lunes a Viernes)" maxWidth={780}>
      <View style={styles.container}>
        {/* Toggle Switch */}
        <View style={styles.switchRow}>
          <TouchableOpacity style={[styles.switchBtn, reportType === 'weekly' && styles.switchBtnActive]} onPress={() => setReportType('weekly')}>
            <Ionicons name="calendar-outline" size={14} color={reportType === 'weekly' ? '#000' : THEME.colors.textMuted} />
            <Text style={[styles.switchBtnText, reportType === 'weekly' && styles.switchBtnTextActive]}>Vista Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.switchBtn, reportType === 'monthly' && styles.switchBtnActive]} onPress={() => setReportType('monthly')}>
            <Ionicons name="calendar" size={14} color={reportType === 'monthly' ? '#000' : THEME.colors.textMuted} />
            <Text style={[styles.switchBtnText, reportType === 'monthly' && styles.switchBtnTextActive]}>Resumen Mensual</Text>
          </TouchableOpacity>
        </View>

        {/* Navigator */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => changePeriod(-1)}>
            <Ionicons name="chevron-back" size={18} color={THEME.colors.textMain} />
          </TouchableOpacity>
          <View style={styles.weekTitleBox}>
            <Ionicons name="calendar" size={16} color={THEME.colors.primary} />
            <Text style={styles.weekTitle}>
              {reportType === 'weekly' ? `Semana: ${weekDays[0].dateFormatted} al ${weekDays[4].dateFormatted}` : `${MONTH_NAMES[month]} ${year}`}
            </Text>
          </View>
          <View style={styles.navRightGroup}>
            <TouchableOpacity style={styles.todayBtn} onPress={() => setBaseDate(new Date())}>
              <Text style={styles.todayBtnText}>Hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => changePeriod(1)}>
              <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: THEME.colors.success }]} /><Text style={styles.legendText}>P = Asistió</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: THEME.colors.danger }]} /><Text style={styles.legendText}>F = Faltó</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: THEME.colors.accent }]} /><Text style={styles.legendText}>PERM = Permiso</Text></View>
        </View>

        {/* 100% WIDTH TABLE WITHOUT HORIZONTAL SCROLLBAR */}
        {reportType === 'weekly' ? (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={styles.colEmployee}><Text style={styles.headerTitle}>Empleado</Text></View>
              {weekDays.map(wd => (
                <View key={wd.key} style={[styles.colDay, wd.isToday && styles.colDayToday]}>
                  <Text style={[styles.dayHeaderName, wd.isToday && styles.dayHeaderNameToday]}>{wd.label}</Text>
                  <Text style={styles.dayHeaderDate}>{wd.dateFormatted}</Text>
                </View>
              ))}
              <View style={styles.colSummary}><Text style={styles.headerTitle}>Total</Text></View>
            </View>

            {activeEmployees.map(emp => {
              let p = 0, f = 0, perm = 0;
              weekDays.forEach(wd => {
                const rec = getCellStatus(wd.dateKey, emp.id);
                if (rec?.status === 'present') p++;
                if (rec?.status === 'absent') f++;
                if (rec?.status === 'permission') perm++;
              });

              return (
                <View key={emp.id} style={styles.tableRow}>
                  <View style={styles.colEmployee}>
                    <Text style={styles.empName}>{emp.portalUsername || emp.name}</Text>
                    {emp.portalUsername && emp.portalUsername !== emp.name ? (
                      <Text style={styles.empLegalSub} numberOfLines={1}>({emp.name})</Text>
                    ) : null}
                    <Text style={styles.empArea} numberOfLines={1}>{emp.area || 'Operaciones'}</Text>
                  </View>
                  {weekDays.map(wd => (
                    <View key={wd.key} style={[styles.colDay, wd.isToday && styles.colDayCellToday]}>
                      {renderStatusBox(getCellStatus(wd.dateKey, emp.id))}
                    </View>
                  ))}
                  <View style={styles.colSummary}>
                    <Text style={[styles.sumTag, { color: THEME.colors.success }]}>{p}P</Text>
                    {f > 0 && <Text style={[styles.sumTag, { color: THEME.colors.danger }]}>{f}F</Text>}
                    {perm > 0 && <Text style={[styles.sumTag, { color: THEME.colors.accent }]}>{perm}P</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* MONTHLY SUMMARY BY WEEKS (NO HORIZONTAL SCROLL) */
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={styles.colEmployee}><Text style={styles.headerTitle}>Empleado</Text></View>
              {monthWeeks.map((mw, idx) => (
                <View key={idx} style={styles.colDay}>
                  <Text style={styles.dayHeaderName}>Sem {idx + 1}</Text>
                  <Text style={styles.dayHeaderDate}>{mw.days.length}d</Text>
                </View>
              ))}
              <View style={styles.colSummary}><Text style={styles.headerTitle}>Total Mes</Text></View>
            </View>

            {activeEmployees.map(emp => {
              let totalP = 0, totalF = 0, totalPerm = 0;
              const weekSummaries = monthWeeks.map(mw => {
                let wp = 0, wf = 0;
                mw.days.forEach(d => {
                  const rec = getCellStatus(d.dateKey, emp.id);
                  if (rec?.status === 'present') { wp++; totalP++; }
                  if (rec?.status === 'absent') { wf++; totalF++; }
                  if (rec?.status === 'permission') { totalPerm++; }
                });
                return { wp, wf, count: mw.days.length };
              });

              return (
                <View key={emp.id} style={styles.tableRow}>
                  <View style={styles.colEmployee}>
                    <Text style={styles.empName}>{emp.portalUsername || emp.name}</Text>
                    {emp.portalUsername && emp.portalUsername !== emp.name ? (
                      <Text style={styles.empLegalSub} numberOfLines={1}>({emp.name})</Text>
                    ) : null}
                    <Text style={styles.empArea} numberOfLines={1}>{emp.area || 'Operaciones'}</Text>
                  </View>
                  {weekSummaries.map((ws, idx) => (
                    <View key={idx} style={styles.colDay}>
                      <View style={styles.monthlyWeekBadge}>
                        <Text style={styles.monthlyWeekText}>{ws.wp}/{ws.count}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.colSummary}>
                    <Text style={[styles.sumTag, { color: THEME.colors.success }]}>{totalP}P</Text>
                    {totalF > 0 && <Text style={[styles.sumTag, { color: THEME.colors.danger }]}>{totalF}F</Text>}
                    {totalPerm > 0 && <Text style={[styles.sumTag, { color: THEME.colors.accent }]}>{totalPerm}PM</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10 },
  switchRow: { flexDirection: 'row', gap: 8, backgroundColor: THEME.colors.bgDark, padding: 4, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  switchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: THEME.radius.sm },
  switchBtnActive: { backgroundColor: THEME.colors.primary },
  switchBtnText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  switchBtnTextActive: { color: '#000000', fontWeight: '900' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.bgDark, padding: 8, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  weekTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weekTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  navRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBtn: { backgroundColor: THEME.colors.bgSurface, padding: 6, borderRadius: THEME.radius.sm },
  todayBtn: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.primary },
  todayBtnText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '800' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingVertical: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  table: { backgroundColor: THEME.colors.bgDark, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border, width: '100%' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: THEME.colors.bgSurface, borderBottomWidth: 1, borderBottomColor: THEME.colors.border, paddingVertical: 8, alignItems: 'center' },
  headerTitle: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: THEME.colors.border, paddingVertical: 8, alignItems: 'center' },
  colEmployee: { flex: 2.2, paddingHorizontal: 8 },
  empName: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  empLegalSub: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '500' },
  empArea: { color: THEME.colors.textDim, fontSize: 10 },
  colDay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  colDayToday: { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderRadius: THEME.radius.sm },
  colDayCellToday: { backgroundColor: 'rgba(245, 158, 11, 0.05)' },
  dayHeaderName: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '700' },
  dayHeaderNameToday: { color: THEME.colors.primary, fontWeight: '900' },
  dayHeaderDate: { color: THEME.colors.textDim, fontSize: 9, marginTop: 1 },
  colSummary: { flex: 1.5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  cellEmptyText: { color: THEME.colors.textDim, fontSize: 13, fontWeight: '700' },
  statusBox: { width: 26, height: 26, borderRadius: THEME.radius.sm, alignItems: 'center', justifyContent: 'center' },
  statusPresent: { backgroundColor: THEME.colors.success },
  statusAbsent: { backgroundColor: THEME.colors.danger },
  statusPerm: { backgroundColor: THEME.colors.accent },
  statusTextPresent: { color: '#000000', fontSize: 11, fontWeight: '900' },
  statusTextAbsent: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  statusTextPerm: { color: '#000000', fontSize: 8, fontWeight: '900' },
  sumTag: { fontSize: 10, fontWeight: '800' },
  monthlyWeekBadge: { backgroundColor: THEME.colors.bgSurface, paddingHorizontal: 6, paddingVertical: 3, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border },
  monthlyWeekText: { color: THEME.colors.textMain, fontSize: 10, fontWeight: '700' },
});
