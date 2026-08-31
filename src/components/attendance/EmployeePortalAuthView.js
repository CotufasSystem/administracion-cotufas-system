import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export const EmployeePortalAuthView = ({
  activeEmployees,
  selectedEmpId,
  onSelectEmp,
  onBiometricAuth,
  isScanning,
  pinInput,
  onChangePin,
  onPinAuth,
  authError,
}) => {
  return (
    <View style={styles.authBox}>
      <View style={styles.lockBadge}>
        <Ionicons name="finger-print" size={36} color={THEME.colors.primary} />
      </View>
      <Text style={styles.authTitle}>Acceso Biométrico / Privado</Text>
      <Text style={styles.authSub}>Tus datos de sueldo, pagos y asistencias son confidenciales y solo tú puedes verlos.</Text>

      <View style={styles.pickerSection}>
        <Text style={styles.sectionLabel}>1. Selecciona Tu Nombre:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
          {activeEmployees.map((emp) => {
            const isSel = emp.id === selectedEmpId;
            return (
              <TouchableOpacity
                key={emp.id}
                style={[styles.empChip, isSel && styles.empChipActive]}
                onPress={() => onSelectEmp(emp.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={13} color={isSel ? "#ffffff" : THEME.colors.primary} />
                <Text style={[styles.empChipText, isSel && styles.empChipTextActive]}>{emp.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedEmpId ? (
        <View style={styles.bioActionBox}>
          <TouchableOpacity
            style={[styles.bioScanBtn, isScanning && styles.bioScanBtnScanning]}
            onPress={onBiometricAuth}
            activeOpacity={0.85}
            disabled={isScanning}
          >
            <Ionicons name={isScanning ? "scan" : "finger-print"} size={28} color="#ffffff" />
            <View style={{ alignItems: 'flex-start' }}>
              <Text style={styles.bioScanBtnTitle}>
                {isScanning ? "Leyendo Huella / Face ID..." : "Ingresar con Huella o Face ID"}
              </Text>
              <Text style={styles.bioScanBtnSub}>Toca para autenticar con tu sensor móvil</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o con tu Cédula / PIN</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.pinInputRow}>
            <TextInput
              style={styles.pinInputField}
              placeholder="Número de Cédula o PIN"
              value={pinInput}
              onChangeText={onChangePin}
              placeholderTextColor={THEME.colors.textDim}
              secureTextEntry
            />
            <TouchableOpacity style={styles.pinSubmitBtn} onPress={onPinAuth} activeOpacity={0.8}>
              <Text style={styles.pinSubmitBtnText}>Acceder</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  authBox: { alignItems: 'center', backgroundColor: '#ffffff', padding: 18, borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', gap: 12 },
  lockBadge: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center' },
  authTitle: { color: THEME.colors.textMain, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  authSub: { color: THEME.colors.textMuted, fontSize: 12, textAlign: 'center', paddingHorizontal: 16 },
  pickerSection: { width: '100%', gap: 6, marginTop: 4 },
  sectionLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  pickerScroll: { gap: 8, paddingVertical: 4 },
  empChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  empChipActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  empChipText: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  empChipTextActive: { color: '#ffffff', fontWeight: '900' },
  bioActionBox: { width: '100%', gap: 10, marginTop: 8 },
  bioScanBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: THEME.colors.primary, padding: 14, borderRadius: THEME.radius.md, justifyContent: 'center' },
  bioScanBtnScanning: { backgroundColor: THEME.colors.warning },
  bioScanBtnTitle: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  bioScanBtnSub: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { color: THEME.colors.textDim, fontSize: 10, fontWeight: '700' },
  pinInputRow: { flexDirection: 'row', gap: 8 },
  pinInputField: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: THEME.radius.md, paddingHorizontal: 12, paddingVertical: 10, color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  pinSubmitBtn: { backgroundColor: THEME.colors.accent, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', borderRadius: THEME.radius.md },
  pinSubmitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  errorText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
