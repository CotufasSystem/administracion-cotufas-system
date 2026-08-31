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
          <Text style={styles.name}>{employee.name}</Text>
          {isPending && (
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={12} color={THEME.colors.warning} />
              <Text style={styles.pendingBadgeText}>Notificó {notifiedAt || 'Hoy'}</Text>
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
  row: { backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.md, padding: 12, marginBottom: 8, gap: 8 },
  rowPending: { borderColor: THEME.colors.warning, backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  empInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  nameBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: THEME.colors.textMain, fontSize: 15, fontWeight: '700' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: THEME.radius.sm },
  pendingBadgeText: { color: THEME.colors.warning, fontSize: 10, fontWeight: '800' },
  customBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: THEME.radius.sm },
  customBadgeText: { color: THEME.colors.primary, fontSize: 9, fontWeight: '800' },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  validateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm },
  validateBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  scheduleText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  scheduleTextCustom: { color: THEME.colors.primary, fontWeight: '700' },
  editBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inputField: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: THEME.colors.primary, color: THEME.colors.textMain, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm, minWidth: 150 },
  iconBtnAction: { padding: 3 },
  buttonsGroup: { flexDirection: 'row', gap: 6 },
  optBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', paddingVertical: 6, paddingHorizontal: 6, borderRadius: THEME.radius.sm },
  optText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  optTextSelected: { color: '#000000', fontWeight: '800' },
  permissionSection: { backgroundColor: 'rgba(56, 189, 248, 0.08)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', borderRadius: THEME.radius.sm, padding: 6 },
  permissionNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  permissionNoteText: { flex: 1, color: THEME.colors.accent, fontSize: 11, fontWeight: '600' },
});
