import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatCurrency, formatDate, getLocalDateString } from '../../utils/formatters';
import { submitAdvanceRequest } from '../../services/portalService';

export const PortalAdvancesSection = ({ employee, advanceRequests = [], onDeleteRequest, onRefresh }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [requiredByDate, setRequiredByDate] = useState(getLocalDateString(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const baseSalary = Number(employee?.salary) || 0;
  const maxAllowedPercent = 50; // 50% del sueldo base configurable
  const maxLimit = (baseSalary * maxAllowedPercent) / 100;

  // Filtrar solicitudes del empleado autenticado
  const myRequests = useMemo(() => {
    return (advanceRequests || [])
      .filter((r) => r.employeeId === employee?.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [advanceRequests, employee?.id]);

  const hasPending = myRequests.some((r) => r.status === 'pending');

  const handleDelete = (req) => {
    const confirmText = `¿Deseas eliminar del historial esta solicitud de adelanto de $${req.amount}?`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmText)) {
        onDeleteRequest?.(req.id);
      }
    } else {
      Alert.alert('Eliminar Solicitud', confirmText, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteRequest?.(req.id) },
      ]);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a $0');
      return;
    }

    if (baseSalary > 0 && Number(amount) > maxLimit) {
      setErrorMsg(`El monto máximo que puedes solicitar es de ${formatCurrency(maxLimit)} (${maxAllowedPercent}% de tu sueldo base).`);
      return;
    }

    if (hasPending) {
      setErrorMsg('Ya tienes una solicitud pendiente de aprobación.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitAdvanceRequest({
        employee,
        amount,
        reason,
        requiredByDate,
        maxAllowedPercent,
        existingRequests: advanceRequests,
      });

      setAmount('');
      setReason('');
      setShowForm(false);
      setSuccessMsg('¡Solicitud de adelanto enviada con éxito para revisión!');
      if (Platform.OS === 'web') {
        window.alert('¡Solicitud de adelanto enviada correctamente!');
      } else {
        Alert.alert('Éxito', 'Solicitud de adelanto enviada con éxito.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'En Revisión', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#d97706', icon: 'time-outline' };
      case 'approved':
        return { label: 'Aprobado', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.3)', color: THEME.colors.success, icon: 'checkmark-circle-outline' };
      case 'rejected':
        return { label: 'Rechazado', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', color: THEME.colors.danger, icon: 'close-circle-outline' };
      case 'settled':
        return { label: 'Liquidado en Nómina', bg: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.3)', color: THEME.colors.primary, icon: 'receipt-outline' };
      default:
        return { label: status, bg: '#f1f5f9', border: '#cbd5e1', color: '#64748b', icon: 'help-circle-outline' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Credit Capacity Header Card */}
      <View style={styles.capacityCard}>
        <View style={styles.capacityHeader}>
          <View>
            <Text style={styles.capacitySub}>Capacidad de Adelanto ({maxAllowedPercent}%)</Text>
            <Text style={styles.capacityAmount}>{formatCurrency(maxLimit)}</Text>
          </View>
          <View style={styles.baseSalaryBadge}>
            <Text style={styles.baseSalaryText}>Sueldo: {formatCurrency(baseSalary)}</Text>
          </View>
        </View>

        {hasPending ? (
          <View style={styles.pendingNotice}>
            <Ionicons name="information-circle" size={16} color="#d97706" />
            <Text style={styles.pendingNoticeText}>Tienes una solicitud en revisión. Espera respuesta del administrador antes de enviar otra.</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.openFormBtn}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.85}
          >
            <Ionicons name={showForm ? "close" : "add-circle-outline"} size={16} color="#ffffff" />
            <Text style={styles.openFormBtnText}>{showForm ? 'Cancelar Solicitud' : 'Nueva Solicitud de Adelanto'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}
      {successMsg ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={16} color={THEME.colors.success} />
          <Text style={styles.successBannerText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* Request Form */}
      {showForm && !hasPending && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Solicitar Adelanto de Sueldo</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monto requerido en USD ($) *</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder={`Máx. ${maxLimit.toFixed(2)}`}
                placeholderTextColor="#94a3b8"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <Text style={styles.inputHelp}>Límite permitido según política: {formatCurrency(maxLimit)}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha requerida (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={requiredByDate}
              onChangeText={setRequiredByDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Motivo / Observación (Opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Ej: Emergencia médica, reparación vehículo..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>Enviar Solicitud a Administración</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Request History */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Historial de Solicitudes</Text>
          <Text style={styles.historyCount}>{myRequests.length} registradas</Text>
        </View>

        {myRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={36} color="#cbd5e1" />
            <Text style={styles.emptyText}>No has realizado solicitudes de adelanto todavía.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {myRequests.map((req) => {
              const badge = getStatusBadge(req.status);
              return (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.requestItemTop}>
                    <View>
                      <Text style={styles.requestAmount}>{formatCurrency(req.amount)}</Text>
                      <Text style={styles.requestDate}>📅 Solicitado: {formatDate(req.createdAt)}</Text>
                      {req.requiredByDate ? (
                        <Text style={styles.requestDate}>🎯 Requerido para: {formatDate(req.requiredByDate)}</Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[styles.badgeContainer, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Ionicons name={badge.icon} size={13} color={badge.color} />
                        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                      {onDeleteRequest && (
                        <TouchableOpacity
                          style={styles.deleteReqBtn}
                          onPress={() => handleDelete(req)}
                          title="Eliminar del historial"
                        >
                          <Ionicons name="trash-outline" size={14} color={THEME.colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {req.reason ? (
                    <Text style={styles.requestReason}>Motivo: "{req.reason}"</Text>
                  ) : null}

                  {req.adminComment ? (
                    <View style={styles.adminFeedbackBox}>
                      <Text style={styles.adminFeedbackLabel}>Respuesta de Administración:</Text>
                      <Text style={styles.adminFeedbackText}>{req.adminComment}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  capacityCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    gap: 12,
  },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  capacitySub: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  capacityAmount: { color: THEME.colors.primaryDark, fontSize: 20, fontWeight: '900', marginTop: 2 },
  baseSalaryBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(37, 99, 235, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  baseSalaryText: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  pendingNoticeText: { color: '#b45309', fontSize: 11, fontWeight: '600', flex: 1 },
  openFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  openFormBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  formTitle: { color: THEME.colors.textMain, fontSize: 13.5, fontWeight: '800' },
  inputGroup: { gap: 4 },
  inputLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dollarSign: { color: THEME.colors.textDim, fontSize: 14, fontWeight: '800', marginRight: 4 },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  textArea: { minHeight: 48, textAlignVertical: 'top' },
  inputHelp: { color: THEME.colors.textDim, fontSize: 10 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.success,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 4,
  },
  submitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: { color: THEME.colors.danger, fontSize: 11.5, fontWeight: '600', flex: 1 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  successBannerText: { color: THEME.colors.success, fontSize: 11.5, fontWeight: '600', flex: 1 },
  historyCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  historyTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  historyCount: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '600' },
  requestItem: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  requestItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 },
  requestAmount: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '900' },
  requestDate: { color: THEME.colors.textDim, fontSize: 10.5, marginTop: 1 },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10.5, fontWeight: '800' },
  requestReason: { color: '#475569', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  adminFeedbackBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    marginTop: 4,
  },
  adminFeedbackLabel: { color: THEME.colors.primaryDark, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  adminFeedbackText: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '600', marginTop: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { color: THEME.colors.textDim, fontSize: 11.5, fontStyle: 'italic', textAlign: 'center' },
  deleteReqBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
