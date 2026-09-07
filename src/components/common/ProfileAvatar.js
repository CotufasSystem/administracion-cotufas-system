import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { COTUFAS_LOGO } from '../../constants/assets';

export const ProfileAvatar = ({ size = 42, showBadge = true, onPressCustom = null }) => {
  const { profileImage, updateProfileImage, resetProfileImage } = useApp();

  const handlePickFile = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) updateProfileImage(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert('Logotipo de la Empresa', 'Selecciona una opción', [
        { text: 'Restablecer Logotipo Oficial', onPress: resetProfileImage },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const handleMainPress = () => {
    if (onPressCustom) onPressCustom();
    else handlePickFile();
  };

  const handleLongPress = () => {
    if (profileImage) {
      if (Platform.OS === 'web') {
        if (window.confirm('¿Deseas restablecer el logotipo al diseño oficial de Cotufas System?')) {
          resetProfileImage();
        }
      } else {
        Alert.alert('Restablecer', '¿Restablecer al logotipo oficial de Cotufas System?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Restablecer', onPress: resetProfileImage },
        ]);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={handleMainPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      title={onPressCustom ? "Haz clic para abrir/cerrar barra lateral" : "Haz clic para cambiar foto"}
    >
      <Image
        source={profileImage ? { uri: profileImage } : COTUFAS_LOGO}
        style={[styles.image, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
        resizeMode="contain"
      />

      {showBadge && (
        <TouchableOpacity
          style={styles.editBadge}
          onPress={handlePickFile}
          activeOpacity={0.7}
          title="Cambiar foto"
        >
          <Ionicons name="camera" size={10} color="#ffffff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  image: { backgroundColor: '#ffffff' },
  defaultBox: { backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  defaultEmoji: { textAlign: 'center' },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: THEME.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
});
