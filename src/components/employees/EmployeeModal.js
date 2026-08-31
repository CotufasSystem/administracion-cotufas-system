import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper, CustomInput, PrimaryButton } from '../common/UIComponents';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export const EmployeeModal = ({ visible, employee, onClose, onSave }) => {
  const { projects } = useApp();
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('');
  const [binance, setBinance] = useState('');
  const [area, setArea] = useState('');
  const [schedule, setSchedule] = useState('');
  const [exemptAttendance, setExemptAttendance] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setIdCard(employee.idCard || '');
      setPhone(employee.phone || '');
      setHireDate(employee.hireDate || '');
      setSalary(employee.salary ? String(employee.salary) : '');
      setBinance(employee.binance || '');
      setArea(employee.area || 'Operaciones');
      setSchedule(employee.schedule || '9:00 AM - 5:00 PM');
      setExemptAttendance(Boolean(employee.exemptAttendance));
      setSelectedProjects(employee.projectIds || []);
    } else {
      setName('');
      setIdCard('');
      setPhone('');
      setHireDate('');
      setSalary('');
      setBinance('');
      setArea('Operaciones');
      setSchedule('9:00 AM - 5:00 PM');
      setExemptAttendance(false);
      setSelectedProjects([]);
    }
  }, [visible, employee]);

  const toggleProject = (projId) => {
    if (selectedProjects.includes(projId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projId));
    } else {
      setSelectedProjects([...selectedProjects, projId]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...(employee || {}),
      name: name.trim(),
      idCard: idCard.trim(),
      phone: phone.trim(),
      hireDate: hireDate.trim(),
      salary: Number(salary) || 0,
      binance: binance.trim(),
      area: area.trim(),
      schedule: schedule.trim(),
      exemptAttendance,
      projectIds: selectedProjects,
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={employee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
      maxWidth={560}
    >
      <View style={styles.content}>
        <CustomInput
          label="Nombre Completo"
          placeholder="Ej: Alejandro / Francys"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.twoColRow}>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Cédula / Documento"
              placeholder="Ej: V-25.123.456"
              value={idCard}
              onChangeText={setIdCard}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Teléfono / WhatsApp"
              placeholder="Ej: 0412-1234567"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Día / Fecha de Ingreso"
              placeholder="Ej: 15/01/2024"
              value={hireDate}
              onChangeText={setHireDate}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Sueldo Base Mensual ($)"
              placeholder="Ej: 300"
              keyboardType="numeric"
              value={salary}
              onChangeText={setSalary}
            />
          </View>
        </View>

        <CustomInput
          label="Área / Cargo"
          placeholder="Ej: Programador, Diseñador, Operaciones..."
          value={area}
          onChangeText={setArea}
        />

        {/* Quick Area Suggestions */}
        <View style={styles.quickAreaRow}>
          {['👑 Dueño / Socio', '💼 Operaciones', '🧹 Servicios / Limpieza', '💻 Desarrollo / Diseño'].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.quickAreaBtn, area === preset && styles.quickAreaBtnActive]}
              onPress={() => setArea(preset)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickAreaText, area === preset && styles.quickAreaTextActive]}>{preset}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput
          label="Cuenta Binance (Email / Pay ID / Wallet)"
          placeholder="Ej: castilloclara88@gmail.com"
          value={binance}
          onChangeText={setBinance}
        />

        <CustomInput
          label="Horario Laboral"
          placeholder="Ej: 9:00 AM - 1:00 PM"
          value={schedule}
          onChangeText={setSchedule}
        />

        {/* Attendance Exemption Switch */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Exento de Asistencia</Text>
            <Text style={styles.switchSubtitle}>No participa en la lista ni conteo de asistencia diaria</Text>
          </View>
          <Switch
            value={exemptAttendance}
            onValueChange={setExemptAttendance}
            trackColor={{ false: '#cbd5e1', true: THEME.colors.primaryDark }}
            thumbColor={exemptAttendance ? THEME.colors.primary : '#f4f3f4'}
          />
        </View>

        {/* Projects Assignment */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionLabel}>Proyectos Asignados</Text>
          <View style={styles.projectsList}>
            {projects.map((proj) => {
              const isSelected = selectedProjects.includes(proj.id);
              return (
                <TouchableOpacity
                  key={proj.id}
                  style={[styles.projBadge, isSelected && styles.projBadgeActive]}
                  onPress={() => toggleProject(proj.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={isSelected ? THEME.colors.primary : THEME.colors.textDim}
                  />
                  <Text style={[styles.projBadgeText, isSelected && styles.projBadgeTextActive]}>{proj.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.btnRow}>
          <PrimaryButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton title="Guardar Empleado" icon="save-outline" onPress={handleSave} style={{ flex: 1 }} />
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  content: { gap: THEME.spacing.sm },
  twoColRow: { flexDirection: 'row', gap: 10 },
  quickAreaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  quickAreaBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm },
  quickAreaBtnActive: { borderColor: THEME.colors.primary, backgroundColor: 'rgba(37, 99, 235, 0.12)' },
  quickAreaText: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '600' },
  quickAreaTextActive: { color: THEME.colors.primaryDark, fontWeight: '800' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)', padding: 10, borderRadius: THEME.radius.md, gap: 8 },
  switchTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '700' },
  switchSubtitle: { color: THEME.colors.textMuted, fontSize: 10, marginTop: 2 },
  projectsSection: { marginVertical: THEME.spacing.xs },
  sectionLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  projectsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  projBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.md },
  projBadgeActive: { borderColor: THEME.colors.primary, backgroundColor: 'rgba(37, 99, 235, 0.12)' },
  projBadgeText: { color: THEME.colors.textMuted, fontSize: 12 },
  projBadgeTextActive: { color: THEME.colors.textMain, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: THEME.spacing.md, marginTop: THEME.spacing.md },
});
