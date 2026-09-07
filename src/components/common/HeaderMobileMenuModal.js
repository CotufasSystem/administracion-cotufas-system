import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { NAV_ITEMS } from './Navigation';

export const HeaderMobileMenuModal = ({ visible, onClose, currentTab, onSelectSection }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="grid" size={18} color={THEME.colors.primary} />
              <Text style={styles.modalTitle}>Menú de Secciones ({NAV_ITEMS.length})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.gridItem, isActive && styles.gridItemActive]}
                  onPress={() => onSelectSection(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.gridIconBox, isActive && styles.gridIconBoxActive]}>
                    <Ionicons
                      name={isActive ? item.activeIcon : item.icon}
                      size={18}
                      color={isActive ? '#ffffff' : THEME.colors.primary}
                    />
                  </View>
                  <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: '#ffffff', borderRadius: THEME.radius.lg, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.25)', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(37, 99, 235, 0.15)' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { color: THEME.colors.textMain, fontSize: 14, fontWeight: '800' },
  modalCloseBtn: { padding: 4 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  gridItem: { width: '31%', minWidth: 90, backgroundColor: '#f8fafc', padding: 10, borderRadius: THEME.radius.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: THEME.colors.border },
  gridItemActive: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: THEME.colors.primary },
  gridIconBox: { width: 34, height: 34, borderRadius: THEME.radius.sm, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center' },
  gridIconBoxActive: { backgroundColor: THEME.colors.primary },
  gridLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  gridLabelActive: { color: THEME.colors.primaryDark, fontWeight: '800' },
});
