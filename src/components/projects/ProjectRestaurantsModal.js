import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency } from '../../utils/formatters';

export const ProjectRestaurantsModal = ({ visible, onClose, project, restaurants = [], onSaveRestaurant, onDeleteRestaurant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [location, setLocation] = useState('');
  const [collectionDay, setCollectionDay] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');

  const totalRevenue = restaurants.reduce((sum, r) => sum + (Number(r.monthlyAmount) || 0), 0);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setRif('');
    setLocation('');
    setCollectionDay('');
    setMonthlyAmount('');
    setIsEditing(true);
  };

  const handleOpenEdit = (r) => {
    setEditId(r.id);
    setName(r.name || '');
    setRif(r.rif || '');
    setLocation(r.location || '');
    setCollectionDay(r.collectionDay || '');
    setMonthlyAmount(r.monthlyAmount ? String(r.monthlyAmount) : '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSaveRestaurant({
      id: editId,
      name: name.trim(),
      rif: rif.trim(),
      location: location.trim(),
      collectionDay: collectionDay.trim(),
      monthlyAmount: Number(monthlyAmount) || 0,
    });
    setIsEditing(false);
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title={`Restaurantes y Clientes: ${project?.name || ''}`} maxWidth={650}>
      <View style={styles.container}>
        {/* KPI Banner */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Total Locales</Text>
            <Text style={styles.kpiVal}>{restaurants.length}</Text>
          </View>
          <View style={[styles.kpiBox, { borderColor: THEME.colors.success }]}>
            <Text style={styles.kpiLabel}>Facturación Total Locales</Text>
            <Text style={[styles.kpiVal, { color: THEME.colors.success }]}>+{formatCurrency(totalRevenue)}/mes</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editId ? 'Editar Restaurante' : 'Nuevo Restaurante / Local'}</Text>
            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 2 }]}>
                <Text style={styles.label}>Nombre del Restaurante</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Pizzería Bella Vista" placeholderTextColor={THEME.colors.textDim} />
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text style={styles.label}>RIF / ID Fiscal</Text>
                <TextInput style={styles.input} value={rif} onChangeText={setRif} placeholder="J-12345678" placeholderTextColor={THEME.colors.textDim} />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Ubicación / Dirección</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ej. C.C. Tolón, Piso 2, Local 14" placeholderTextColor={THEME.colors.textDim} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text style={styles.label}>Días de Cobro</Text>
                <TextInput style={styles.input} value={collectionDay} onChangeText={setCollectionDay} placeholder="Ej. Día 15 y 30" placeholderTextColor={THEME.colors.textDim} />
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text style={styles.label}>Monto Mensual ($)</Text>
                <TextInput style={styles.input} value={monthlyAmount} onChangeText={setMonthlyAmount} placeholder="150" keyboardType="numeric" placeholderTextColor={THEME.colors.textDim} />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Guardar Local</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={styles.listHeader}>
              <Text style={styles.label}>Listado de Restaurantes ({restaurants.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
                <Ionicons name="add-circle" size={14} color="#000" />
                <Text style={styles.addBtnText}>Agregar Restaurante</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={true}>
              {restaurants.length > 0 ? (
                restaurants.map((r) => (
                  <View key={r.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemTitle}>{r.name}</Text>
                        {r.rif ? <Text style={styles.itemRif}>({r.rif})</Text> : null}
                      </View>
                      {r.location ? <Text style={styles.itemDetail}>📍 {r.location}</Text> : null}
                      {r.collectionDay ? <Text style={styles.itemDetail}>📅 Cobro: {r.collectionDay}</Text> : null}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.itemAmount}>+{formatCurrency(r.monthlyAmount)}</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity onPress={() => handleOpenEdit(r)} style={styles.actionIcon}>
                          <Ionicons name="pencil" size={13} color={THEME.colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteRestaurant(r.id)} style={styles.actionIcon}>
                          <Ionicons name="trash-outline" size={13} color={THEME.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay restaurantes registrados en este proyecto.</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiBox: { flex: 1, backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, borderWidth: 1, borderColor: THEME.colors.border },
  kpiLabel: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  kpiVal: { fontSize: 16, fontWeight: '900', marginTop: 2, color: THEME.colors.textMain },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: THEME.radius.sm },
  addBtnText: { color: '#000', fontSize: 11, fontWeight: '800' },
  listScroll: { maxHeight: 340 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, marginBottom: 6, borderWidth: 1, borderColor: THEME.colors.border },
  itemTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  itemRif: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  itemDetail: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 1 },
  itemAmount: { color: THEME.colors.success, fontSize: 14, fontWeight: '900' },
  actionIcon: { backgroundColor: THEME.colors.bgSurface, padding: 4, borderRadius: THEME.radius.sm },
  formCard: { backgroundColor: THEME.colors.bgDark, padding: 12, borderRadius: THEME.radius.md, gap: 8, borderWidth: 1, borderColor: THEME.colors.border },
  formTitle: { color: THEME.colors.primary, fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 8 },
  inputBox: { gap: 4 },
  input: { backgroundColor: THEME.colors.bgCard, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: THEME.radius.sm, paddingHorizontal: 10, paddingVertical: 6, color: THEME.colors.textMain, fontSize: 12 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.bgSurface },
  cancelBtnText: { color: THEME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: THEME.radius.sm, backgroundColor: THEME.colors.primary },
  saveBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  emptyText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic', paddingVertical: 8, textAlign: 'center' },
});
