import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export const Card = ({ children, style, title, icon, rightAction }) => (
  <View style={[styles.card, style]}>
    {(title || rightAction) && (
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBox}>
          {icon && <Ionicons name={icon} size={18} color={THEME.colors.primary} />}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {rightAction}
      </View>
    )}
    {children}
  </View>
);

export const PrimaryButton = ({ title, icon, onPress, variant = 'primary', style, textStyle, small = false }) => {
  const getBg = () => {
    switch (variant) {
      case 'danger': return THEME.colors.danger;
      case 'success': return THEME.colors.success;
      case 'warning': return THEME.colors.warning;
      case 'binance': return THEME.colors.binanceYellow;
      case 'secondary': return THEME.colors.bgSurface;
      default: return THEME.colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'binance') return '#000000';
    if (variant === 'secondary') return THEME.colors.textMain;
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: getBg() },
        small && styles.btnSmall,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={small ? 14 : 18} color={getTextColor()} />}
      <Text style={[styles.btnText, { color: getTextColor() }, small && styles.btnTextSmall, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const CustomInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, style }) => (
  <View style={[styles.inputGroup, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={THEME.colors.textDim}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

export const ModalWrapper = ({ visible, onClose, title, children, maxWidth = 520, minHeight = null, height = null }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { maxWidth }, minHeight ? { minHeight } : null, height ? { height } : null]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={[styles.modalBodyScroll, height ? { flex: 1 } : null]}
          contentContainerStyle={[styles.modalBody, minHeight ? { minHeight: minHeight - 65 } : null]}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 18,
    marginBottom: THEME.spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md, flexWrap: 'wrap', gap: 8 },
  cardTitleBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, color: THEME.colors.textMain, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    gap: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 8, gap: 5 },
  btnText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  btnTextSmall: { fontSize: 12, fontWeight: '700' },
  inputGroup: { marginBottom: THEME.spacing.sm },
  inputLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 5, letterSpacing: 0.2, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: THEME.colors.textMain,
    fontSize: 13.5,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  inputMultiline: { height: 85, textAlignVertical: 'top' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBodyScroll: { maxHeight: '100%' },
  modalBody: { padding: 18 },
});
