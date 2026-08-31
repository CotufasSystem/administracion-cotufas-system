import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency } from '../../utils/formatters';

export const EmployeeRankModal = ({ visible, onClose, employees = [], attendance = {}, payrollPayments = [], employeeOfMonth, onSaveEmployeeOfMonth }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employeeOfMonth?.empId || '');
  const [reason, setReason] = useState(employeeOfMonth?.reason || '');
  const [isAssigning, setIsAssigning] = useState(false);

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
      const score = (presentCount * 10) + (totalBonuses * 2) - (lateCount * 5);

      return {
        ...emp,
        presentCount,
        lateCount,
        totalBonuses,
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

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Ranking de Rendimiento & Empleado del Mes" maxWidth={680}>
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
          <Text style={styles.rankSectionTitle}>Tabla de Posiciones y Rendimiento</Text>
          {rankings.map((emp, idx) => {
            const isTop1 = idx === 0;
            const isTop2 = idx === 1;
            const isTop3 = idx === 2;
            const medal = isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`;

            return (
              <View key={emp.id} style={[styles.rankRow, isTop1 && styles.rankRowTop1]}>
                <View style={styles.medalBox}><Text style={styles.medalText}>{medal}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.empName}>{emp.name} <Text style={styles.empArea}>({emp.area})</Text></Text>
                  <Text style={styles.empStats}>
                    ✅ Asistencias: {emp.presentCount} | 🎁 Bonos: {formatCurrency(emp.totalBonuses)}
                  </Text>
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
  container: { gap: 12, paddingBottom: 10 },
  spotlightCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(245, 158, 11, 0.12)', borderWidth: 1, borderColor: THEME.colors.primary, borderRadius: THEME.radius.lg, padding: 14 },
  trophyBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },
  spotlightLabel: { color: THEME.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  spotlightName: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '900', marginTop: 2 },
  spotlightArea: { color: THEME.colors.textMuted, fontSize: 11 },
  spotlightReason: { color: THEME.colors.textMain, fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  assignBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  assignBtnText: { color: '#000', fontSize: 11, fontWeight: '800' },
  assignForm: { backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, gap: 8, borderWidth: 1, borderColor: THEME.colors.border },
  formTitle: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '800' },
  empPick: { backgroundColor: THEME.colors.bgSurface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border },
  empPickActive: { backgroundColor: THEME.colors.primary },
  empPickText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  empPickTextActive: { color: '#000', fontWeight: '900' },
  reasonInput: { backgroundColor: THEME.colors.bgCard, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.sm, paddingHorizontal: 10, paddingVertical: 6, color: THEME.colors.textMain, fontSize: 12 },
  saveEomBtn: { backgroundColor: THEME.colors.primary, paddingVertical: 8, borderRadius: THEME.radius.sm, alignItems: 'center' },
  saveEomBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  rankList: { gap: 6 },
  rankSectionTitle: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  rankRowTop1: { borderColor: THEME.colors.primary, backgroundColor: 'rgba(245, 158, 11, 0.06)' },
  medalBox: { width: 32, alignItems: 'center' },
  medalText: { fontSize: 18, fontWeight: '900', color: THEME.colors.primary },
  empName: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  empArea: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '400' },
  empStats: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  scoreBox: { alignItems: 'flex-end' },
  scoreVal: { color: THEME.colors.primary, fontSize: 13, fontWeight: '900' },
  scoreLabel: { color: THEME.colors.textDim, fontSize: 9 },
});
