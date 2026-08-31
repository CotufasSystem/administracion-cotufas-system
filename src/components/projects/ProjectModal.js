import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';

export const ProjectModal = ({ visible, project, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [status, setStatus] = useState('active');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setMonthlyIncome(project.monthlyIncome ? String(project.monthlyIncome) : '0');
      setStatus(project.status || 'active');
      setNote(project.note || '');
    } else {
      setName('');
      setMonthlyIncome('');
      setStatus('active');
      setNote('');
    }
  }, [visible, project]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...(project || {}),
      name: name.trim(),
      monthlyIncome: Number(monthlyIncome) || 0,
      status,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
    >
      <View style={styles.content}>
        <CustomInput
          label="Nombre del Proyecto"
          placeholder="Ej: Casino"
          value={name}
          onChangeText={setName}
        />

        <CustomInput
          label="Mensualidad que se Recibe ($)"
          placeholder="Ej: 2000"
          keyboardType="numeric"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
        />

        <View style={styles.statusGroup}>
          <Text style={styles.statusLabel}>Estado del Proyecto</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusBtn, status === 'active' && styles.statusBtnActive]}
              onPress={() => setStatus('active')}
            >
              <Text style={[styles.statusBtnText, status === 'active' && styles.statusBtnTextActive]}>
                Activo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, status === 'completed' && styles.statusBtnCompleted]}
              onPress={() => setStatus('completed')}
            >
              <Text style={[styles.statusBtnText, status === 'completed' && styles.statusBtnTextCompleted]}>
                Culminado
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomInput
          label="Notas / Descripción"
          placeholder="Ej: Cliente cancela los primeros 5 días del mes"
          multiline
          value={note}
          onChangeText={setNote}
        />

        <View style={styles.btnRow}>
          <PrimaryButton
            title="Cancelar"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title="Guardar Proyecto"
            icon="save-outline"
            onPress={handleSave}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: THEME.spacing.sm,
  },
  statusGroup: {
    marginBottom: THEME.spacing.sm,
  },
  statusLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgDark,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  statusBtnActive: {
    borderColor: THEME.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBtnCompleted: {
    borderColor: THEME.colors.textDim,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    color: THEME.colors.success,
    fontWeight: '700',
  },
  statusBtnTextCompleted: {
    color: THEME.colors.textDim,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
});
