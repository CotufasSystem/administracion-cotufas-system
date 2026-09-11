import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency } from '../../utils/formatters';

export const EmployeeRankModal = ({ visible, onClose, employees = [], attendance = {}, payrollPayments = [], employeeOfMonth, onSaveEmployeeOfMonth, onSaveEmployee }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employeeOfMonth?.empId || '');
  const [reason, setReason] = useState(employeeOfMonth?.reason || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingPointsEmpId, setEditingPointsEmpId] = useState(null);
  const [tempPointsVal, setTempPointsVal] = useState('');

  const rankings = useMemo(() => {
    return employees.map((emp) => {
      let presentCount = 0;
      let lateCount = 0;
      Object.keys(attendance).forEach(dateKey => {
        const dayRec = attendance[dateKey]?.[emp.id];
        const status = typeof dayRec === 'object' ? dayRec?.status : dayRec;
        if (status === 'present') presentCount++;
        else if (status === 'late') lateCount++;
      });

      const totalBonuses = (payrollPayments || []).filter(p => p.empId === emp.id).reduce((s, p) => s + (Number(p.bonus) || 0), 0);
      const customPoints = Number(emp.customPoints) || 0;
      const score = (presentCount * 10) + (totalBonuses * 2) - (lateCount * 5) + customPoints;

      return {
        ...emp,
        presentCount,
        lateCount,
        totalBonuses,
        customPoints,
        score: Math.max(0, score),
      };
    }).sort((a, b) => b.score - a.score);
  }, [employees, attendance, payrollPayments]);

  const currentEOM = employees.find(e => e.id === (employeeOfMonth?.empId || rankings[0]?.id));

  const handleSaveEOM = () => {
    if (onSaveEmployeeOfMonth) {
      onSaveEmployeeOfMonth({
        empId: selectedEmpId || currentEOM?.id,
        reason: reason.trim() || 'Excelente desempeño, puntualidad y compromiso.',
        monthYear: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      });
    }
    setIsAssigning(false);
  };

  const handleQuickAddPoints = (emp, delta) => {
    if (!onSaveEmployee) return;
    const current = Number(emp.customPoints) || 0;
    const updated = Math.max(0, current + delta);
    onSaveEmployee({
      ...emp,
      customPoints: updated,
    });
  };

  const handleSaveCustomPoints = (emp) => {
    if (!onSaveEmployee) return;
    const updated = Math.max(0, Number(tempPointsVal) || 0);
    onSaveEmployee({
      ...emp,
      customPoints: updated,
    });
    setEditingPointsEmpId(null);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Ranking de Rendimiento & Empleado del Mes" maxWidth={720}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Empleado del Mes Spotlight */}
        <View style={styles.spotlightCard}>
          <View style={styles.trophyBadge}>
            <Text style={{ fontSize: 26 }}>🏆</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.spotlightLabel}>EMPLEADO DEL MES • {employeeOfMonth?.monthYear || 'Actual'}</Text>
            <Text style={styles.spotlightName}>{currentEOM ? currentEOM.name : 'Por seleccionar'}</Text>
            <Text style={styles.spotlightArea}>{currentEOM?.area || 'Operaciones'}</Text>
            <Text style={styles.spotlightReason}>"{employeeOfMonth?.reason || 'Reconocimiento al mayor compromiso y eficiencia en el equipo.'}"</Text>
          </View>
          <TouchableOpacity style={styles.assignBtn} onPress={() => setIsAssigning(!isAssigning)}>
            <Ionicons name="ribbon-outline" size={14} color="#000" />
            <Text style={styles.assignBtnText}>Designar</Text>
          </TouchableOpacity>
        </View>

        {isAssigning && (
          <View style={styles.assignForm}>
            <Text style={styles.formTitle}>Elegir Empleado del Mes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
              {employees.map(e => (
                <TouchableOpacity key={e.id} style={[styles.empPick, selectedEmpId === e.id && styles.empPickActive]} onPress={() => setSelectedEmpId(e.id)}>
                  <Text style={[styles.empPickText, selectedEmpId === e.id && styles.empPickTextActive]}>{e.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Motivo del reconocimiento (ej. Gran rendimiento y proactividad)"
              placeholderTextColor={THEME.colors.textDim}
            />
            <TouchableOpacity style={styles.saveEomBtn} onPress={handleSaveEOM}>
              <Text style={styles.saveEomBtnText}>Guardar Reconocimiento</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Leaderboard */}
        <View style={styles.rankList}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.rankSectionTitle}>Tabla de Posiciones y Rendimiento</Text>
            <Text style={{ fontSize: 10, color: THEME.colors.textDim }}>Puntos: Asistencias (+10) + Bonos ($2) + Puntos Asignados - Tardanzas (-5)</Text>
          </View>
          {rankings.map((emp, idx) => {
            const isTop1 = idx === 0;
            const isTop2 = idx === 1;
            const isTop3 = idx === 2;
            const medal = isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`;
            const isEditingThis = editingPointsEmpId === emp.id;

            return (
              <View key={emp.id} style={[styles.rankRow, isTop1 && styles.rankRowTop1]}>
                <View style={styles.medalBox}><Text style={styles.medalText}>{medal}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.empName}>{emp.name} <Text style={styles.empArea}>({emp.area})</Text></Text>
                  <Text style={styles.empStats}>
                    ✅ Asistencias: {emp.presentCount} | 🎁 Bonos: {formatCurrency(emp.totalBonuses)} | ⭐ Asignados: {emp.customPoints || 0} pts
                  </Text>

                  {/* Quick points adjust controls */}
                  <View style={styles.pointsControlsRow}>
                    <Text style={styles.pointsActionLabel}>Asignar puntos:</Text>
                    <TouchableOpacity
                      style={styles.pointQuickBtn}
                      onPress={() => handleQuickAddPoints(emp, 5)}
                      title="Sumar 5 puntos"
                    >
                      <Text style={styles.pointQuickBtnText}>+5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pointQuickBtn}
                      onPress={() => handleQuickAddPoints(emp, 10)}
                      title="Sumar 10 puntos"
                    >
                      <Text style={styles.pointQuickBtnText}>+10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pointQuickBtn, styles.pointMinusBtn]}
                      onPress={() => handleQuickAddPoints(emp, -5)}
                      title="Restar 5 puntos"
                    >
                      <Text style={[styles.pointQuickBtnText, styles.pointMinusBtnText]}>-5</Text>
                    </TouchableOpacity>

                    {isEditingThis ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TextInput
                          style={styles.inlinePointInput}
                          value={tempPointsVal}
                          onChangeText={setTempPointsVal}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={THEME.colors.textDim}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.inlinePointOkBtn}
                          onPress={() => handleSaveCustomPoints(emp)}
                        >
                          <Ionicons name="checkmark" size={13} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.inlinePointCancelBtn}
                          onPress={() => setEditingPointsEmpId(null)}
                        >
                          <Ionicons name="close" size={13} color={THEME.colors.textDim} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.editPointPencilBtn}
                        onPress={() => {
                          setEditingPointsEmpId(emp.id);
                          setTempPointsVal(String(emp.customPoints || 0));
                        }}
                        title="Escribir cantidad de puntos exacta"
                      >
                        <Ionicons name="pencil" size={11} color={THEME.colors.primary} />
                        <Text style={styles.editPointPencilText}>Editar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{emp.score} pts</Text>
                  <Text style={styles.scoreLabel}>Puntuación</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 10 },
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  trophyBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  spotlightLabel: { color: '#b45309', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  spotlightName: { color: '#0f172a', fontSize: 17, fontWeight: '900', marginTop: 2 },
  spotlightArea: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  spotlightReason: { color: '#334155', fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  assignBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  assignBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },
  assignForm: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { color: '#0f172a', fontSize: 12, fontWeight: '800' },
  empPick: { backgroundColor: '#ffffff', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  empPickActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  empPickText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  empPickTextActive: { color: '#ffffff', fontWeight: '900' },
  reasonInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#0f172a', fontSize: 12, outlineStyle: 'none' },
  saveEomBtn: { backgroundColor: THEME.colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveEomBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  rankList: { gap: 8 },
  rankSectionTitle: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  rankRowTop1: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffdf5',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  medalBox: { width: 34, alignItems: 'center' },
  medalText: { fontSize: 20, fontWeight: '900', color: THEME.colors.primary },
  empName: { color: THEME.colors.textMain, fontSize: 13.5, fontWeight: '800' },
  empArea: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '500' },
  empStats: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 3, fontWeight: '600' },
  pointsControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, flexWrap: 'wrap' },
  pointsActionLabel: { fontSize: 10.5, color: THEME.colors.textDim, fontWeight: '700' },
  pointQuickBtn: { backgroundColor: 'rgba(37, 99, 235, 0.12)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pointQuickBtnText: { color: THEME.colors.primary, fontSize: 10.5, fontWeight: '800' },
  pointMinusBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)' },
  pointMinusBtnText: { color: THEME.colors.danger },
  inlinePointInput: { width: 50, height: 24, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: THEME.colors.primary, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 0, fontSize: 11, color: '#0f172a', textAlign: 'center', outlineStyle: 'none' },
  inlinePointOkBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: THEME.colors.primary, alignItems: 'center', justifyContent: 'center' },
  inlinePointCancelBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  editPointPencilBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(37, 99, 235, 0.08)' },
  editPointPencilText: { fontSize: 10.5, color: THEME.colors.primary, fontWeight: '800' },
  scoreBox: { alignItems: 'flex-end', minWidth: 65 },
  scoreVal: { color: THEME.colors.primary, fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  scoreLabel: { color: THEME.colors.textDim, fontSize: 9.5, fontWeight: '600' },
});
