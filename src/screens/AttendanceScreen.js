import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { AttendanceRow } from '../components/attendance/AttendanceRow';
import { AttendanceReportModal } from '../components/attendance/AttendanceReportModal';
import { EmployeePortalModal } from '../components/attendance/EmployeePortalModal';
import { formatDate, getLocalDateString } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const AttendanceScreen = () => {
  const { employees, projects, attendance, setEmployeeAttendance, markGroupAttendance, validateAttendance, validateAllPendingAttendance } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const dayRecords = attendance[selectedDate] || {};
  const activeAttendanceEmployees = employees.filter(e => !e.exemptAttendance && e.status !== 'inactive');

  const projectGroups = projects.map((proj) => ({
    id: proj.id,
    name: proj.name,
    isProject: true,
    employees: activeAttendanceEmployees.filter((e) => (e.projectIds || []).includes(proj.id)),
  }));

  const internalGroup = {
    id: 'internal',
    name: 'Personal Interno / Servicios',
    isProject: false,
    employees: activeAttendanceEmployees.filter((e) => !e.projectIds || e.projectIds.length === 0),
  };

  const allGroups = [...projectGroups, internalGroup];

  const visibleGroups = selectedProjectFilter === 'all'
    ? allGroups.filter(g => g.employees.length > 0)
    : allGroups.filter(g => g.id === selectedProjectFilter);

  const getStatus = (rec) => typeof rec === 'object' ? rec?.status : rec;

  const stats = { present: 0, absent: 0, permission: 0, unmarked: 0 };
  let pendingCount = 0;
  activeAttendanceEmployees.forEach((e) => {
    const rec = dayRecords[e.id];
    const status = getStatus(rec);
    if (typeof rec === 'object' && rec?.pendingValidation) pendingCount++;
    if (status && stats[status] !== undefined) stats[status]++;
    else stats.unmarked++;
  });

  const handleMarkGroup = (groupEmps, status) => {
    markGroupAttendance(selectedDate, groupEmps.map(e => e.id), status);
  };

  const changeDateByDays = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    setSelectedDate(getLocalDateString(dateObj));
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <PrimaryButton
          title="Planilla Semanal / Mensual"
          icon="grid-outline"
          variant="warning"
          onPress={() => setIsReportModalVisible(true)}
          small
        />
      </View>

      {/* Pending Validation Alert Banner */}
      {pendingCount > 0 && (
        <View style={styles.pendingAlertBanner}>
          <Ionicons name="notifications" size={18} color="#ffffff" />
          <Text style={styles.pendingAlertText}>
            ⚡ {pendingCount} {pendingCount === 1 ? 'asistencia notificada' : 'asistencias notificadas'} por validar
          </Text>
          <TouchableOpacity
            style={styles.validateAllBtn}
            onPress={() => validateAllPendingAttendance(selectedDate)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={14} color="#000000" />
            <Text style={styles.validateAllBtnText}>Validar Todas</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Navigator */}
      <View style={styles.dateNavCard}>
        <View style={styles.dateNavRow}>
          <TouchableOpacity style={styles.dateArrowBtn} onPress={() => changeDateByDays(-1)}>
            <Ionicons name="chevron-back" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>

          <View style={styles.dateInfoBox}>
            <Ionicons name="calendar-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)} ({selectedDate})</Text>
          </View>

          <TouchableOpacity style={styles.dateArrowBtn} onPress={() => changeDateByDays(1)}>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBadge, { borderColor: THEME.colors.success }]}>
          <Text style={[styles.statNum, { color: THEME.colors.success }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={[styles.statBadge, { borderColor: THEME.colors.danger }]}>
          <Text style={[styles.statNum, { color: THEME.colors.danger }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
        <View style={[styles.statBadge, { borderColor: THEME.colors.primary }]}>
          <Text style={[styles.statNum, { color: THEME.colors.primary }]}>{stats.permission}</Text>
          <Text style={styles.statLabel}>Permisos</Text>
        </View>
        <View style={[styles.statBadge, { borderColor: THEME.colors.textDim }]}>
          <Text style={[styles.statNum, { color: THEME.colors.textDim }]}>{stats.unmarked}</Text>
          <Text style={styles.statLabel}>Sin Marcar</Text>
        </View>
      </View>

      {/* Project Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, selectedProjectFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedProjectFilter('all')}
        >
          <Text style={[styles.filterText, selectedProjectFilter === 'all' && styles.filterTextActive]}>
            Todos los Grupos ({activeAttendanceEmployees.length})
          </Text>
        </TouchableOpacity>
        {allGroups.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.filterChip, selectedProjectFilter === g.id && styles.filterChipActive]}
            onPress={() => setSelectedProjectFilter(g.id)}
          >
            <Text style={[styles.filterText, selectedProjectFilter === g.id && styles.filterTextActive]}>
              {g.name} ({g.employees.length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Groups Attendance List */}
      {visibleGroups.map((group) => (
        <Card
          key={group.id}
          title={`${group.name} (${group.employees.length} Asignados)`}
          icon={group.isProject ? "briefcase-outline" : "people-outline"}
          rightAction={
            <TouchableOpacity
              style={styles.quickGroupBtn}
              onPress={() => handleMarkGroup(group.employees, 'present')}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={13} color="#ffffff" />
              <Text style={styles.quickGroupBtnText}>Marcar Presentes</Text>
            </TouchableOpacity>
          }
        >
          {group.employees.map((emp) => (
            <AttendanceRow
              key={emp.id}
              employee={emp}
              record={dayRecords[emp.id]}
              onStatusChange={(eId, st, h, nt) => setEmployeeAttendance(selectedDate, eId, st, h, nt)}
              onValidate={(eId) => validateAttendance(selectedDate, eId)}
            />
          ))}
        </Card>
      ))}

      <AttendanceReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  pendingAlertBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d97706', padding: 12, borderRadius: THEME.radius.md, gap: 10 },
  pendingAlertText: { color: '#ffffff', fontSize: 13, fontWeight: '800', flex: 1 },
  validateAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.radius.sm },
  validateAllBtnText: { color: '#000000', fontSize: 11, fontWeight: '900' },
  dateNavCard: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', padding: 10 },
  dateNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateArrowBtn: { padding: 6, backgroundColor: '#ffffff', borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  dateInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statBadge: { flex: 1, minWidth: 70, backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: 8, borderRadius: THEME.radius.md, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { color: THEME.colors.textDim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  filterScroll: { gap: 8, paddingVertical: 4 },
  filterChip: { backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  filterChipActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  filterText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#ffffff', fontWeight: '800' },
  quickGroupBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  quickGroupBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
});
