import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { RuleModal } from '../components/rules/RuleModal';
import { ContractGeneratorModal } from '../components/rules/ContractGeneratorModal';
import { ProposalGeneratorModal } from '../components/rules/ProposalGeneratorModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { useApp } from '../context/AppContext';
import { COTUFAS_LOGO_DATA_URL } from '../constants/logoDataUri';

export const RulesScreen = () => {
  const { rules, employees, saveRule, deleteRule, profileImage } = useApp();
  const [editingRule, setEditingRule] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const generatePlainText = () => {
    let text = `📜 *CÓDIGO DE ÉTICA Y REGLAMENTO INTERNO - COTUFAS SYSTEM*\n`;
    text += `Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    rules.forEach((r, idx) => { text += `*${r.title}*\n${r.description}\n\n`; });
    text += `------------------------------------\nAtentamente,\nDirección General y Administración - Cotufas System.`;
    return text;
  };

  const handleCopyForWhatsApp = () => {
    const text = generatePlainText();
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } else {
      Alert.alert('Copiado', 'Reglamento copiado al portapapeles.');
    }
  };

  const handlePrintFormalPdf = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const effectiveLogo = profileImage || COTUFAS_LOGO_DATA_URL;
    const logoHtml = effectiveLogo ? `<img src="${effectiveLogo}" alt="Logo" style="max-height: 60px; max-width: 140px; object-fit: contain; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto;" />` : '';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reglamento Interno de Trabajo - Cotufas System</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Georgia", "Times New Roman", serif; color: #0f172a; }
    body { padding: 40px; font-size: 12px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #2563eb; margin-top: 4px; }
    .meta { font-size: 11px; color: #64748b; margin-top: 4px; font-style: italic; }
    .intro { margin-bottom: 20px; text-align: justify; font-size: 12px; }
    .article { margin-bottom: 16px; text-align: justify; }
    .article-title { font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
    .article-body { font-size: 12px; color: #334155; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; page-break-inside: avoid; }
    .sig-box { width: 42%; text-align: center; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 11px; }
    @media print { body { padding: 10mm; } @page { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <div class="brand">COTUFAS SYSTEM</div>
    <div class="doc-title">CÓDIGO DE ÉTICA, CONDUCTA Y REGLAMENTO INTERNO DE TRABAJO</div>
    <div class="meta">Documento Oficial de Cumplimiento Obligatorio • Vigente al ${today}</div>
  </div>
  <div class="intro">
    El presente Reglamento Interno tiene por objeto regular las condiciones laborales, compromisos de calidad, normativas de confidencialidad y responsabilidades operativas de todo el personal que presta servicios en <strong>Cotufas System</strong>. Su cumplimiento es obligatorio para todos los colaboradores.
  </div>
  ${rules.map((r) => `
    <div class="article">
      <div class="article-title">${r.title}</div>
      <div class="article-body">${r.description}</div>
    </div>
  `).join('')}
  <div class="signatures">
    <div class="sig-box">
      <strong>POR COTUFAS SYSTEM</strong><br/>
      Dirección General & Administración<br/>
      Firma y Sello Oficial
    </div>
    <div class="sig-box">
      <strong>CONFORMIDAD DEL COLABORADOR</strong><br/>
      Nombre: _______________________________<br/>
      C.I.: __________________ Fecha: _________
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.docButtons}>
          <TouchableOpacity style={styles.actionBtnContract} onPress={() => setIsContractOpen(true)} activeOpacity={0.8}>
            <Ionicons name="document-text" size={14} color="#ffffff" />
            <Text style={styles.actionBtnTextLight}>Contrato de Trabajo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnProposal} onPress={() => setIsProposalOpen(true)} activeOpacity={0.8}>
            <Ionicons name="briefcase" size={14} color="#ffffff" />
            <Text style={styles.actionBtnTextLight}>Propuesta / Presupuesto</Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton title="Nuevo Artículo" icon="add-circle" onPress={() => setIsAddModalOpen(true)} small />
      </View>

      <Card style={styles.formalBanner}>
        <View style={styles.formalHeaderRow}>
          <View style={styles.coatBadge}>
            <Ionicons name="ribbon" size={20} color={THEME.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.formalTitle}>CÓDIGO DE ÉTICA Y REGLAMENTO INTERNO</Text>
            <Text style={styles.formalSub}>Cotufas System • Normativa Legal y Operativa de Cumplimiento Obligatorio</Text>
          </View>
        </View>
        <View style={styles.exportButtons}>
          <PrimaryButton title={copySuccess ? "¡Copiado a Portapapeles!" : "Copiar Formato (WhatsApp/Word)"} icon="logo-whatsapp" variant="success" onPress={handleCopyForWhatsApp} style={{ flex: 1 }} />
          {Platform.OS === 'web' && (
            <PrimaryButton title="Imprimir Reglamento PDF" icon="print-outline" variant="secondary" onPress={handlePrintFormalPdf} />
          )}
        </View>
      </Card>

      <Card title={`Artículos y Normativas Legales (${rules.length})`} icon="shield-checkmark-outline">
        {rules.map((rule, idx) => (
          <View key={rule.id} style={styles.ruleItem}>
            <View style={styles.ruleHeader}>
              <View style={styles.ruleNumBadge}><Text style={styles.ruleNumText}>§ {idx + 1}</Text></View>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <View style={styles.ruleActions}>
                <TouchableOpacity onPress={() => setEditingRule(rule)} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={14} color={THEME.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeletingRuleId(rule.id)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={14} color={THEME.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.ruleDesc}>{rule.description}</Text>
          </View>
        ))}
      </Card>

      <RuleModal visible={Boolean(editingRule || isAddModalOpen)} rule={editingRule} onClose={() => { setEditingRule(null); setIsAddModalOpen(false); }} onSave={saveRule} />
      <ContractGeneratorModal visible={isContractOpen} onClose={() => setIsContractOpen(false)} employees={employees} />
      <ProposalGeneratorModal visible={isProposalOpen} onClose={() => setIsProposalOpen(false)} />
      <PinConfirmModal visible={Boolean(deletingRuleId)} onClose={() => setDeletingRuleId(null)} onConfirm={() => { if (deletingRuleId) deleteRule(deletingRuleId); }} title="Eliminar Artículo" description="Este artículo legal será removido del reglamento permanente." />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  docButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtnContract: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: THEME.radius.md },
  actionBtnProposal: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: THEME.colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: THEME.radius.md },
  actionBtnTextLight: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  formalBanner: { backgroundColor: 'rgba(37, 99, 235, 0.08)', marginBottom: 0, gap: 10, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  formalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coatBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: THEME.colors.primary },
  formalTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  formalSub: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 2 },
  exportButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ruleItem: { backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: 14, borderRadius: THEME.radius.md, marginBottom: 8, gap: 6, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.18)' },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleNumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },
  ruleNumText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  ruleTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800', flex: 1 },
  ruleActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { backgroundColor: '#ffffff', padding: 6, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  ruleDesc: { color: THEME.colors.textMuted, fontSize: 12, lineHeight: 19, textAlign: 'justify', marginTop: 2 },
});
