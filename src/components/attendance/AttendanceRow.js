import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export const AttendanceRow = ({ employee, record, onStatusChange, onValidate }) => {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const status = typeof record === 'object' ? record?.status : record;
  const customHours = typeof record === 'object' ? record?.hours : null;
  const permissionNote = typeof record === 'object' ? record?.note : '';
  const isPending = typeof record === 'object' && record?.pendingValidation;
  const notifiedAt = typeof record === 'object' ? record?.notifiedAt : null;
  const checkOutTime = typeof record === 'object' ? (record?.checkOutTime || record?.checkoutAt) : null;
  const displayHours = customHours || employee.schedule || '9:00 AM - 5:00 PM';

  const [hoursInput, setHoursInput] = useState(displayHours);
  const [noteInput, setNoteInput] = useState(permissionNote || '');

  const options = [
    { key: 'present', label: 'Presente', icon: 'checkmark-circle', color: THEME.colors.success },
    { key: 'absent', label: 'Falta', icon: 'close-circle', color: THEME.colors.danger },
    { key: 'permission', label: 'Permiso', icon: 'document-text', color: THEME.colors.accent },
  ];

  const handleSaveHours = () => {
    onStatusChange(employee.id, status || 'present', hoursInput.trim(), permissionNote);
    setIsEditingHours(false);
  };

  const handleResetHours = () => {
    setHoursInput(employee.schedule || '9:00 AM - 5:00 PM');
    onStatusChange(employee.id, status || 'present', null, permissionNote);
    setIsEditingHours(false);
  };

  const handleSaveNote = () => {
    onStatusChange(employee.id, 'permission', customHours, noteInput.trim());
    setIsEditingNote(false);
  };

  const handleSelectOption = (optKey) => {
    const newStatus = status === optKey ? null : optKey;
    onStatusChange(employee.id, newStatus, customHours, permissionNote);
    if (newStatus === 'permission' && !permissionNote) setIsEditingNote(true);
  };

  return (
    <View style={[styles.row, isPending && styles.rowPending]}>
      <View style={styles.empInfo}>
        <View style={styles.nameBox}>
          <Text style={styles.name}>{employee.portalUsername || employee.name}</Text>
          {employee.portalUsername && employee.portalUsername !== employee.name && (
            <Text style={styles.legalSubName}>({employee.name})</Text>
          )}
          {isPending && (
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={12} color={THEME.colors.warning} />
              <Text style={styles.pendingBadgeText}>
                Entrada: {notifiedAt || 'Hoy'}{checkOutTime ? ` • Salida: ${checkOutTime}` : ''}
              </Text>
            </View>
          )}
          {!isPending && (notifiedAt || checkOutTime) && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={11} color={THEME.colors.success} />
              <Text style={styles.timeBadgeText}>
                {notifiedAt ? `Entrada: ${notifiedAt}` : ''}{checkOutTime ? ` • Salida: ${checkOutTime}` : ''}
              </Text>
            </View>
          )}
          {customHours && customHours !== employee.schedule && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Horario Ajustado</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRight}>
          {isPending && onValidate && (
            <TouchableOpacity style={styles.validateBtn} onPress={() => onValidate(employee.id)} activeOpacity={0.8}>
              <Ionicons name="checkmark-done" size={13} color="#ffffff" />
              <Text style={styles.validateBtnText}>Validar</Text>
            </TouchableOpacity>
          )}

          {isEditingHours ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.inputField}
                value={hoursInput}
                onChangeText={setHoursInput}
                placeholder="Ej: 9:00 AM - 6:30 PM"
                placeholderTextColor={THEME.colors.textDim}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveHours} style={styles.iconBtnAction}>
                <Ionicons name="checkmark-circle" size={20} color={THEME.colors.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetHours} style={styles.iconBtnAction}>
                <Ionicons name="refresh" size={16} color={THEME.colors.warning} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditingHours(false)} style={styles.iconBtnAction}>
                <Ionicons name="close-circle" size={20} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => { setHoursInput(displayHours); setIsEditingHours(true); }}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={13} color={customHours ? THEME.colors.primary : THEME.colors.textMuted} />
              <Text style={[styles.scheduleText, customHours && styles.scheduleTextCustom]}>{displayHours}</Text>
              <Ionicons name="pencil" size={11} color={THEME.colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.buttonsGroup}>
        {options.map((opt) => {
          const isSelected = status === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.optBtn, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}
              onPress={() => handleSelectOption(opt.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={opt.icon} size={14} color={isSelected ? '#000' : opt.color} />
              <Text style={[styles.optText, isSelected && styles.optTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Permission Note */}
      {status === 'permission' && (
        <View style={styles.permissionSection}>
          {isEditingNote ? (
            <View style={styles.editBox}>
              <TextInput
                style={[styles.inputField, { flex: 1 }]}
                value={noteInput}
                onChangeText={setNoteInput}
                placeholder="Motivo u observación del permiso (ej: Cita médica)..."
                placeholderTextColor={THEME.colors.textDim}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveNote} style={styles.iconBtnAction}>
                <Ionicons name="checkmark-circle" size={20} color={THEME.colors.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditingNote(false)} style={styles.iconBtnAction}>
                <Ionicons name="close-circle" size={20} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.permissionNoteBtn}
              onPress={() => { setNoteInput(permissionNote || ''); setIsEditingNote(true); }}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={14} color={THEME.colors.accent} />
              <Text style={styles.permissionNoteText}>
                {permissionNote ? `Observación: ${permissionNote}` : '+ Agregar motivo / observación del permiso'}
              </Text>
              <Ionicons name="pencil" size={12} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  rowPending: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffdf5',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.1,
  },
  empInfo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nameBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { color: THEME.colors.textMain, fontSize: 14.5, fontWeight: '800' },
  legalSubName: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '500' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef3c7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#fde68a' },
  pendingBadgeText: { color: '#b45309', fontSize: 10, fontWeight: '800' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ecfdf5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#a7f3d0' },
  timeBadgeText: { color: '#047857', fontSize: 10, fontWeight: '700' },
  customBadge: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  customBadgeText: { color: THEME.colors.primary, fontSize: 9, fontWeight: '800' },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  validateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.success, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  validateBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f8fafc', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  scheduleText: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '700' },
  scheduleTextCustom: { color: THEME.colors.primary, fontWeight: '800' },
  editBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inputField: { backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: THEME.colors.primary, color: THEME.colors.textMain, fontSize: 12, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, minWidth: 150, outlineStyle: 'none' },
  iconBtnAction: { padding: 3 },
  buttonsGroup: { flexDirection: 'row', gap: 6 },
  optBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  optText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  optTextSelected: { color: '#000000', fontWeight: '900' },
  permissionSection: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 8, padding: 8 },
  permissionNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  permissionNoteText: { flex: 1, color: THEME.colors.accent, fontSize: 11.5, fontWeight: '700' },
});
