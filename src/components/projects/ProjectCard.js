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
  card: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', padding: 14, marginBottom: 10, gap: 8 },
  cardCompleted: { opacity: 0.75, borderColor: THEME.colors.borderLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: THEME.radius.sm },
  badgeActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeCompleted: { backgroundColor: 'rgba(100, 116, 139, 0.2)' },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statusTextActive: { color: THEME.colors.success },
  statusTextCompleted: { color: THEME.colors.textDim },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', padding: 6, borderRadius: THEME.radius.sm, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)', padding: 6, borderRadius: THEME.radius.sm, justifyContent: 'center', alignItems: 'center' },
  revenueBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)', flexWrap: 'wrap', gap: 8 },
  revenueLabel: { color: THEME.colors.textMuted, fontSize: 11 },
  revenueValue: { color: THEME.colors.success, fontSize: 14, fontWeight: '800' },
  restaurantsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  restaurantsBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  noteText: { color: THEME.colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  teamSection: { gap: 4, marginTop: 2 },
  teamLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  teamList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  empTagText: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '600' },
  noTeamText: { color: THEME.colors.textDim, fontSize: 11, fontStyle: 'italic' },
});
