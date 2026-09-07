import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { ProfileAvatar } from '../components/common/ProfileAvatar';
import { EmployeePortalModal } from '../components/attendance/EmployeePortalModal';
import { useApp } from '../context/AppContext';

export const AuthScreen = () => {
  const { login } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const handleKeyPress = useCallback((digit) => {
    setError(false);
    setPin((prev) => (prev.length < 6 ? prev + digit : prev));
  }, []);

  const handleDelete = useCallback(() => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Trigger login verification once 6 digits are entered
  useEffect(() => {
    if (pin.length === 6) {
      const timer = setTimeout(() => {
        const success = login(pin);
        if (!success) {
          setError(true);
          setPin('');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pin, login]);

  // Listen to physical keyboard on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleKeyDown = (e) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandBox}>
          <ProfileAvatar size={64} showBadge={false} />
          <Text style={styles.title}>Cotufas System</Text>
          <Text style={styles.subtitle}>Acceso Administrador (PIN de 6 dígitos)</Text>
        </View>

        {/* 6-Digit PIN Indicators */}
        <View style={styles.pinDotsContainer}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isFilled && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>PIN incorrecto. Intente nuevamente.</Text>}

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', 'delete'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((btn, cIdx) => {
                if (btn === '') return <View key={cIdx} style={styles.keyEmpty} />;
                if (btn === 'delete') {
                  return (
                    <TouchableOpacity key={cIdx} style={styles.keyBtn} onPress={handleDelete} activeOpacity={0.7}>
                      <Ionicons name="backspace-outline" size={24} color={THEME.colors.textMuted} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity key={cIdx} style={styles.keyBtn} onPress={() => handleKeyPress(btn)} activeOpacity={0.7}>
                    <Text style={styles.keyText}>{btn}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.portalAccessBtn} onPress={() => setIsPortalOpen(true)} activeOpacity={0.8}>
          <Ionicons name="finger-print-outline" size={17} color={THEME.colors.primary} />
          <Text style={styles.portalAccessBtnText}>Soy Colaborador • Notificar Asistencia & Estatus</Text>
        </TouchableOpacity>
      </View>

      <EmployeePortalModal
        visible={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: THEME.spacing.lg },
  content: { width: '100%', maxWidth: 360, alignItems: 'center' },
  brandBox: { alignItems: 'center', marginBottom: THEME.spacing.lg },
  title: { color: THEME.colors.textMain, fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  subtitle: { color: THEME.colors.textMuted, fontSize: 13, marginTop: 4 },
  pinDotsContainer: { flexDirection: 'row', gap: 12, marginBottom: THEME.spacing.md },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#cbd5e1' },
  dotFilled: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  dotError: { borderColor: THEME.colors.danger, backgroundColor: 'rgba(239, 68, 68, 0.3)' },
  errorText: { color: THEME.colors.danger, fontSize: 13, fontWeight: '600', marginBottom: THEME.spacing.md },
  keypad: { width: '100%', gap: 10 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  keyBtn: { flex: 1, height: 54, backgroundColor: '#ffffff', borderRadius: THEME.radius.md, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  keyEmpty: { flex: 1, height: 54 },
  keyText: { color: THEME.colors.textMain, fontSize: 22, fontWeight: '700' },
  portalAccessBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: THEME.radius.md, marginTop: 20 },
  portalAccessBtnText: { color: THEME.colors.primaryDark, fontSize: 12, fontWeight: '800' },
});
