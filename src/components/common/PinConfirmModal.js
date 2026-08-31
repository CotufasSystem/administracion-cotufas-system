import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export const PinConfirmModal = ({ visible, onClose, onConfirm, title = 'Acción Protegida', description = 'Ingresa el PIN de seguridad (6 dígitos) para confirmar esta acción.' }) => {
  const { masterPin } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  const handleValidate = () => {
    if (pinInput === masterPin) {
      setPinInput('');
      setError(false);
      onConfirm();
      onClose();
    } else {
      setError(true);
      setPinInput('');
    }
  };

  const handleClose = () => {
    setPinInput('');
    setError(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark" size={22} color={THEME.colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.desc}>{description}</Text>
            </View>
          </View>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={pinInput}
            onChangeText={(v) => { setError(false); setPinInput(v); }}
            placeholder="PIN de 6 dígitos"
            placeholderTextColor={THEME.colors.textDim}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />

          {error && <Text style={styles.errorText}>PIN incorrecto. Intenta de nuevo.</Text>}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleValidate} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Autorizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: THEME.colors.bgCard, borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: THEME.colors.border, padding: 18, gap: 14 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(239, 68, 68, 0.15)', justifyContent: 'center', alignItems: 'center' },
  title: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  desc: { color: THEME.colors.textMuted, fontSize: 12, marginTop: 2 },
  input: { backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, color: THEME.colors.textMain, fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: 8, paddingVertical: 10, borderRadius: THEME.radius.md },
  inputError: { borderColor: THEME.colors.danger },
  errorText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.bgSurface },
  cancelText: { color: THEME.colors.textMuted, fontSize: 13, fontWeight: '700' },
  confirmBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.danger },
  confirmText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
});
