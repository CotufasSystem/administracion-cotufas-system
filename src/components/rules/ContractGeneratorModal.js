import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { COTUFAS_LOGO_DATA_URL } from '../../constants/logoDataUri';

export const ContractGeneratorModal = ({ visible, onClose, employees = [] }) => {
  const { profileImage } = useApp();
  const [searchEmp, setSearchEmp] = useState('');
  const [empName, setEmpName] = useState('');
  const [empIdCard, setEmpIdCard] = useState('');
  const [empPosition, setEmpPosition] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [contractType, setContractType] = useState('Indefinido / Tiempo Completo');

  const filteredEmployees = useMemo(() => {
    if (!searchEmp.trim()) return employees;
    const q = searchEmp.toLowerCase().trim();
    return employees.filter(e => (e.name || '').toLowerCase().includes(q) || (e.idCard || '').toLowerCase().includes(q));
  }, [employees, searchEmp]);

  const handleSelectEmp = (eId) => {
    const found = employees.find(e => e.id === eId);
    if (found) {
      setEmpName(found.name || '');
      setEmpIdCard(found.idCard || '');
      setEmpPosition(found.area || 'Desarrollador / Operaciones');
      setEmpSalary(found.salary ? String(found.salary) : '');
    }
  };

  const handlePrintContract = () => {
    const effectiveLogo = profileImage || COTUFAS_LOGO_DATA_URL;
    const logoHtml = effectiveLogo ? `<img src="${effectiveLogo}" alt="Logo" style="max-height: 50px; max-width: 140px; object-fit: contain; margin-bottom: 6px; display: block; margin-left: auto; margin-right: auto;" />` : '';
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Trabajo - ${empName || 'Colaborador'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Georgia", "Times New Roman", serif; color: #111827; }
    body { padding: 20px 26px; font-size: 11px; line-height: 1.4; }
    .header { text-align: center; border-bottom: 1.5px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
    .title { font-size: 13.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; }
    .sub { font-size: 9.5px; color: #4b5563; text-transform: uppercase; margin-top: 2px; }
    .content p { margin-bottom: 8px; text-align: justify; }
    .clause { font-weight: bold; margin-top: 8px; margin-bottom: 2px; font-size: 11px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 10px; page-break-inside: avoid; }
    .sig-box { width: 44%; text-align: center; border-top: 1px solid #111827; padding-top: 6px; font-size: 10.5px; line-height: 1.3; }
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <div class="title">CONTRATO INDIVIDUAL DE TRABAJO Y PRESTACIÓN DE SERVICIOS</div>
    <div class="sub">COTUFAS SYSTEM • ADMINISTRACIÓN Y CONTROL OPERATIVO</div>
  </div>
  <div class="content">
    <p>Entre la empresa <strong>COTUFAS SYSTEM</strong>, y por la otra parte el(la) ciudadano(a) <strong>${empName.toUpperCase() || '____________________'}</strong>, titular del documento de identidad / Cédula N° <strong>${empIdCard || '____________________'}</strong>, en adelante denominado <strong>EL TRABAJADOR</strong>, se celebra el presente contrato conforme a las siguientes cláusulas:</p>
    
    <div class="clause">PRIMERA: DEL OBJETO Y CARGO</div>
    <p>EL TRABAJADOR se compromete a prestar sus servicios desempeñando el cargo y funciones correspondientes al área de <strong>${empPosition || 'Desarrollo y Operaciones'}</strong>, ejecutando sus deberes con máxima confidencialidad, diligencia y profesionalismo.</p>

    <div class="clause">SEGUNDA: DE LA REMUNERACIÓN Y FORMA DE PAGO</div>
    <p>La empresa conviene en abonar a EL TRABAJADOR una remuneración convenida de <strong>${formatCurrency(Number(empSalary) || 0)}</strong> pagaderos quincenalmente o según el cronograma acordado de nómina de la empresa.</p>

    <div class="clause">TERCERA: DE LA CONFIDENCIALIDAD Y REGLAS INTERNAS</div>
    <p>EL TRABAJADOR declara conocer y acatar plenamente el Reglamento Interno de Trabajo de Cotufas System, protegiendo todo código fuente, bases de datos, contraseñas e información financiera de la empresa y clientes.</p>

    <div class="clause">CUARTA: VIGENCIA</div>
    <p>El presente acuerdo entra en vigencia a partir del día <strong>${formatDate(startDate)}</strong> bajo modalidad de <strong>${contractType}</strong>.</p>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <strong>POR LA EMPRESA</strong><br/>
      COTUFAS SYSTEM<br/>
      Dirección de Administración
    </div>
    <div class="sig-box">
      <strong>EL TRABAJADOR</strong><br/>
      ${empName || 'Firma del Colaborador'}<br/>
      C.I.: ${empIdCard || ''}
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Generador Formal de Contrato Laboral" maxWidth={620}>
      <ScrollView contentContainerStyle={styles.container}>
        {employees.length > 0 && (
          <View style={styles.quickEmpRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Cargar datos de empleado registrado ({filteredEmployees.length}):</Text>
            </View>

            {/* Search filter for workers */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={15} color={THEME.colors.textDim} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar trabajador por nombre o cédula..."
                placeholderTextColor={THEME.colors.textDim}
                value={searchEmp}
                onChangeText={setSearchEmp}
              />
              {searchEmp ? (
                <TouchableOpacity onPress={() => setSearchEmp('')}>
                  <Ionicons name="close-circle" size={15} color={THEME.colors.textDim} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Horizontal Scroll list with touch & mouse drag support */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
              keyboardShouldPersistTaps="handled"
            >
              {filteredEmployees.map(e => {
                const isSelected = empName === e.name;
                return (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.empBadge, isSelected && styles.empBadgeActive]}
                    onPress={() => handleSelectEmp(e.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person" size={12} color={isSelected ? '#ffffff' : THEME.colors.primary} />
                    <Text style={[styles.empBadgeText, isSelected && styles.empBadgeTextActive]}>{e.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre Completo del Trabajador</Text>
          <TextInput style={styles.input} value={empName} onChangeText={setEmpName} placeholder="Ej. Alejandro Pérez" placeholderTextColor={THEME.colors.textDim} />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Cédula / Documento de Identidad</Text>
            <TextInput style={styles.input} value={empIdCard} onChangeText={setEmpIdCard} placeholder="Ej. V-28.123.456" placeholderTextColor={THEME.colors.textDim} />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Cargo / Área</Text>
            <TextInput style={styles.input} value={empPosition} onChangeText={setEmpPosition} placeholder="Ej. Programador Senior" placeholderTextColor={THEME.colors.textDim} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Sueldo Mensual ($)</Text>
            <TextInput style={styles.input} value={empSalary} onChangeText={setEmpSalary} placeholder="300" keyboardType="numeric" placeholderTextColor={THEME.colors.textDim} />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Fecha de Inicio</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={THEME.colors.textDim} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Contrato</Text>
          <TextInput style={styles.input} value={contractType} onChangeText={setContractType} placeholder="Tiempo Completo / Proyecto" placeholderTextColor={THEME.colors.textDim} />
        </View>

        <TouchableOpacity style={styles.printBtn} onPress={handlePrintContract} activeOpacity={0.8}>
          <Ionicons name="print" size={16} color="#ffffff" />
          <Text style={styles.printBtnText}>Imprimir / Exportar Contrato en PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 10 },
  quickEmpRow: { gap: 8, backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  label: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border, paddingHorizontal: 10, gap: 6 },
  searchInput: { flex: 1, fontSize: 12, color: THEME.colors.textMain, paddingVertical: 6, outlineStyle: 'none' },
  empBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: THEME.colors.bgSurface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: THEME.colors.border },
  empBadgeActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  empBadgeText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '700' },
  empBadgeTextActive: { color: '#ffffff' },
  formGroup: { gap: 4 },
  row: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.md, paddingHorizontal: 12, paddingVertical: 8, color: THEME.colors.textMain, fontSize: 13 },
  printBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.primary, paddingVertical: 12, borderRadius: THEME.radius.md, marginTop: 8 },
  printBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
});
