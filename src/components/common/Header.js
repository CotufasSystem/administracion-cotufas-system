import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { NAV_ITEMS } from './Navigation';
import { useApp } from '../../context/AppContext';

export const Header = ({ title, subtitle, currentTab, onSelectTab }) => {
  const { logout, themeMode, toggleThemeMode } = useApp();
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMobile = width < 768;
  const isSmall = width < 480;

  const handleSelectSection = (id) => {
    if (onSelectTab) onSelectTab(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.titleContainer}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={13} color={THEME.colors.primary} />
            <Text style={styles.badgeText}>ADMINISTRADOR • COTUFAS SYSTEM</Text>
          </View>
          <Text style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={1}>{title}</Text>
          {subtitle && !isSmall ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.headerRight}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <TouchableOpacity style={styles.mobileMenuBtn} onPress={() => setIsMenuOpen(true)} activeOpacity={0.7}>
              <Ionicons name="apps" size={17} color={THEME.colors.primary} />
              <Text style={styles.mobileMenuBtnText}>Menú</Text>
            </TouchableOpacity>
          )}

          {/* Lock / Logout Button */}
          <TouchableOpacity style={[styles.logoutBtn, isSmall && styles.logoutBtnSmall]} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="lock-closed" size={14} color={THEME.colors.danger} />
            {!isSmall && <Text style={styles.logoutText}>Bloquear</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Navigation Grid Modal */}
      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="grid" size={18} color={THEME.colors.primary} />
                <Text style={styles.modalTitle}>Menú de Secciones ({NAV_ITEMS.length})</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {NAV_ITEMS.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <TouchableOpacity key={item.id} style={[styles.gridItem, isActive && styles.gridItemActive]} onPress={() => handleSelectSection(item.id)} activeOpacity={0.7}>
                    <View style={[styles.gridIconBox, isActive && styles.gridIconBoxActive]}>
                      <Ionicons name={isActive ? item.activeIcon : item.icon} size={18} color={isActive ? '#ffffff' : THEME.colors.primary} />
                    </View>
                    <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 8 },
  headerMobile: { paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.sm },
  titleContainer: { flex: 1, minWidth: 90 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  badgeText: { color: THEME.colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: THEME.colors.textMain, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  titleSmall: { fontSize: 15 },
  subtitle: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeBtn: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  mobileMenuBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(37, 99, 235, 0.08)', borderWidth: 1, borderColor: THEME.colors.primary, paddingHorizontal: 9, paddingVertical: 6, borderRadius: THEME.radius.sm },
  mobileMenuBtnText: { color: THEME.colors.primary, fontSize: 12, fontWeight: '800' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, gap: 5 },
  logoutBtnSmall: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { color: THEME.colors.danger, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10, marginBottom: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalTitle: { color: THEME.colors.textMain, fontSize: 15, fontWeight: '800' },
  modalCloseBtn: { padding: 4 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 10, borderRadius: 10 },
  gridItemActive: { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.primary },
  gridIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  gridIconBoxActive: { backgroundColor: THEME.colors.primaryDark, borderColor: THEME.colors.primaryDark },
  gridLabel: { color: THEME.colors.textMain, fontSize: 12, fontWeight: '700', flex: 1 },
  gridLabelActive: { color: '#ffffff', fontWeight: '800' },
});
