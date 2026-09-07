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
  card: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', padding: 14, marginBottom: 10, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  ownerBadge: { backgroundColor: 'rgba(245, 158, 11, 0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.primary },
  ownerBadgeText: { color: THEME.colors.primaryLight, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  salaryBadge: { backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)' },
  salaryText: { color: THEME.colors.primaryDark, fontSize: 12, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 6 },
  whatsappBtn: { backgroundColor: 'rgba(37, 211, 102, 0.12)', borderWidth: 1, borderColor: 'rgba(37, 211, 102, 0.3)', padding: 6, borderRadius: THEME.radius.sm, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', padding: 6, borderRadius: THEME.radius.sm, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)', padding: 6, borderRadius: THEME.radius.sm, justifyContent: 'center', alignItems: 'center' },
  contactRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', backgroundColor: '#ffffff', padding: 7, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '600' },
  infoValue: { color: THEME.colors.textMain, fontSize: 12, flex: 1 },
  projectsBox: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  projectsLabel: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '600' },
  projectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  tagText: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '700' },
  internalStaffTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  internalStaffText: { color: THEME.colors.accent, fontSize: 11, fontWeight: '600' },
  exemptBadge: { backgroundColor: 'rgba(100, 116, 139, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border, marginLeft: 6 },
  exemptBadgeText: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700' },
  advanceBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249, 115, 22, 0.12)', padding: 8, borderRadius: THEME.radius.sm },
  advanceText: { color: THEME.colors.warning, fontSize: 11, fontWeight: '700' },
});
