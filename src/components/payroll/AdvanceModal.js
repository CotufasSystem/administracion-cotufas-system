import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';
import { formatCurrency, formatDate, getLocalDateString } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const AdvanceModal = ({ visible, employee, onClose, onSave }) => {
  const { deleteAdvanceEntry, setAdvance } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => getLocalDateString(new Date()));

  useEffect(() => {
    setAmount('');
    setNote('');
    setDate(getLocalDateString(new Date()));
  }, [visible, employee]);

  if (!employee) return null;

  const handleSubmit = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return;
    onSave(employee.id, num, note, date);
    onClose();
  };

  const handleResetToZero = () => {
    setAdvance(employee.id, 0);
    onClose();
  };

  const history = Array.isArray(employee.advancesHistory) && employee.advancesHistory.length > 0
    ? employee.advancesHistory
    : (Number(employee.advances) > 0 ? [{ id: 'init', amount: Number(employee.advances), date: getLocalDateString(new Date()), note: 'Saldo activo' }] : []);

  return (
    <ModalWrapper visible={visible} onClose={onClose} title={`Adelantos: ${employee.name}`} maxWidth={540}>
      <View style={styles.content}>
        {/* Total Header Card */}
        <View style={styles.currentInfo}>
          <View>
            <Text style={styles.infoLabel}>Total Adelanto Acumulado:</Text>
            <Text style={styles.infoSubtitle}>Se restará automáticamente de la próxima nómina</Text>
          </View>
          <Text style={styles.infoValue}>{formatCurrency(employee.advances || 0)}</Text>
        </View>

        {/* Form New Advance */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>+ Registrar Nuevo Adelanto (Se irá sumando)</Text>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Monto a Adelantar ($)"
                placeholder="Ej: 50"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Fecha (AAAA-MM-DD)"
                placeholder="AAAA-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          <CustomInput
            label="Motivo / Observación (Opcional)"
            placeholder="Ej: Para medicina, gastos familiares, etc."
            value={note}
            onChangeText={setNote}
          />

          <PrimaryButton
            title="+ Sumar este Adelanto"
            variant="warning"
            icon="add-circle"
            onPress={handleSubmit}
            small
          />
        </View>

        {/* Historical Breakdown */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Desglose de Adelantos Pedidos ({history.length}):</Text>
            {history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.itemDate}>📅 {formatDate(item.date)}</Text>
                  </View>
                  {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                </View>
                <TouchableOpacity
                  onPress={() => deleteAdvanceEntry(employee.id, item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={15} color={THEME.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={handleResetToZero} style={styles.clearAllBtn} activeOpacity={0.7}>
              <Ionicons name="trash" size={13} color={THEME.colors.danger} />
              <Text style={styles.clearAllText}>Borrar todo y poner en $0</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  content: { gap: 12 },
  currentInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  infoLabel: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  infoSubtitle: { color: THEME.colors.textDim, fontSize: 10, marginTop: 2 },
  infoValue: { color: THEME.colors.warning, fontSize: 18, fontWeight: '900' },
  formSection: { backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border, gap: 6 },
  formTitle: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  inputRow: { flexDirection: 'row', gap: 8 },
  historySection: { backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border, gap: 8 },
  historyTitle: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.bgSurface, padding: 10, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border, gap: 8 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemAmount: { color: THEME.colors.warning, fontSize: 14, fontWeight: '800' },
  itemDate: { color: THEME.colors.textDim, fontSize: 11 },
  itemNote: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  deleteBtn: { padding: 6 },
  clearAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6 },
  clearAllText: { color: THEME.colors.danger, fontSize: 11, fontWeight: '700' },
});
