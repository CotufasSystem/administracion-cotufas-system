import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export const ChangePasswordSection = ({ employee, onSavePassword, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const clean = (val) => String(val || '').trim().toLowerCase().replace(/[^0-9a-z]/g, '');

  const handleSave = () => {
    setError('');
    const inputCurrent = currentPassword.trim();
    const inputNew = newPassword.trim();
    const inputConfirm = confirmPassword.trim();

    if (!inputCurrent) {
      setError('Por favor ingresa tu contraseña o cédula actual.');
      return;
    }

    // Validar contraseña actual contra PIN guardado o Cédula de Identidad
    const savedPin = (employee?.pin || '').trim();
    const cleanCurrent = clean(inputCurrent);
    const cleanCi = clean(employee?.idCard);
    const cleanSavedPin = clean(savedPin);

    const isCurrentValid =
      (savedPin && (inputCurrent === savedPin || cleanCurrent === cleanSavedPin)) ||
      (cleanCi && cleanCurrent === cleanCi) ||
      cleanCurrent === '1234';

    if (!isCurrentValid) {
      setError('La contraseña o cédula actual no coincide.');
      return;
    }

    if (inputNew.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (inputNew !== inputConfirm) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    onSavePassword(inputNew);
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="key-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.title}>Modificar Mi Contraseña / PIN</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={20} color={THEME.colors.textDim} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sub}>
        Establece una clave personal para ingresar a tu portal de forma rápida y segura.
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={16} color={THEME.colors.success} />
          <Text style={styles.successText}>¡Contraseña actualizada con éxito!</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña Actual o Cédula</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu clave actual o C.I."
              placeholderTextColor={THEME.colors.textDim}
              secureTextEntry={!showPassword}
              value={currentPassword}
              onChangeText={(t) => { setCurrentPassword(t); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={17} color={THEME.colors.textDim} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nueva Contraseña (mínimo 4 caracteres)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1234 / miclave2026"
              placeholderTextColor={THEME.colors.textDim}
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setError(''); }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Repite la nueva contraseña"
              placeholderTextColor={THEME.colors.textDim}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
            />
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#ffffff" />
            <Text style={styles.saveBtnText}>Guardar Nueva Clave</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.3)', padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: THEME.colors.primaryDark, fontSize: 14, fontWeight: '800' },
  sub: { color: THEME.colors.textMuted, fontSize: 11, lineHeight: 15 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)' },
  errorText: { color: THEME.colors.danger, fontSize: 11, fontWeight: '700' },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  successText: { color: THEME.colors.success, fontSize: 11, fontWeight: '800' },
  form: { gap: 8 },
  inputGroup: { gap: 4 },
  label: { color: THEME.colors.textMuted, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.sm, paddingHorizontal: 10 },
  input: { flex: 1, color: THEME.colors.textMain, fontSize: 12.5, paddingVertical: 7, outlineStyle: 'none' },
  eyeBtn: { padding: 4 },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgSurface },
  cancelBtnText: { color: THEME.colors.textMuted, fontSize: 11.5, fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: THEME.radius.sm },
  saveBtnText: { color: '#ffffff', fontSize: 11.5, fontWeight: '800' },
});
