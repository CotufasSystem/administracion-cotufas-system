import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';

export const RuleModal = ({ visible, rule, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (rule) {
      setTitle(rule.title || '');
      setDescription(rule.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [visible, rule]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;
    onSave({
      ...(rule || {}),
      title: title.trim(),
      description: description.trim(),
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={rule ? 'Editar Regla de la Empresa' : 'Nueva Regla de la Empresa'}
    >
      <View style={styles.content}>
        <CustomInput
          label="Título de la Norma"
          placeholder="Ej: Política de Entregas y Reportes"
          value={title}
          onChangeText={setTitle}
        />

        <CustomInput
          label="Descripción Detallada"
          placeholder="Ej: Todo empleado debe reportar sus horas..."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.btnRow}>
          <PrimaryButton
            title="Cancelar"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title="Guardar Regla"
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
  btnRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
});
