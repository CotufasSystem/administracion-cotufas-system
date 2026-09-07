import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { EmployeeRankModal } from '../components/employees/EmployeeRankModal';
import { EmployeeWhatsAppModal } from '../components/employees/EmployeeWhatsAppModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const EmployeesScreen = () => {
  const { employees, saveEmployee, deleteEmployee, attendance, payrollPayments, employeeOfMonth, saveEmployeeOfMonth } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [whatsAppEmployee, setWhatsAppEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [deletingEmpId, setDeletingEmpId] = useState(null);

  const totalBaseSalary = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  const filteredEmployees = useMemo(() => {
    const sorted = [...employees].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
    );
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase().trim();
    return sorted.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.area?.toLowerCase().includes(q) ||
      e.binance?.toLowerCase().includes(q) ||
      e.schedule?.toLowerCase().includes(q) ||
      e.idCard?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Top Banner & Actions */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.rankBtn} onPress={() => setIsRankModalOpen(true)} activeOpacity={0.8}>
          <Ionicons name="trophy" size={15} color="#ffffff" />
          <Text style={styles.rankBtnText}>🏆 Empleado del Mes & Ranking</Text>
        </TouchableOpacity>

        {/* Buscador de Empleado */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={15} color={THEME.colors.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empleado por nombre o área..."
            placeholderTextColor={THEME.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={THEME.colors.textDim} />
            </TouchableOpacity>
          )}
        </View>

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
      <Card
        title={searchQuery.trim() ? `Resultados de Búsqueda (${filteredEmployees.length})` : "Lista de Empleados (A - Z)"}
        icon="people-outline"
      >
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onEdit={setEditingEmployee}
              onDelete={(id) => setDeletingEmpId(id)}
              onWhatsApp={setWhatsAppEmployee}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={28} color={THEME.colors.textDim} />
            <Text style={styles.emptyText}>No se encontraron empleados para "{searchQuery}"</Text>
          </View>
        )}
      </Card>

      {/* Modals */}
      <EmployeeModal
        visible={Boolean(editingEmployee || isAddModalOpen)}
        employee={editingEmployee}
        onClose={() => { setEditingEmployee(null); setIsAddModalOpen(false); }}
        onSave={saveEmployee}
      />

      <EmployeeWhatsAppModal
        visible={Boolean(whatsAppEmployee)}
        employee={whatsAppEmployee}
        onClose={() => setWhatsAppEmployee(null)}
        onSavePhone={(newPhone) => {
          if (whatsAppEmployee) {
            saveEmployee({ ...whatsAppEmployee, phone: newPhone });
          }
        }}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  rankBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: THEME.radius.md },
  rankBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  searchContainer: {
    flex: 1,
    minWidth: 220,
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: THEME.colors.textMain,
    fontSize: 13,
    paddingVertical: 0,
    outlineStyle: 'none',
  },
  summaryGrid: { flexDirection: 'row', gap: THEME.spacing.md, flexWrap: 'wrap' },
  summaryCard: { flex: 1, minWidth: 160, marginBottom: 0, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', borderRadius: THEME.radius.lg, padding: 14 },
  summaryLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: THEME.colors.textMuted, fontSize: 13, fontWeight: '600' },
});
