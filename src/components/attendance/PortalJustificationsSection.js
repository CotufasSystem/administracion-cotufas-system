import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatDate } from '../../utils/formatters';
import { getUnjustifiedIncidents, submitAttendanceJustification } from '../../services/portalService';

export const PortalJustificationsSection = ({ employee, attendance = {}, attendanceJustifications = [] }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Unjustified dates / incidents detected by the system
  const pendingIncidents = useMemo(() => {
    return getUnjustifiedIncidents(employee?.id, attendance, attendanceJustifications);
  }, [employee?.id, attendance, attendanceJustifications]);

  // History of justifications submitted by this employee
  const myJustifications = useMemo(() => {
    return (attendanceJustifications || [])
      .filter((j) => j.employeeId === employee?.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [attendanceJustifications, employee?.id]);

  const handleFileUpload = (e) => {
    if (Platform.OS === 'web') {
      const file = e.target?.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El archivo adjunto supera los 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setAttachment({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          storageUrl: loadEvt.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedIncident) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!reason.trim()) {
      setErrorMsg('Por favor describe la razón o motivo de la justificación.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitAttendanceJustification({
        employee,
        dateKey: selectedIncident.dateKey,
        incidentType: selectedIncident.type,
        reason,
        attachments: attachment ? [attachment] : [],
      });

      setSelectedIncident(null);
      setReason('');
      setAttachment(null);
      setSuccessMsg('¡Justificación enviada correctamente al administrador!');
      if (Platform.OS === 'web') {
        window.alert('¡Justificación enviada con éxito!');
      } else {
        Alert.alert('Éxito', 'Justificación registrada para revisión.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al enviar justificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'En Espera', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#d97706', icon: 'time-outline' };
      case 'approved':
        return { label: 'Aceptada', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.3)', color: THEME.colors.success, icon: 'checkmark-circle-outline' };
      case 'rejected':
        return { label: 'Desestimada', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', color: THEME.colors.danger, icon: 'close-circle-outline' };
      default:
        return { label: status, bg: '#f1f5f9', border: '#cbd5e1', color: '#64748b', icon: 'help-circle-outline' };
    }
  };

  return (
    <View style={styles.container}>
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

      {/* Pending Incidents List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>Inasistencias & Tardanzas Detectadas</Text>
            <Text style={styles.cardSub}>Fechas registradas que requieren tu justificación</Text>
          </View>
          <View style={[styles.badgePill, pendingIncidents.length > 0 ? styles.badgePillWarning : styles.badgePillSuccess]}>
            <Text style={[styles.badgePillText, pendingIncidents.length > 0 ? { color: '#d97706' } : { color: THEME.colors.success }]}>
              {pendingIncidents.length} pendientes
            </Text>
          </View>
        </View>

        {pendingIncidents.length === 0 ? (
          <View style={styles.cleanNotice}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cleanNoticeTitle}>¡Todo al día y sin faltas pendientes!</Text>
              <Text style={styles.cleanNoticeSub}>No tienes fechas con inasistencias o retrasos por justificar.</Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {pendingIncidents.map((inc) => {
              const isSelected = selectedIncident?.dateKey === inc.dateKey;
              return (
                <View key={inc.dateKey} style={[styles.incidentRow, isSelected && styles.incidentRowSelected]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name={inc.type === 'absent' ? 'close-circle-outline' : 'alarm-outline'}
                        size={16}
                        color={inc.type === 'absent' ? THEME.colors.danger : '#d97706'}
                      />
                      <Text style={styles.incidentDate}>{formatDate(inc.dateKey)}</Text>
                    </View>
                    <Text style={styles.incidentType}>{inc.label} {inc.time ? `• Hora: ${inc.time}` : ''}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.justifyBtn, isSelected && styles.justifyBtnActive]}
                    onPress={() => setSelectedIncident(isSelected ? null : inc)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isSelected ? "close" : "create-outline"} size={13} color="#ffffff" />
                    <Text style={styles.justifyBtnText}>{isSelected ? 'Cerrar' : 'Justificar'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Justification Input Form (if an incident is selected) */}
      {selectedIncident && (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={THEME.colors.primary} />
            <Text style={styles.formTitle}>
              Justificando: {formatDate(selectedIncident.dateKey)} ({selectedIncident.label})
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Explica el motivo de la inasistencia o retraso *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Indica las razones por las cuales no pudiste asistir o llegaste tarde..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Attachment upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adjuntar Evidencia o Comprobante (Opcional)</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.uploadArea}>
                <input
                  type="file"
                  id="just-file-input"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="just-file-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="document-attach-outline" size={18} color={THEME.colors.primary} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.primaryDark }}>
                    {attachment ? `Adjunto listo: ${attachment.fileName}` : 'Cargar foto o soporte'}
                  </span>
                </label>
              </View>
            ) : null}

            {attachment && (
              <View style={styles.attachmentPreview}>
                <Ionicons name="document-text" size={15} color={THEME.colors.success} />
                <Text style={styles.attachmentName} numberOfLines={1}>{attachment.fileName}</Text>
                <TouchableOpacity onPress={() => setAttachment(null)}>
                  <Ionicons name="close-circle" size={16} color={THEME.colors.danger} />
                </TouchableOpacity>
              </View>
            )}
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
                <Ionicons name="send" size={15} color="#ffffff" />
                <Text style={styles.submitBtnText}>Enviar Justificación a Administración</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* History of Submitted Justifications */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Historial de Justificaciones Enviadas</Text>
          <Text style={styles.cardSubCount}>{myJustifications.length} registradas</Text>
        </View>

        {myJustifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>No has enviado justificaciones previamente.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {myJustifications.map((j) => {
              const badge = getStatusBadge(j.status);
              return (
                <View key={j.id} style={styles.historyItem}>
                  <View style={styles.historyItemTop}>
                    <View>
                      <Text style={styles.historyDate}>Fecha Incidente: 📅 {formatDate(j.dateKey)}</Text>
                      <Text style={styles.historySub}>Enviada: {formatDate(j.createdAt)}</Text>
                    </View>
                    <View style={[styles.badgeContainer, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Ionicons name={badge.icon} size={12} color={badge.color} />
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.historyReason}>"{j.reason}"</Text>

                  {j.attachments && j.attachments.length > 0 ? (
                    <View style={styles.attachmentChip}>
                      <Ionicons name="attach" size={12} color={THEME.colors.primary} />
                      <Text style={styles.attachmentChipText}>Evidencia adjunta: {j.attachments[0].fileName}</Text>
                    </View>
                  ) : null}

                  {j.adminComment ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>Respuesta de Administración:</Text>
                      <Text style={styles.feedbackText}>{j.adminComment}</Text>
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
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  cardTitleBox: { flex: 1, minWidth: 160 },
  cardTitle: { color: THEME.colors.textMain, fontSize: 13.5, fontWeight: '800' },
  cardSub: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 1 },
  cardSubCount: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '600' },
  badgePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  badgePillWarning: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  badgePillSuccess: { backgroundColor: 'rgba(22, 163, 74, 0.1)', borderColor: 'rgba(22, 163, 74, 0.3)' },
  badgePillText: { fontSize: 10.5, fontWeight: '800' },
  cleanNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  cleanNoticeTitle: { color: THEME.colors.success, fontSize: 12.5, fontWeight: '800' },
  cleanNoticeSub: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  incidentRowSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: THEME.colors.primary,
  },
  incidentDate: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  incidentType: { color: '#64748b', fontSize: 11, marginTop: 2 },
  justifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  justifyBtnActive: {
    backgroundColor: '#475569',
  },
  justifyBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    gap: 10,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formTitle: { color: THEME.colors.primaryDark, fontSize: 13, fontWeight: '800' },
  inputGroup: { gap: 4 },
  inputLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700' },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  attachmentName: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '600', flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 11,
    borderRadius: 8,
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
  historyItem: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  historyItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyDate: { color: THEME.colors.textMain, fontSize: 12.5, fontWeight: '800' },
  historySub: { color: THEME.colors.textDim, fontSize: 10, marginTop: 1 },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '800' },
  historyReason: { color: '#334155', fontSize: 11.5, marginTop: 2 },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  attachmentChipText: { color: THEME.colors.primaryDark, fontSize: 10, fontWeight: '600' },
  feedbackBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    marginTop: 4,
  },
  feedbackLabel: { color: THEME.colors.primaryDark, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' },
  feedbackText: { color: THEME.colors.textMain, fontSize: 11, fontWeight: '600', marginTop: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { color: THEME.colors.textDim, fontSize: 11.5, fontStyle: 'italic', textAlign: 'center' },
});
