import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ModalWrapper } from '../common/UIComponents';
import { formatCurrency } from '../../utils/formatters';
import { EditIcon, TrashIcon, SearchIcon, CloseIcon, AddIcon, WhatsAppIcon } from '../common/AppIcons';
import { RestaurantWhatsAppModal } from './RestaurantWhatsAppModal';

export const ProjectRestaurantsModal = ({ visible, onClose, project, restaurants = [], onSaveRestaurant, onDeleteRestaurant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [collectionDay, setCollectionDay] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappTarget, setWhatsappTarget] = useState(null);

  const totalRevenue = restaurants.reduce((sum, r) => sum + (Number(r.monthlyAmount) || 0), 0);

  // Ordenar alfabéticamente A-Z y filtrar por búsqueda
  const sortedAndFilteredRestaurants = useMemo(() => {
    const sorted = [...restaurants].sort((a, b) => {
      const nameA = (a.name || '').trim().toLowerCase();
      const nameB = (b.name || '').trim().toLowerCase();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });

    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter((r) =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.rif && r.rif.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q))
    );
  }, [restaurants, searchQuery]);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setRif('');
    setPhone('');
    setLocation('');
    setCollectionDay('');
    setMonthlyAmount('');
    setIsEditing(true);
  };

  const handleOpenEdit = (r) => {
    setEditId(r.id);
    setName(r.name || '');
    setRif(r.rif || '');
    setPhone(r.phone || '');
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
      phone: phone.trim(),
      location: location.trim(),
      collectionDay: collectionDay.trim(),
      monthlyAmount: Number(monthlyAmount) || 0,
    });
    setIsEditing(false);
  };

  const handleSavePhone = (restId, newPhone) => {
    const target = restaurants.find((r) => r.id === restId);
    if (target) {
      onSaveRestaurant({ ...target, phone: newPhone });
    }
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
                <Text style={styles.label}>Teléfono / WhatsApp</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="0412-1234567" keyboardType="phone-pad" placeholderTextColor={THEME.colors.textDim} />
              </View>
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
              <Text style={styles.label}>
                Listado de Restaurantes ({sortedAndFilteredRestaurants.length}
                {searchQuery.trim() ? ` de ${restaurants.length}` : ''})
              </Text>
              <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
                <AddIcon size={14} color="#000" />
                <Text style={styles.addBtnText}>Agregar Restaurante</Text>
              </TouchableOpacity>
            </View>

            {/* Buscador de Restaurante */}
            <View style={styles.searchBar}>
              <SearchIcon size={14} color={THEME.colors.textDim} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar restaurante por nombre, RIF o ubicación..."
                placeholderTextColor={THEME.colors.textDim}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {Boolean(searchQuery) && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <CloseIcon size={15} color={THEME.colors.textDim} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={true}>
              {sortedAndFilteredRestaurants.length > 0 ? (
                sortedAndFilteredRestaurants.map((r) => (
                  <View key={r.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemTitle}>{r.name}</Text>
                        {r.rif ? <Text style={styles.itemRif}>({r.rif})</Text> : null}
                      </View>
                      {r.location ? <Text style={styles.itemDetail}>📍 {r.location}</Text> : null}
                      {r.phone ? <Text style={styles.itemPhone}>📱 WhatsApp: {r.phone}</Text> : null}
                      {r.collectionDay ? <Text style={styles.itemDetail}>📅 Cobro: {r.collectionDay}</Text> : null}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.itemAmount}>+{formatCurrency(r.monthlyAmount)}</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity onPress={() => setWhatsappTarget(r)} style={styles.whatsappBtn} activeOpacity={0.7} title="Enviar aviso WhatsApp">
                          <WhatsAppIcon size={14} color="#25D366" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenEdit(r)} style={styles.editBtn} activeOpacity={0.7} title="Editar">
                          <EditIcon size={14} color={THEME.colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteRestaurant(r.id)} style={styles.deleteBtn} activeOpacity={0.7} title="Eliminar">
                          <TrashIcon size={14} color={THEME.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? `No se encontraron locales para "${searchQuery}".`
                    : 'No hay restaurantes registrados en este proyecto.'}
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <RestaurantWhatsAppModal
        visible={Boolean(whatsappTarget)}
        restaurant={whatsappTarget}
        onClose={() => setWhatsappTarget(null)}
        onSavePhone={handleSavePhone}
      />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgDark,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    color: THEME.colors.textMain,
    fontSize: 12,
    paddingVertical: 0,
    outlineStyle: 'none',
  },
  listScroll: { maxHeight: 340 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.colors.bgDark, padding: 10, borderRadius: THEME.radius.md, marginBottom: 6, borderWidth: 1, borderColor: THEME.colors.border },
  itemTitle: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '800' },
  itemRif: { color: THEME.colors.primary, fontSize: 11, fontWeight: '700' },
  itemDetail: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 1 },
  itemPhone: { color: THEME.colors.primary, fontSize: 11, marginTop: 1, fontWeight: '600' },
  whatsappBtn: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    padding: 6,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    padding: 6,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: 6,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  emptyText: { color: THEME.colors.textDim, fontSize: 12, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center' },
});
