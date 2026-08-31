import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ProfileAvatar } from './ProfileAvatar';

export const MAIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'payroll', label: 'Nómina', icon: 'cash-outline', activeIcon: 'cash' },
  { id: 'advances', label: 'Adelantos', icon: 'card-outline', activeIcon: 'card' },
  { id: 'employees', label: 'Empleados', icon: 'people-outline', activeIcon: 'people' },
  { id: 'projects', label: 'Proyectos', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { id: 'attendance', label: 'Asistencia', icon: 'time-outline', activeIcon: 'time' },
  { id: 'finances', label: 'Finanzas', icon: 'wallet-outline', activeIcon: 'wallet' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'rules', label: 'Reglas', icon: 'document-text-outline', activeIcon: 'document-text' },
];

export const NAV_ITEMS = [
  ...MAIN_NAV_ITEMS,
  { id: 'settings', label: 'Configuración', icon: 'settings-outline', activeIcon: 'settings' },
];

export const DesktopSidebar = ({ currentTab, onSelectTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <View style={[styles.sidebar, isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]}>
      {/* Brand Header */}
      <View style={styles.brand}>
        <View style={styles.logoWrapper}>
          <ProfileAvatar
            size={isCollapsed ? 38 : 48}
            onPressCustom={() => setIsCollapsed(!isCollapsed)}
            showBadge={false}
          />
        </View>
        {!isCollapsed && (
          <View style={styles.brandTitleBox}>
            <Text style={styles.brandTitle}>COTUFAS</Text>
            <Text style={styles.brandSub}>System v2.0</Text>
          </View>
        )}
      </View>

      {/* Main Nav Items */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.sidebarNav, isCollapsed && styles.sidebarNavCollapsed]}>
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.sidebarItem, isCollapsed && styles.sidebarItemCollapsed, isActive && styles.sidebarItemActive]}
              onPress={() => onSelectTab(item.id)}
              activeOpacity={0.8}
              title={item.label}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={19}
                color={isActive ? "#ffffff" : "#94a3b8"}
              />
              {!isCollapsed && (
                <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]} numberOfLines={1}>
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Separated Settings Button at bottom */}
      <View style={[styles.bottomSection, isCollapsed && styles.bottomSectionCollapsed]}>
        <TouchableOpacity
          style={[styles.sidebarItem, styles.settingsItem, isCollapsed && styles.sidebarItemCollapsed, currentTab === 'settings' && styles.sidebarItemActive]}
          onPress={() => onSelectTab('settings')}
          activeOpacity={0.8}
          title="Configuración"
        >
          <Ionicons
            name={currentTab === 'settings' ? "settings" : "settings-outline"}
            size={19}
            color={currentTab === 'settings' ? "#ffffff" : "#94a3b8"}
          />
          {!isCollapsed && (
            <Text style={[styles.sidebarLabel, currentTab === 'settings' && styles.sidebarLabelActive]} numberOfLines={1}>
              Configuración
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: { backgroundColor: '#0f172a', borderRightWidth: 1, borderRightColor: '#1e293b', paddingVertical: 14, height: '100%', justifyContent: 'space-between' },
  sidebarExpanded: { width: 230 },
  sidebarCollapsed: { width: 68, alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b', gap: 10 },
  logoWrapper: { padding: 2, backgroundColor: '#ffffff', borderRadius: 9999, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  brandTitleBox: { flex: 1 },
  brandTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  brandSub: { color: '#60a5fa', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  sidebarNav: { paddingHorizontal: 12, gap: 4 },
  sidebarNavCollapsed: { paddingHorizontal: 6, alignItems: 'center' },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, gap: 11, backgroundColor: 'transparent' },
  sidebarItemCollapsed: { paddingHorizontal: 10, paddingVertical: 9, justifyContent: 'center', gap: 0 },
  sidebarItemActive: { backgroundColor: THEME.colors.primary, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  sidebarLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  sidebarLabelActive: { color: '#ffffff', fontWeight: '900' },
  bottomSection: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1e293b' },
  bottomSectionCollapsed: { paddingHorizontal: 6, alignItems: 'center' },
  settingsItem: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
});
