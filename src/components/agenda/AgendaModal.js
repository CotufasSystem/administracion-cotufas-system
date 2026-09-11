import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';

export const AgendaModal = ({ visible, item, isNegotiation = false, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [email, setEmail] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setClient(item.client || '');
      setEmail(item.email || item.contactEmail || '');
      setDateTime(item.dateTime || '');
      setDealAmount(item.dealAmount ? String(item.dealAmount) : '');
      setStatus(item.status || 'ongoing');
      setNotes(item.notes || '');
    } else {
      setTitle('');
      setClient('');
      setEmail('');
      setDateTime(new Date().toISOString().slice(0, 16).replace('T', ' '));
      setDealAmount('');
      setStatus('ongoing');
      setNotes('');
    }
  }, [visible, item]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(item || {}),
      title: title.trim(),
      client: client.trim(),
      email: email.trim(),
      dateTime: dateTime.trim(),
      dealAmount: isNegotiation ? Number(dealAmount) || 0 : 0,
      status: isNegotiation ? status : 'pending',
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={isNegotiation ? (item ? 'Editar Negociación' : 'Nueva Negociación') : (item ? 'Editar Cita / Recordatorio' : 'Nueva Cita / Recordatorio')}
    >
      <View style={styles.content}>
        <CustomInput
          label="Título / Asunto de la Cita"
          placeholder={isNegotiation ? 'Ej: Propuesta Cotufas System' : 'Ej: Reunión con cliente'}
          value={title}
          onChangeText={setTitle}
        />

        <CustomInput
          label="Cliente / Contacto"
          placeholder="Ej: Ing. Carlos Pérez / Empresa Petrolera"
          value={client}
          onChangeText={setClient}
        />

        <CustomInput
          label="Correo Electrónico (Para envío automático de recordatorio)"
          placeholder="cliente@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <CustomInput
          label="Fecha y Hora (AAAA-MM-DD HH:MM)"
          placeholder="Ej: 2026-08-30 15:30"
          value={dateTime}
          onChangeText={setDateTime}
        />

        {isNegotiation && (
          <>
            <CustomInput
              label="Monto Negociado ($)"
              placeholder="Ej: 5000"
              keyboardType="numeric"
              value={dealAmount}
              onChangeText={setDealAmount}
            />

            <View style={styles.statusGroup}>
              <Text style={styles.statusLabel}>Estado de la Negociación</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusBtn, status === 'ongoing' && styles.statusBtnOngoing]}
                  onPress={() => setStatus('ongoing')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={status === 'ongoing' ? 'time' : 'time-outline'}
                    size={14}
                    color={status === 'ongoing' ? '#ffffff' : THEME.colors.textDim}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.statusBtnText, status === 'ongoing' && styles.statusBtnTextActive]}>En Curso</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, status === 'won' && styles.statusBtnWon]}
                  onPress={() => setStatus('won')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={status === 'won' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={14}
                    color={status === 'won' ? '#ffffff' : THEME.colors.textDim}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.statusBtnText, status === 'won' && styles.statusBtnTextActive]}>Ganada</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, status === 'lost' && styles.statusBtnLost]}
                  onPress={() => setStatus('lost')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={status === 'lost' ? 'close-circle' : 'close-circle-outline'}
                    size={14}
                    color={status === 'lost' ? '#ffffff' : THEME.colors.textDim}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.statusBtnText, status === 'lost' && styles.statusBtnTextActive]}>Perdida</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <CustomInput
          label="Notas y Acuerdos"
          placeholder="Ej: Llevar propuesta económica y cronograma"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.btnRow}>
          <PrimaryButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton title="Guardar" icon="save-outline" onPress={handleSave} style={{ flex: 1 }} />
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  content: { gap: THEME.spacing.sm },
  statusGroup: { marginBottom: THEME.spacing.sm },
  statusLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  statusButtons: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: THEME.radius.md,
  },
  statusBtnOngoing: {
    borderColor: '#d97706',
    backgroundColor: '#f59e0b',
  },
  statusBtnWon: {
    borderColor: '#059669',
    backgroundColor: '#10b981',
  },
  statusBtnLost: {
    borderColor: '#dc2626',
    backgroundColor: '#ef4444',
  },
  statusBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBtnTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  btnRow: { flexDirection: 'row', gap: THEME.spacing.md, marginTop: THEME.spacing.sm },
});
