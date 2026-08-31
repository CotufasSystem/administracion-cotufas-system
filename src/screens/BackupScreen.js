import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton, CustomInput } from '../components/common/UIComponents';
import { useApp } from '../context/AppContext';

export const BackupScreen = () => {
  const { exportDatabaseJson, importDatabaseJson, masterPin, updatePin } = useApp();
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
      if (Platform.OS === 'web') {
        window.alert('¡Copia de seguridad restaurada correctamente!');
      } else {
        Alert.alert('Éxito', '¡Copia de seguridad restaurada correctamente!');
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: Formato JSON inválido.');
      } else {
        Alert.alert('Error', 'El formato JSON introducido no es válido.');
      }
    }
  };

  const handleChangePin = () => {
    if (newPin.trim().length !== 4) {
      if (Platform.OS === 'web') {
        window.alert('El PIN debe contener exactamente 4 dígitos numéricos.');
      } else {
        Alert.alert('PIN Inválido', 'El PIN debe contener 4 dígitos.');
      }
      return;
    }
    updatePin(newPin.trim());
    setNewPin('');
    if (Platform.OS === 'web') {
      window.alert('¡PIN Maestro actualizado con éxito!');
    } else {
      Alert.alert('Éxito', '¡PIN Maestro actualizado con éxito!');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Change PIN Card */}
      <Card title="Seguridad del Propietario (PIN Maestro)" icon="lock-closed-outline">
        <Text style={styles.descText}>
          El PIN actual es: <Text style={styles.bold}>{masterPin}</Text>. Puedes cambiarlo a continuación:
        </Text>
        <CustomInput
          label="Nuevo PIN (4 Dígitos)"
          placeholder="Ej: 5678"
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

      {/* Export Card */}
      <Card title="Exportar Respaldo de Base de Datos" icon="cloud-download-outline">
        <Text style={styles.descText}>
          Genera una copia en formato JSON con todos los empleados, proyectos, finanzas, reglas y asistencia.
        </Text>
        <PrimaryButton
          title={copyStatus ? "¡JSON Copiado al Portapapeles!" : "Copiar Respaldo JSON Completo"}
          icon="copy-outline"
          variant="success"
          onPress={handleExport}
        />
      </Card>

      {/* Import Card */}
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
  container: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  descText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  bold: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
});
