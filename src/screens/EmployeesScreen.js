import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { EmployeeRankModal } from '../components/employees/EmployeeRankModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const EmployeesScreen = () => {
  const { employees, saveEmployee, deleteEmployee, attendance, payrollPayments, employeeOfMonth, saveEmployeeOfMonth } = useApp();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [deletingEmpId, setDeletingEmpId] = useState(null);

  const totalBaseSalary = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Top Banner & Actions */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.rankBtn} onPress={() => setIsRankModalOpen(true)} activeOpacity={0.8}>
          <Ionicons name="trophy" size={15} color="#ffffff" />
          <Text style={styles.rankBtnText}>🏆 Empleado del Mes & Ranking</Text>
        </TouchableOpacity>
        <PrimaryButton title="Nuevo Empleado" icon="person-add" onPress={() => setIsAddModalOpen(true)} small />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Empleados Registrados</Text>
          <Text style={[styles.summaryValue, { color: THEME.colors.primary }]}>{employees.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Presupuesto Base Mensual</Text>
          <Text style={[styles.summaryValue, { color: THEME.colors.success }]}>{formatCurrency(totalBaseSalary)}</Text>
        </View>
      </View>

      {/* Employees List */}
      <Card title="Lista de Empleados (A - Z)" icon="people-outline">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            onEdit={setEditingEmployee}
            onDelete={(id) => setDeletingEmpId(id)}
          />
        ))}
      </Card>

      {/* Modals */}
      <EmployeeModal
        visible={Boolean(editingEmployee || isAddModalOpen)}
        employee={editingEmployee}
        onClose={() => { setEditingEmployee(null); setIsAddModalOpen(false); }}
        onSave={saveEmployee}
      />

      <EmployeeRankModal
        visible={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        employees={employees}
        attendance={attendance}
        payrollPayments={payrollPayments}
        employeeOfMonth={employeeOfMonth}
        onSaveEmployeeOfMonth={saveEmployeeOfMonth}
      />

      <PinConfirmModal
        visible={Boolean(deletingEmpId)}
        onClose={() => setDeletingEmpId(null)}
        onConfirm={() => { if (deletingEmpId) deleteEmployee(deletingEmpId); }}
        title="Eliminar Empleado"
        description="Este empleado y sus registros asociados serán eliminados permanentemente."
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  rankBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: THEME.radius.md },
  rankBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  summaryGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  summaryCard: { flex: 1, minWidth: 160, marginBottom: 0, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.lg, padding: 14 },
  summaryLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
});
