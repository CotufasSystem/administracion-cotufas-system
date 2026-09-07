import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { WhatsAppIcon } from '../common/AppIcons';
import { formatCurrency } from '../../utils/formatters';
import { buildRestaurantBillingMessage, sendWhatsAppMessage } from '../../utils/whatsappHelper';

export const RestaurantWhatsAppModal = ({ visible, restaurant, onClose, onSavePhone }) => {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (restaurant) {
      setPhone(restaurant.phone || '');
    } else {
      setPhone('');
    }
  }, [visible, restaurant]);

  const message = useMemo(() => {
    if (!restaurant) return '';
    return buildRestaurantBillingMessage(restaurant);
  }, [restaurant]);

  const handleSend = () => {
    if (restaurant && phone.trim() && onSavePhone) {
      onSavePhone(restaurant.id, phone.trim());
    }
    sendWhatsAppMessage(phone.trim(), message);
    onClose();
  };

  if (!restaurant) return null;

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Recordatorio de Cobro WhatsApp"
      maxWidth={520}
    >
      <View style={styles.container}>
        {/* Info header */}
        <View style={styles.restaurantHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            {restaurant.location ? <Text style={styles.restaurantLocation}>📍 {restaurant.location}</Text> : null}
          </View>
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>{formatCurrency(restaurant.monthlyAmount)} / mes</Text>
          </View>
        </View>

        {/* Phone input */}
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Número de WhatsApp del Local</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej. 0412-1234567 / +584121234567"
            placeholderTextColor={THEME.colors.textDim}
            keyboardType="phone-pad"
          />
          <Text style={styles.phoneHint}>Se guardará automáticamente en la ficha del restaurante.</Text>
        </View>

        {/* Message preview */}
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista Previa del Mensaje Personalizado:</Text>
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={true}>
            <Text style={styles.previewText}>{message}</Text>
          </ScrollView>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
            <WhatsAppIcon size={16} color="#ffffff" />
            <Text style={styles.sendBtnText}>Abrir WhatsApp y Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  restaurantHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  restaurantName: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  restaurantLocation: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  amountBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm },
  amountText: { color: THEME.colors.success, fontSize: 12, fontWeight: '800' },
  inputBox: { gap: 4 },
  inputLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  phoneInput: { backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.sm, paddingHorizontal: 12, paddingVertical: 8, color: THEME.colors.textMain, fontSize: 13 },
  phoneHint: { color: THEME.colors.textDim, fontSize: 10, fontStyle: 'italic' },
  previewBox: { backgroundColor: 'rgba(37, 99, 235, 0.05)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.md, padding: 10, gap: 6 },
  previewLabel: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  previewScroll: { maxHeight: 180 },
  previewText: { color: THEME.colors.textMain, fontSize: 11, lineHeight: 17, fontFamily: 'monospace' },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgSurface },
  cancelBtnText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#25D366', paddingHorizontal: 16, paddingVertical: 8, borderRadius: THEME.radius.sm },
  sendBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
});
