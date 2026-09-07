import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { WhatsAppIcon } from '../common/AppIcons';
import { formatCurrency } from '../../utils/formatters';
import { buildEmployeeMovementMessage, sendWhatsAppMessage } from '../../utils/whatsappHelper';

const MOVEMENT_TYPES = [
  { id: 'advance', label: '⚡ Adelanto', placeholderNote: 'Adelanto de sueldo quincenal' },
  { id: 'payroll', label: '💵 Nómina', placeholderNote: 'Pago de quincena' },
  { id: 'bonus', label: '🎁 Bono', placeholderNote: 'Bono por desempeño' },
  { id: 'general', label: '📄 Comprobante', placeholderNote: 'Comprobante de pago' },
];

const PAYMENT_METHODS = ['Binance', 'Zelle', 'Efectivo', 'Transferencia'];

export const EmployeeWhatsAppModal = ({ visible, employee, onClose, onSavePhone }) => {
  const [movementType, setMovementType] = useState('advance');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Binance');
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || '');
      setMovementType(employee.advances > 0 ? 'advance' : 'payroll');
      setAmount(employee.advances > 0 ? String(employee.advances) : String(Math.round((Number(employee.salary) || 0) / 2)));
      setNote(employee.advances > 0 ? 'Adelanto de sueldo' : 'Pago de quincena');
      setPaymentMethod(employee.binance ? `Binance (${employee.binance})` : 'Efectivo');
    }
  }, [visible, employee]);

  const message = useMemo(() => {
    if (!employee) return '';
    return buildEmployeeMovementMessage({
      employee,
      movementType,
      amount,
      note,
      paymentMethod,
    });
  }, [employee, movementType, amount, note, paymentMethod]);

  const handleSend = () => {
    if (employee && phone.trim() && phone.trim() !== employee.phone && onSavePhone) {
      onSavePhone(phone.trim());
    }
    sendWhatsAppMessage(phone.trim(), message);
    onClose();
  };

  if (!employee) return null;

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Enviar Comprobante por WhatsApp"
      maxWidth={550}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Colaborador Info */}
        <View style={styles.employeeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeSub}>
              {employee.area || 'Personal'} {employee.idCard ? `• CI: ${employee.idCard}` : ''}
            </Text>
          </View>
          <View style={styles.salaryBadge}>
            <Text style={styles.salaryBadgeText}>{formatCurrency(employee.salary)} / mes</Text>
          </View>
        </View>

        {/* Tipo de movimiento */}
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Tipo de Movimiento</Text>
          <View style={styles.typeRow}>
            {MOVEMENT_TYPES.map((t) => {
              const isSelected = movementType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeBtn, isSelected && styles.typeBtnActive]}
                  onPress={() => {
                    setMovementType(t.id);
                    setNote(t.placeholderNote);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monto y Teléfono en dos columnas */}
        <View style={styles.twoCols}>
          <View style={[styles.fieldBox, { flex: 1 }]}>
            <Text style={styles.label}>Monto ($)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.fieldBox, { flex: 1.3 }]}>
            <Text style={styles.label}>Teléfono WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ej. 04121234567"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Forma de Pago / Referencia</Text>
          <View style={styles.chipsRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod.startsWith(pm);
              return (
                <TouchableOpacity
                  key={pm}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => {
                    if (pm === 'Binance' && employee.binance) {
                      setPaymentMethod(`Binance (${employee.binance})`);
                    } else {
                      setPaymentMethod(pm);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{pm}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 4 }]}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="Especificar método o ref..."
            placeholderTextColor={THEME.colors.textDim}
          />
        </View>

        {/* Concepto / Nota */}
        <View style={styles.fieldBox}>
          <Text style={styles.label}>Concepto / Detalle (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Ej. Adelanto solicitado para..."
            placeholderTextColor={THEME.colors.textDim}
          />
        </View>

        {/* Tip capture */}
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={16} color={THEME.colors.accent} />
          <Text style={styles.tipText}>
            Al pulsar enviar se abrirá el chat de WhatsApp con el comprobante listo para que puedas adjuntar la captura (cap del pago).
          </Text>
        </View>

        {/* Vista previa */}
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista Previa del Mensaje:</Text>
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={true}>
            <Text style={styles.previewText}>{message}</Text>
          </ScrollView>
        </View>

        {/* Botones */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
            <WhatsAppIcon size={16} color="#ffffff" />
            <Text style={styles.sendBtnText}>Abrir WhatsApp y Enviar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10, paddingBottom: 6 },
  employeeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  employeeName: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  employeeSub: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  salaryBadge: { backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)' },
  salaryBadgeText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '800' },
  fieldBox: { gap: 4 },
  label: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  typeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeBtn: { flex: 1, minWidth: 100, paddingVertical: 7, paddingHorizontal: 8, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderColor: THEME.colors.primary },
  typeBtnText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  typeBtnTextActive: { color: THEME.colors.primaryLight, fontWeight: '800' },
  twoCols: { flexDirection: 'row', gap: 8 },
  input: { backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.sm, paddingHorizontal: 10, paddingVertical: 7, color: THEME.colors.textMain, fontSize: 12 },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border },
  chipActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: THEME.colors.success },
  chipText: { color: THEME.colors.textDim, fontSize: 10, fontWeight: '700' },
  chipTextActive: { color: THEME.colors.success, fontWeight: '800' },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  tipText: { color: THEME.colors.accent, fontSize: 10.5, flex: 1, lineHeight: 14 },
  previewBox: { backgroundColor: 'rgba(37, 99, 235, 0.05)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.md, padding: 8, gap: 4 },
  previewLabel: { color: THEME.colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  previewScroll: { maxHeight: 120 },
  previewText: { color: THEME.colors.textMain, fontSize: 10.5, lineHeight: 15, fontFamily: 'monospace' },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgSurface },
  cancelBtnText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#25D366', paddingHorizontal: 16, paddingVertical: 8, borderRadius: THEME.radius.sm },
  sendBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
});
