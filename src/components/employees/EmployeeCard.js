import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { EditIcon, TrashIcon, WhatsAppIcon } from '../common/AppIcons';

export const EmployeeCard = ({ employee, onEdit, onDelete, onWhatsApp }) => {
  const { projects } = useApp();

  const assignedProjects = (employee.projectIds || [])
    .map(id => projects.find(p => p.id === id)?.name)
    .filter(Boolean);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{employee.name}</Text>
          {(employee.isOwner || (employee.area && (employee.area.includes('Dueñ') || employee.area.includes('Socio')))) && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>👑 SOCIO</Text>
            </View>
          )}
          <View style={styles.salaryBadge}>
            <Text style={styles.salaryText}>{formatCurrency(employee.salary)} / mes</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => onWhatsApp?.(employee)}
            activeOpacity={0.7}
            title="Enviar Comprobante WhatsApp"
          >
            <WhatsAppIcon size={15} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(employee)} activeOpacity={0.7} title="Editar Empleado">
            <EditIcon size={15} color={THEME.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(employee.id)} activeOpacity={0.7} title="Eliminar Empleado">
            <TrashIcon size={15} color={THEME.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ID & Phone row */}
      {(employee.idCard || employee.phone) ? (
        <View style={styles.contactRow}>
          {employee.idCard ? (
            <View style={styles.contactItem}>
              <Ionicons name="id-card-outline" size={13} color={THEME.colors.primary} />
              <Text style={styles.contactText}>CI: {employee.idCard}</Text>
            </View>
          ) : null}
          {employee.phone ? (
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={13} color={THEME.colors.success} />
              <Text style={styles.contactText}>{employee.phone}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Area / Role Info */}
      <View style={styles.infoRow}>
        <Ionicons name="briefcase-outline" size={14} color={THEME.colors.primary} />
        <Text style={styles.infoLabel}>Área / Cargo:</Text>
        <Text style={styles.infoValue}>{employee.area || 'Personal General'}</Text>
      </View>

      {/* Hire Date if available */}
      {employee.hireDate ? (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={THEME.colors.accent} />
          <Text style={styles.infoLabel}>Ingreso:</Text>
          <Text style={styles.infoValue}>{employee.hireDate}</Text>
        </View>
      ) : null}

      {/* Binance Info */}
      <View style={styles.infoRow}>
        <Ionicons name="logo-bitcoin" size={14} color={THEME.colors.binanceYellow} />
        <Text style={styles.infoLabel}>Binance:</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {employee.binance || 'No registrada'}
        </Text>
      </View>

      {/* Schedule */}
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={14} color={THEME.colors.textMuted} />
        <Text style={styles.infoLabel}>Horario:</Text>
        <Text style={styles.infoValue}>{employee.schedule || '9:00 AM - 5:00 PM'}</Text>
        {employee.exemptAttendance && (
          <View style={styles.exemptBadge}>
            <Text style={styles.exemptBadgeText}>Exento Asistencia</Text>
          </View>
        )}
      </View>

      {/* Projects */}
      <View style={styles.projectsBox}>
        <Text style={styles.projectsLabel}>Proyectos:</Text>
        <View style={styles.projectTags}>
          {assignedProjects.length > 0 ? (
            assignedProjects.map((pName, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{pName}</Text>
              </View>
            ))
          ) : (
            <View style={styles.internalStaffTag}>
              <Ionicons name="sparkles" size={12} color={THEME.colors.accent} />
              <Text style={styles.internalStaffText}>Personal Interno</Text>
            </View>
          )}
        </View>
      </View>

      {/* Advance badge if any */}
      {employee.advances > 0 && (
        <View style={styles.advanceBanner}>
          <Ionicons name="alert-circle" size={14} color={THEME.colors.warning} />
          <Text style={styles.advanceText}>
            Adelanto activo pendiente: {formatCurrency(employee.advances)}
          </Text>
        </View>
      )}
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
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nameContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  name: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  ownerBadge: { backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#f59e0b' },
  ownerBadgeText: { color: '#b45309', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  salaryBadge: { backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  salaryText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 6 },
  whatsappBtn: { backgroundColor: 'rgba(37, 211, 102, 0.12)', borderWidth: 1, borderColor: 'rgba(37, 211, 102, 0.3)', padding: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', padding: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  contactRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactText: { color: THEME.colors.textMain, fontSize: 11.5, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { color: THEME.colors.textDim, fontSize: 12, fontWeight: '700' },
  infoValue: { color: THEME.colors.textMain, fontSize: 12, flex: 1, fontWeight: '600' },
  projectsBox: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  projectsLabel: { color: THEME.colors.textDim, fontSize: 12, fontWeight: '700' },
  projectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  tagText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '800' },
  internalStaffTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  internalStaffText: { color: THEME.colors.accent, fontSize: 11, fontWeight: '700' },
  exemptBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', marginLeft: 6 },
  exemptBadgeText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  advanceBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', padding: 9, borderRadius: 8 },
  advanceText: { color: '#c2410c', fontSize: 11.5, fontWeight: '800' },
});
