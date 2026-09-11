import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { COTUFAS_LOGO_DATA_URL } from '../../constants/logoDataUri';

export const ProposalGeneratorModal = ({ visible, onClose }) => {
  const { profileImage } = useApp();
  const [clientName, setClientName] = useState('');
  const [clientRif, setClientRif] = useState('');
  const [projectName, setProjectName] = useState('Desarrollo de Software & Sistema Web');
  const [validityDays, setValidityDays] = useState('15');
  const [items, setItems] = useState([
    { id: '1', desc: 'Desarrollo de Plataforma Web & Base de Datos', amount: '800' },
    { id: '2', desc: 'Mantenimiento Mensual, Servidor y Soporte Técnico', amount: '200' },
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: String(Date.now()), desc: '', amount: '' }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id, field, val) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const handlePrintProposal = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const effectiveLogo = profileImage || COTUFAS_LOGO_DATA_URL;
    const logoHtml = effectiveLogo ? `<img src="${effectiveLogo}" alt="Logo" style="max-height: 48px; max-width: 120px; object-fit: contain;" />` : '';
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Propuesta Comercial - ${clientName || 'Cliente'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; }
    body { padding: 36px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-box { display: flex; align-items: center; gap: 12px; }
    .brand { font-size: 22px; font-weight: 900; color: #0f172a; }
    .brand-sub { color: #2563eb; font-weight: 700; font-size: 11px; text-transform: uppercase; }
    .doc-meta { text-align: right; }
    .doc-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
    .client-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
    .client-title { font-weight: 800; font-size: 13px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .text-right { text-align: right; }
    .total-box { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .total-card { width: 260px; background: #0f172a; color: #fff; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .total-val { font-size: 18px; font-weight: 900; color: #f59e0b; }
    .terms { background: #f8fafc; padding: 12px; border-left: 3px solid #d97706; border-radius: 4px; font-size: 11px; color: #475569; }
    @media print { body { padding: 10mm; } @page { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-box">
      ${logoHtml}
      <div>
        <div class="brand">COTUFAS SYSTEM</div>
        <div class="brand-sub">Servicios y Soluciones Tecnológicas</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">Propuesta / Presupuesto</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Fecha: ${today}</div>
      <div style="font-size: 11px; color: #2563eb; font-weight: 700;">Vigencia: ${validityDays} días</div>
    </div>
  </div>

  <div class="client-card">
    <div class="client-title">Dirigido a: ${clientName || 'Cliente Estimado'}</div>
    ${clientRif ? `<div><strong>RIF / ID Fiscal:</strong> ${clientRif}</div>` : ''}
    <div><strong>Proyecto / Solicitud:</strong> ${projectName}</div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Descripción del Servicio / Módulo</th><th class="text-right">Monto USD</th></tr></thead>
    <tbody>
      ${items.map((it, idx) => `<tr><td style="width: 30px;">${idx + 1}</td><td><strong>${it.desc || 'Servicio Profesional'}</strong></td><td class="text-right" style="font-weight: 700;">+${formatCurrency(Number(it.amount) || 0)}</td></tr>`).join('')}
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-card">
      <div style="font-weight: 700; text-transform: uppercase;">Inversión Total:</div>
      <div class="total-val">${formatCurrency(total)}</div>
    </div>
  </div>

  <div class="terms">
    <strong>Condiciones Comerciales:</strong>
    <p>1. Esta propuesta tiene una vigencia de ${validityDays} días a partir de su emisión.</p>
    <p>2. Forma de pago convenida: 50% anticipo al iniciar desarrollo y 50% a la entrega / puesta en marcha.</p>
    <p>3. Incluye soporte técnico inicial y garantía de funcionamiento.</p>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Generador de Propuestas & Presupuestos" maxWidth={680}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={styles.label}>Cliente / Razón Social</Text>
            <TextInput style={styles.input} value={clientName} onChangeText={setClientName} placeholder="Ej. Restaurante El Bodegón C.A." placeholderTextColor={THEME.colors.textDim} />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>RIF / ID Fiscal</Text>
            <TextInput style={styles.input} value={clientRif} onChangeText={setClientRif} placeholder="J-12345678-0" placeholderTextColor={THEME.colors.textDim} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={styles.label}>Título del Proyecto</Text>
            <TextInput style={styles.input} value={projectName} onChangeText={setProjectName} placeholder="Ej. Sistema Maseasy" placeholderTextColor={THEME.colors.textDim} />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Vigencia (Días)</Text>
            <TextInput style={styles.input} value={validityDays} onChangeText={setValidityDays} keyboardType="numeric" placeholderTextColor={THEME.colors.textDim} />
          </View>
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.label}>Servicios y Conceptos Cotizados</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
              <Ionicons name="add-circle" size={14} color="#000" />
              <Text style={styles.addBtnText}>Agregar Ítem</Text>
            </TouchableOpacity>
          </View>

          {items.map((it, idx) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={styles.itemIdx}>{idx + 1}</Text>
              <TextInput style={[styles.input, { flex: 3 }]} value={it.desc} onChangeText={v => handleUpdateItem(it.id, 'desc', v)} placeholder="Descripción del servicio" placeholderTextColor={THEME.colors.textDim} />
              <TextInput style={[styles.input, { width: 85 }]} value={it.amount} onChangeText={v => handleUpdateItem(it.id, 'amount', v)} placeholder="Monto $" keyboardType="numeric" placeholderTextColor={THEME.colors.textDim} />
              <TouchableOpacity
                onPress={() => handleRemoveItem(it.id)}
                style={styles.delBtn}
                activeOpacity={0.7}
                title="Eliminar este ítem"
              >
                <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Presupuesto:</Text>
          <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
        </View>

        <TouchableOpacity style={styles.printBtn} onPress={handlePrintProposal} activeOpacity={0.8}>
          <Ionicons name="print" size={16} color="#000" />
          <Text style={styles.printBtnText}>Imprimir / Exportar Presupuesto PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 10 },
  label: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  formGroup: { gap: 4 },
  row: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: THEME.colors.bgDark, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.md, paddingHorizontal: 12, paddingVertical: 8, color: THEME.colors.textMain, fontSize: 13 },
  itemsSection: { gap: 8, backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: THEME.radius.sm },
  addBtnText: { color: '#000', fontSize: 11, fontWeight: '800' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemIdx: { color: THEME.colors.textDim, fontSize: 12, fontWeight: '800', width: 16 },
  delBtn: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingVertical: 6 },
  totalLabel: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '700' },
  totalVal: { color: THEME.colors.primary, fontSize: 18, fontWeight: '900' },
  printBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.primary, paddingVertical: 12, borderRadius: THEME.radius.md },
  printBtnText: { color: '#000000', fontSize: 13, fontWeight: '800' },
});
