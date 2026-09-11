import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { MAIN_NAV_ITEMS } from './Navigation';
import { COTUFAS_LOGO } from '../../constants/assets';

export const HeaderMobileMenuModal = ({ visible, onClose, currentTab, onSelectSection }) => {
  const [expandedSectionId, setExpandedSectionId] = React.useState(null);

  const toggleSection = (id) => {
    setExpandedSectionId(expandedSectionId === id ? null : id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Backdrop clickable to close */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        {/* Sidebar Drawer sliding in from the left */}
        <View style={styles.drawerCard}>
          {/* Drawer Header with Cotufas System Logo */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Image source={COTUFAS_LOGO} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.brandTitle}>COTUFAS</Text>
                <Text style={styles.brandSub}>System v2.0</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.drawerCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items List */}
          <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>MÓDULOS PRINCIPALES</Text>
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              const isExpanded = expandedSectionId === item.id;

              return (
                <View key={item.id} style={styles.mobileItemContainer}>
                  <View style={[styles.drawerItemRow, isActive && styles.drawerItemActive]}>
                    <TouchableOpacity
                      style={styles.drawerItemMain}
                      onPress={() => onSelectSection(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.itemIconBox, isActive && styles.itemIconBoxActive]}>
                        <Ionicons
                          name={isActive ? item.activeIcon : item.icon}
                          size={18}
                          color={isActive ? '#ffffff' : THEME.colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                          {item.label}
                        </Text>
                        <Text style={styles.mobileItemTagline} numberOfLines={1}>
                          {item.tagline}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.expandChevronBtn}
                      onPress={() => toggleSection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={isActive ? THEME.colors.primary : "#64748b"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Motion Accordion Dropdown preview */}
                  {isExpanded && (
                    <View style={styles.mobileSubDropdown}>
                      {(item.columns || []).map((col, idx) => (
                        <View key={idx} style={styles.mobileSubCol}>
                          <Text style={styles.mobileColTitle}>{col.title}</Text>
                          {col.items.map((sub, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              style={styles.mobileSubItemBtn}
                              onPress={() => onSelectSection(item.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.mobileBullet} />
                              <Text style={styles.mobileSubItemText}>{sub}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Settings Button */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={[styles.drawerItem, currentTab === 'settings' && styles.drawerItemActive]}
              onPress={() => onSelectSection('settings')}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, currentTab === 'settings' && styles.itemIconBoxActive]}>
                <Ionicons
                  name={currentTab === 'settings' ? 'settings' : 'settings-outline'}
                  size={18}
                  color={currentTab === 'settings' ? '#ffffff' : '#64748b'}
                />
              </View>
              <Text style={[styles.itemLabel, currentTab === 'settings' && styles.itemLabelActive]}>
                Configuración
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerCard: {
    width: 295,
    maxWidth: '85%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerList: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 5,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    backgroundColor: 'transparent',
  },
  drawerItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  itemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconBoxActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  itemLabel: {
    flex: 1,
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  itemLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '900',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
  drawerFooter: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  mobileItemContainer: {
    gap: 2,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  drawerItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  mobileItemTagline: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  expandChevronBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
    marginRight: 6,
  },
  mobileSubDropdown: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginLeft: 12,
    marginRight: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mobileSubCol: {
    gap: 4,
  },
  mobileColTitle: {
    color: THEME.colors.primary,
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mobileSubItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  mobileBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
  },
  mobileSubItemText: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
