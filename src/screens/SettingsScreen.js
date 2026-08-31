import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton, CustomInput } from '../components/common/UIComponents';
import { ProfileAvatar } from '../components/common/ProfileAvatar';
import { useApp } from '../context/AppContext';

export const SettingsScreen = () => {
  const {
    exportDatabaseJson,
    importDatabaseJson,
    masterPin,
    updatePin,
    themeMode,
    toggleThemeMode,
    resetProfileImage
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [newPin, setNewPin] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2500);
    } else {
      Alert.alert('Exportación Exitosa', 'Los datos JSON han sido generados.');
    }
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importDatabaseJson(importJsonText.trim());
    if (success) {
      setImportJsonText('');
      if (Platform.OS === 'web') window.alert('¡Copia de seguridad restaurada correctamente!');
      else Alert.alert('Éxito', '¡Copia de seguridad restaurada correctamente!');
    } else {
      if (Platform.OS === 'web') window.alert('Error: Formato JSON inválido.');
      else Alert.alert('Error', 'El formato JSON introducido no es válido.');
    }
  };

  const handleChangePin = () => {
    if (newPin.trim().length !== 6) {
      if (Platform.OS === 'web') window.alert('El PIN debe contener exactamente 6 dígitos numéricos.');
      else Alert.alert('PIN Inválido', 'El PIN debe contener 6 dígitos.');
      return;
    }
    updatePin(newPin.trim());
    setNewPin('');
    if (Platform.OS === 'web') window.alert('¡PIN Maestro actualizado con éxito a 6 dígitos!');
    else Alert.alert('Éxito', '¡PIN Maestro actualizado con éxito a 6 dígitos!');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* 1. Theme / Appearance Card */}
      <Card title="Apariencia & Tema Visual" icon="color-palette-outline">
        <Text style={styles.descText}>
          Selecciona el modo visual del sistema. Puedes alternar entre Tema Claro y Tema Oscuro:
        </Text>
        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[styles.themeOption, themeMode === 'light' && styles.themeOptionActive]}
            onPress={() => themeMode !== 'light' && toggleThemeMode()}
            activeOpacity={0.8}
          >
            <Ionicons name="sunny" size={20} color={themeMode === 'light' ? "#ffffff" : THEME.colors.primary} />
            <Text style={[styles.themeOptionText, themeMode === 'light' && styles.themeOptionTextActive]}>
              Modo Claro ☀️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeOption, themeMode === 'dark' && styles.themeOptionActive]}
            onPress={() => themeMode !== 'dark' && toggleThemeMode()}
            activeOpacity={0.8}
          >
            <Ionicons name="moon" size={20} color={themeMode === 'dark' ? "#ffffff" : THEME.colors.primary} />
            <Text style={[styles.themeOptionText, themeMode === 'dark' && styles.themeOptionTextActive]}>
              Modo Oscuro 🌙
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 2. Profile Photo / Logo Card */}
      <Card title="Logotipo & Foto de Perfil" icon="image-outline">
        <View style={styles.avatarRow}>
          <ProfileAvatar size={60} showBadge={true} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.avatarTitle}>Logo de la Empresa</Text>
            <Text style={styles.descText}>Toca el icono de la cámara para subir un nuevo logo o foto desde tus archivos.</Text>
            <TouchableOpacity style={styles.resetLogoBtn} onPress={resetProfileImage} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={13} color={THEME.colors.primary} />
              <Text style={styles.resetLogoText}>Restablecer logo original 🍿</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* 3. Change PIN Card */}
      <Card title="Seguridad (PIN Maestro de 6 Dígitos)" icon="lock-closed-outline">
        <Text style={styles.descText}>
          El PIN actual es: <Text style={styles.bold}>{masterPin}</Text>. Puedes modificarlo a continuación:
        </Text>
        <CustomInput
          label="Nuevo PIN (6 Dígitos)"
          placeholder="Ej: 123456"
          keyboardType="numeric"
          value={newPin}
          onChangeText={setNewPin}
        />
        <PrimaryButton
          title="Actualizar PIN Maestro"
          icon="key-outline"
          onPress={handleChangePin}
        />
      </Card>

      {/* 4. Export Card */}
      <Card title="Exportar Respaldo de Base de Datos" icon="cloud-download-outline">
        <Text style={styles.descText}>
          Genera una copia en formato JSON con todos los empleados, proyectos, finanzas, nómina, reglas y asistencias.
        </Text>
        <PrimaryButton
          title={copyStatus ? "¡JSON Copiado al Portapapeles!" : "Copiar Respaldo JSON Completo"}
          icon="copy-outline"
          variant="success"
          onPress={handleExport}
        />
      </Card>

      {/* 5. Import Card */}
      <Card title="Restaurar / Importar Respaldo JSON" icon="cloud-upload-outline">
        <Text style={styles.descText}>
          Pega el texto JSON de un respaldo previo para sobreescribir y sincronizar este dispositivo:
        </Text>
        <CustomInput
          placeholder='Pega aquí el contenido JSON {"employees": ...}'
          multiline
          value={importJsonText}
          onChangeText={setImportJsonText}
        />
        <PrimaryButton
          title="Restaurar Base de Datos"
          icon="refresh-outline"
          variant="warning"
          onPress={handleImport}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  descText: { color: THEME.colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  bold: { color: THEME.colors.primary, fontWeight: '800' },
  themeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', paddingVertical: 12, paddingHorizontal: 14, borderRadius: THEME.radius.md },
  themeOptionActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primaryDark },
  themeOptionText: { color: THEME.colors.primaryDark, fontSize: 13, fontWeight: '700' },
  themeOptionTextActive: { color: '#ffffff', fontWeight: '900' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: 12, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  avatarTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  resetLogoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', marginTop: 2 },
  resetLogoText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
});
