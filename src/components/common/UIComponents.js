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
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    padding: 16,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md, flexWrap: 'wrap', gap: 8 },
  cardTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '800' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: THEME.radius.md, gap: 8 },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: THEME.radius.sm, gap: 6 },
  btnText: { fontSize: 14, fontWeight: '700' },
  btnTextSmall: { fontSize: 12, fontWeight: '600' },
  inputGroup: { marginBottom: THEME.spacing.sm },
  inputLabel: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: THEME.radius.md, paddingHorizontal: 12, paddingVertical: 10, color: THEME.colors.textMain, fontSize: 14 },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: THEME.spacing.md },
  modalContent: { backgroundColor: '#ffffff', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: '#e2e8f0', width: '100%', maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '700' },
  closeBtn: { padding: 4 },
  modalBodyScroll: { maxHeight: '100%' },
  modalBody: { padding: THEME.spacing.md },
});
