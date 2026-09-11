import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { COTUFAS_LOGO } from '../../constants/assets';

export const EmployeePortalAuthView = ({
  activeEmployees = [],
  onSelectEmp,
  supportsBiometrics,
  onBiometricAuth,
  isScanning,
  pinInput,
  onChangePin,
  onPinAuth,
  authError,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleLogin = () => {
    setLocalError('');
    const q = identifier.trim().toLowerCase();
    const pin = pinInput.trim();

    if (!q) {
      setLocalError('Por favor ingresa tu usuario, correo o cédula.');
      return;
    }
    if (!pin) {
      setLocalError('Por favor ingresa tu contraseña o cédula.');
      return;
    }

    const cleanQ = q.replace(/[^0-9a-z]/g, '');

    // Find the matching employee
    const matched = activeEmployees.find((emp) => {
      const u = (emp.portalUsername || '').trim().toLowerCase();
      const n = (emp.name || '').trim().toLowerCase();
      const ci = (emp.idCard || '').trim().toLowerCase().replace(/[^0-9a-z]/g, '');
      const b = (emp.binance || '').trim().toLowerCase();
      return u === q || n === q || b === q || (ci && cleanQ && ci.includes(cleanQ)) || u.includes(q) || n.includes(q);
    });

    if (!matched) {
      setLocalError('No se encontró ningún colaborador con ese usuario o cédula.');
      return;
    }

    // Set selected employee and execute auth
    onSelectEmp(matched.id);
    onPinAuth(matched);
  };

  const displayError = localError || authError;

  return (
    <View style={styles.container}>
      {/* Central App Brand Icon: Cotufas System Logo */}
      <View style={styles.iconCircle}>
        <Image
          source={COTUFAS_LOGO}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Main Titles */}
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subTitle}>
        Acceso privado al Portal de Asistencia Cotufas
      </Text>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* Email / User / CI */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Usuario, Cédula o Correo"
            placeholderTextColor="#94a3b8"
            value={identifier}
            onChangeText={(t) => {
              setIdentifier(t);
              setLocalError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password / PIN */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña o Cédula"
            placeholderTextColor="#94a3b8"
            value={pinInput}
            onChangeText={(t) => {
              onChangePin(t);
              setLocalError('');
            }}
            secureTextEntry={!showPassword}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={showPassword ? '#2563eb' : '#94a3b8'}
            />
          </TouchableOpacity>
        </View>

        {/* Options Row: Remember me */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={13} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>Recordarme</Text>
          </TouchableOpacity>
        </View>

        {/* Error Feedback */}
        {displayError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        {/* Action Button (Remote style) */}
        <TouchableOpacity
          style={[styles.loginBtn, (!identifier.trim() || !pinInput.trim()) && styles.loginBtnDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={!identifier.trim() || !pinInput.trim()}
        >
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Biometric Option */}
        {supportsBiometrics && (
          <TouchableOpacity
            style={styles.bioBtn}
            onPress={onBiometricAuth}
            activeOpacity={0.8}
            disabled={isScanning}
          >
            <Ionicons name={isScanning ? 'scan' : 'finger-print'} size={18} color="#2563eb" />
            <Text style={styles.bioBtnText}>
              {isScanning ? 'Verificando biométrico...' : 'Ingresar con Huella / Face ID'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    overflow: 'hidden',
    padding: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    paddingVertical: 10,
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  helpLink: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#2563eb', // Azul vibrante similar al botón "Log in" de Remote
    borderRadius: 24, // Bordes redondeados elegantes como en la imagen
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 2,
  },
  bioBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.danger,
    flex: 1,
  },
});


