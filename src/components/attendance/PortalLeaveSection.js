import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { formatDate, getLocalDateString } from '../../utils/formatters';
import { calculateBusinessDays, calculateTotalDays, submitLeaveRequest } from '../../services/portalService';

const LEAVE_TYPES = [
  { id: 'medical_leave', label: 'Reposo Médico', icon: 'medkit-outline', color: '#dc2626' },
  { id: 'personal_permission', label: 'Permiso Personal', icon: 'person-outline', color: '#2563eb' },
  { id: 'bereavement', label: 'Duelo Familiar', icon: 'heart-dislike-outline', color: '#475569' },
  { id: 'legal_procedure', label: 'Trámite Legal', icon: 'document-text-outline', color: '#7c3aed' },
  { id: 'vacation', label: 'Vacaciones', icon: 'sunny-outline', color: '#d97706' },
];

export const PortalLeaveSection = ({ employee, leaveRequests = [] }) => {
  const [type, setType] = useState('medical_leave');
  const [startDate, setStartDate] = useState(getLocalDateString(new Date()));
  const [endDate, setEndDate] = useState(getLocalDateString(new Date()));
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null); // { fileName, fileType, storageUrl, fileSize }
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const myRequests = useMemo(() => {
    return (leaveRequests || [])
      .filter((r) => r.employeeId === employee?.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [leaveRequests, employee?.id]);

  const totalDays = useMemo(() => calculateTotalDays(startDate, endDate), [startDate, endDate]);
  const businessDays = useMemo(() => calculateBusinessDays(startDate, endDate), [startDate, endDate]);

  const handleFileUpload = (e) => {
    if (Platform.OS === 'web') {
      const file = e.target?.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('El archivo no debe exceder los 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setAttachment({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          storageUrl: loadEvt.target.result,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!startDate || !endDate) {
      setErrorMsg('Debes especificar fecha de inicio y fin.');
      return;
    }
    if (totalDays <= 0) {
      setErrorMsg('La fecha de fin no puede ser previa a la de inicio.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Por favor describe brevemente el motivo de la solicitud.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitLeaveRequest({
        employee,
        type,
        startDate,
        endDate,
        description,
        attachments: attachment ? [attachment] : [],
      });

      setDescription('');
      setAttachment(null);
      setShowForm(false);
      setSuccessMsg('¡Solicitud de reposo/permiso registrada exitosamente!');
      if (Platform.OS === 'web') {
        window.alert('¡Solicitud enviada para revisión!');
      } else {
        Alert.alert('Éxito', 'Solicitud registrada correctamente.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'under_review':
        return { label: 'En Revisión', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#d97706', icon: 'time-outline' };
      case 'approved':
        return { label: 'Aprobado', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.3)', color: THEME.colors.success, icon: 'checkmark-circle-outline' };
      case 'rejected':
        return { label: 'Rechazado', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', color: THEME.colors.danger, icon: 'close-circle-outline' };
      default:
        return { label: status, bg: '#f1f5f9', border: '#cbd5e1', color: '#64748b', icon: 'help-circle-outline' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Action Header Button */}
      <View style={styles.headerCard}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Reposos Médicos y Permisos</Text>
          <Text style={styles.headerSub}>Gestiona ausencias justificadas con constancias oficiales</Text>
        </View>
        <TouchableOpacity
          style={styles.openFormBtn}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.85}
        >
          <Ionicons name={showForm ? "close" : "calendar-outline"} size={16} color="#ffffff" />
          <Text style={styles.openFormBtnText}>{showForm ? 'Cancelar' : 'Reportar Ausencia / Reposo'}</Text>
        </TouchableOpacity>
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

      {/* Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Formulario de Ausencia</Text>

          {/* Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Ausencia *</Text>
            <View style={styles.typesRow}>
              {LEAVE_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typePill, isSelected && { backgroundColor: t.color, borderColor: t.color }]}
                    onPress={() => setType(t.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={t.icon} size={12} color={isSelected ? '#ffffff' : t.color} />
                    <Text style={[styles.typePillText, isSelected && { color: '#ffffff', fontWeight: '800' }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date range row */}
          <View style={styles.datesRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Desde (Inicio)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Hasta (Fin)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>

          {/* Auto calculated days summary */}
          <View style={styles.calculationRow}>
            <View style={styles.calcPill}>
              <Text style={styles.calcLabel}>Días Totales:</Text>
              <Text style={styles.calcVal}>{totalDays > 0 ? totalDays : 0} días</Text>
            </View>
            <View style={styles.calcPill}>
              <Text style={styles.calcLabel}>Días Hábiles:</Text>
              <Text style={styles.calcVal}>{businessDays} laborables</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Justificación / Diagnóstico / Detalle *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Explica detalladamente la causa de la ausencia o reposo..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Comprobante / Attachments */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adjuntar Comprobante o Informe Médico (JPG, PNG o PDF)</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.uploadArea}>
                <input
                  type="file"
                  id="leave-file-input"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="leave-file-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="cloud-upload-outline" size={20} color={THEME.colors.primary} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.colors.primaryDark }}>
                    {attachment ? `Archivo listo: ${attachment.fileName}` : 'Seleccionar Comprobante / Foto'}
                  </span>
                </label>
              </View>
            ) : null}

            {attachment && (
              <View style={styles.attachmentPreview}>
                <Ionicons name="document-attach" size={16} color={THEME.colors.success} />
                <Text style={styles.attachmentName} numberOfLines={1}>{attachment.fileName}</Text>
                <TouchableOpacity onPress={() => setAttachment(null)} style={{ marginLeft: 'auto' }}>
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
                <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>Enviar Solicitud a RRHH</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* History Card */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Mis Reposos & Permisos</Text>
          <Text style={styles.historyCount}>{myRequests.length} solicitudes</Text>
        </View>

        {myRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bandage-outline" size={36} color="#cbd5e1" />
            <Text style={styles.emptyText}>No tienes permisos ni reposos registrados.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {myRequests.map((req) => {
              const badge = getStatusBadge(req.status);
              const typeObj = LEAVE_TYPES.find((t) => t.id === req.type) || LEAVE_TYPES[0];

              return (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.requestItemTop}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name={typeObj.icon} size={15} color={typeObj.color} />
                        <Text style={[styles.requestTypeLabel, { color: typeObj.color }]}>{typeObj.label}</Text>
                      </View>
                      <Text style={styles.requestDates}>
                        📅 {formatDate(req.startDate)} al {formatDate(req.endDate)} ({req.totalDays || 1} días)
                      </Text>
                    </View>
                    <View style={[styles.badgeContainer, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Ionicons name={badge.icon} size={13} color={badge.color} />
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.requestReason}>{req.description}</Text>

                  {req.attachments && req.attachments.length > 0 ? (
                    <View style={styles.evidenceChip}>
                      <Ionicons name="attach" size={13} color={THEME.colors.primary} />
                      <Text style={styles.evidenceText}>Comprobante adjuntado: {req.attachments[0].fileName}</Text>
                    </View>
                  ) : null}

                  {req.adminFeedback ? (
                    <View style={styles.adminFeedbackBox}>
                      <Text style={styles.adminFeedbackLabel}>Observación del Administrador:</Text>
                      <Text style={styles.adminFeedbackText}>{req.adminFeedback}</Text>
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
  headerCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    gap: 10,
  },
  headerInfo: { gap: 2 },
  headerTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '900' },
  headerSub: { color: THEME.colors.textMuted, fontSize: 11 },
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
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  typePillText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  datesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  calculationRow: { flexDirection: 'row', gap: 8 },
  calcPill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  calcLabel: { color: THEME.colors.textMuted, fontSize: 10.5, fontWeight: '700' },
  calcVal: { color: THEME.colors.primaryDark, fontSize: 11, fontWeight: '800' },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 12,
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
    gap: 8,
    backgroundColor: THEME.colors.primary,
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
  requestTypeLabel: { fontSize: 13, fontWeight: '800' },
  requestDates: { color: THEME.colors.textDim, fontSize: 11, marginTop: 1 },
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
  requestReason: { color: '#334155', fontSize: 11.5, marginTop: 2 },
  evidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  evidenceText: { color: THEME.colors.primaryDark, fontSize: 10, fontWeight: '600' },
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
});
