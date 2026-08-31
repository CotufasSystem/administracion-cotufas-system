import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';

export const FinanceModal = ({ visible, type, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('extra_income'); // 'extra_income' | 'debt_payable' | 'debt_receivable'
  const [note, setNote] = useState('');

  useEffect(() => {
    setTitle('');
    setAmount('');
    setNote('');
    setCategory(type === 'debt' ? 'debt_payable' : 'extra_income');
  }, [visible, type]);

  const handleSave = () => {
    const num = Number(amount);
    if (!title.trim() || !num || num <= 0) return;
    onSave({
      title: title.trim(),
      amount: num,
      category,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={type === 'debt' ? 'Registrar Deuda / Cuenta' : 'Registrar Ingreso Extra'}
    >
      <View style={styles.content}>
        <CustomInput
          label="Concepto / Descripción"
          placeholder={type === 'debt' ? 'Ej: Préstamo de equipo / Factura pendiente' : 'Ej: Bonificación proyecto Casino'}
          value={title}
          onChangeText={setTitle}
        />

        <CustomInput
          label="Monto ($)"
          placeholder="Ej: 150"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {type === 'debt' && (
          <View style={styles.catGroup}>
            <Text style={styles.catLabel}>Tipo de Deuda</Text>
            <View style={styles.catButtons}>
              <TouchableOpacity
                style={[styles.catBtn, category === 'debt_payable' && styles.catBtnDanger]}
                onPress={() => setCategory('debt_payable')}
              >
                <Text style={[styles.catText, category === 'debt_payable' && styles.catTextActive]}>
                  Por Pagar (Pasivo)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.catBtn, category === 'debt_receivable' && styles.catBtnSuccess]}
                onPress={() => setCategory('debt_receivable')}
              >
                <Text style={[styles.catText, category === 'debt_receivable' && styles.catTextActive]}>
                  Por Cobrar (Activo)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CustomInput
          label="Notas Adicionales"
          placeholder="Ej: Vence a fin de mes"
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
            title="Guardar Registro"
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
  catGroup: {
    marginBottom: THEME.spacing.sm,
  },
  catLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  catButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgDark,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  catBtnDanger: {
    borderColor: THEME.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  catBtnSuccess: {
    borderColor: THEME.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  catText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
});
