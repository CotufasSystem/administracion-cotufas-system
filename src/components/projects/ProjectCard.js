import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { EditIcon, TrashIcon, RestaurantIcon, UserIcon } from '../common/AppIcons';

export const ProjectCard = ({ project, onEdit, onDelete, onOpenRestaurants, restaurantsCount = 0 }) => {
  const { employees } = useApp();

  const assignedEmployees = employees.filter(e => (e.projectIds || []).includes(project.id));
  const isCompleted = project.status === 'completed';
  const isMaseasy = (project.name || '').toLowerCase().includes('maseasy');

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.name}>{project.name}</Text>
          <View style={[styles.statusBadge, isCompleted ? styles.badgeCompleted : styles.badgeActive]}>
            <Text style={[styles.statusText, isCompleted ? styles.statusTextCompleted : styles.statusTextActive]}>
              {isCompleted ? 'Culminado' : 'Activo'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(project)} activeOpacity={0.7} title="Editar Proyecto">
            <EditIcon size={15} color={THEME.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(project.id)} activeOpacity={0.7} title="Eliminar Proyecto">
            <TrashIcon size={15} color={THEME.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue & Restaurants Button (Solo Maseasy) */}
      <View style={styles.revenueBox}>
        <View>
          <Text style={styles.revenueLabel}>Ingreso Mensual del Proyecto:</Text>
          <Text style={styles.revenueValue}>
            {project.monthlyIncome > 0 ? formatCurrency(project.monthlyIncome) : 'Por definir ($0)'}
          </Text>
        </View>
        {isMaseasy && (
          <TouchableOpacity style={styles.restaurantsBtn} onPress={() => onOpenRestaurants(project)} activeOpacity={0.8}>
            <RestaurantIcon size={14} color="#ffffff" />
            <Text style={styles.restaurantsBtnText}>Locales / Clientes ({restaurantsCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note */}
      {project.note ? <Text style={styles.noteText}>{project.note}</Text> : null}

      {/* Team */}
      <View style={styles.teamSection}>
        <Text style={styles.teamLabel}>Equipo Asignado ({assignedEmployees.length}):</Text>
        <View style={styles.teamList}>
          {assignedEmployees.length > 0 ? (
            assignedEmployees.map((emp) => (
              <View key={emp.id} style={styles.empTag}>
                <UserIcon size={12} color={THEME.colors.primary} />
                <Text style={styles.empTagText}>{emp.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTeamText}>Sin empleados asignados</Text>
          )}
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
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompleted: { opacity: 0.75, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: THEME.colors.textMain, fontSize: 16.5, fontWeight: '900', letterSpacing: -0.3 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  badgeActive: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  badgeCompleted: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusTextActive: { color: '#15803d' },
  statusTextCompleted: { color: '#64748b' },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', padding: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  revenueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 8,
  },
  revenueLabel: { color: THEME.colors.textDim, fontSize: 11.5, fontWeight: '700' },
  revenueValue: { color: THEME.colors.success, fontSize: 16, fontWeight: '900' },
  restaurantsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  restaurantsBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  noteText: { color: THEME.colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  teamSection: { gap: 6, marginTop: 2 },
  teamLabel: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  teamList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  empTagText: { color: THEME.colors.textMain, fontSize: 11.5, fontWeight: '700' },
  noTeamText: { color: THEME.colors.textDim, fontSize: 11, fontStyle: 'italic' },
});
