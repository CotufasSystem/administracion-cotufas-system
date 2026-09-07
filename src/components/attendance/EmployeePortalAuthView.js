import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ProfileAvatar } from '../common/ProfileAvatar';

export const EmployeePortalAuthView = ({
  activeEmployees = [],
  selectedEmpId,
  onSelectEmp,
  supportsBiometrics,
  onBiometricAuth,
  isScanning,
  pinInput,
  onChangePin,
  onPinAuth,
  authError,
}) => {
  const scrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return activeEmployees;
    const q = searchQuery.toLowerCase().trim();
    return activeEmployees.filter((emp) => (emp.name || '').toLowerCase().includes(q));
  }, [activeEmployees, searchQuery]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.authBox}>
      <View style={styles.lockBadge}>
        <ProfileAvatar size={62} showBadge={false} />
      </View>
      <Text style={styles.authTitle}>
        {supportsBiometrics ? "Acceso Biométrico / Privado" : "Acceso Seguro del Colaborador"}
      </Text>
      <Text style={styles.authSub}>
        {supportsBiometrics
          ? "Tus datos de sueldo, pagos y asistencias son confidenciales y solo tú puedes verlos."
          : "Ingresa tu número de Cédula de Identidad o PIN personal para consultar tus datos y notificar asistencia."}
      </Text>

      <View style={styles.pickerSection}>
        <View style={styles.pickerHeaderRow}>
          <Text style={styles.sectionLabel}>
            1. Selecciona Tu Nombre ({filteredEmployees.length}):
          </Text>
          {activeEmployees.length > 5 && (
            <View style={styles.scrollControls}>
              <TouchableOpacity style={styles.scrollArrowBtn} onPress={handleScrollLeft} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={16} color={THEME.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.scrollArrowBtn} onPress={handleScrollRight} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={16} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={15} color={THEME.colors.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor={THEME.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={15} color={THEME.colors.textDim} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Horizontal Names Scroll */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.pickerScroll}
          keyboardShouldPersistTaps="handled"
        >
          {filteredEmployees.map((emp) => {
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
          {filteredEmployees.length === 0 && (
            <Text style={styles.emptySearchText}>No se encontraron colaboradores con ese nombre.</Text>
          )}
        </ScrollView>
      </View>

      {selectedEmpId ? (
        <View style={styles.bioActionBox}>
          {supportsBiometrics && (
            <>
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
            </>
          )}

          {!supportsBiometrics && (
            <Text style={styles.sectionLabel}>2. Ingresa tu Cédula o PIN:</Text>
          )}

          <View style={styles.pinInputRow}>
            <View style={styles.pinInputWrapper}>
              <TextInput
                style={styles.pinInputField}
                placeholder="Número de Cédula o PIN"
                value={pinInput}
                onChangeText={onChangePin}
                placeholderTextColor={THEME.colors.textDim}
                secureTextEntry={!showPassword}
                autoFocus={!supportsBiometrics}
                onSubmitEditing={onPinAuth}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color={showPassword ? THEME.colors.primary : THEME.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.pinSubmitBtn} onPress={onPinAuth} activeOpacity={0.8}>
              <Ionicons name="log-in-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
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
  pickerSection: { width: '100%', gap: 8, marginTop: 4 },
  pickerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  scrollControls: { flexDirection: 'row', gap: 4 },
  scrollArrowBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: THEME.radius.md, paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  searchInput: { flex: 1, color: THEME.colors.textMain, fontSize: 12, fontWeight: '600', padding: 0 },
  pickerScroll: { gap: 8, paddingVertical: 6 },
  empChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 14, paddingVertical: 9, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  empChipActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  empChipText: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700' },
  empChipTextActive: { color: '#ffffff', fontWeight: '900' },
  emptySearchText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic', paddingVertical: 8 },
  bioActionBox: { width: '100%', gap: 10, marginTop: 8 },
  bioScanBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: THEME.colors.primary, padding: 14, borderRadius: THEME.radius.md, justifyContent: 'center' },
  bioScanBtnScanning: { backgroundColor: THEME.colors.warning },
  bioScanBtnTitle: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  bioScanBtnSub: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { color: THEME.colors.textDim, fontSize: 10, fontWeight: '700' },
  pinInputRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  pinInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: THEME.radius.md, paddingHorizontal: 12 },
  pinInputField: { flex: 1, paddingVertical: 10, color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  eyeBtn: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  pinSubmitBtn: { flexDirection: 'row', backgroundColor: THEME.colors.primary, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', borderRadius: THEME.radius.md },
  pinSubmitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  errorText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});


