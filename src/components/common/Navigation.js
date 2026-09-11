import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ProfileAvatar } from './ProfileAvatar';

export const MAIN_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Panel',
    icon: 'grid-outline',
    activeIcon: 'grid',
    tagline: 'Resumen gerencial y KPIs en tiempo real',
    columns: [
      {
        title: 'MÉTRICAS CLAVE',
        items: ['Ingresos del Mes', 'Costo de Nómina', 'Balance Estimado']
      },
      {
        title: 'ACCIONES RÁPIDAS',
        items: ['Calcular Quincena', 'Ver Alertas', 'Accesos Directos']
      }
    ]
  },
  {
    id: 'payroll',
    label: 'Nómina',
    icon: 'cash-outline',
    activeIcon: 'cash',
    tagline: 'Cálculo quincenal y liquidaciones',
    columns: [
      {
        title: 'GESTIÓN DE PAGOS',
        items: ['Reparto Quincenal', 'Pago por Binance', 'Comprobantes WhatsApp']
      },
      {
        title: 'EXTRAS & BONOS',
        items: ['Bonos por Rendimiento', 'Descuento de Adelantos', 'Historial Pagado']
      }
    ]
  },
  {
    id: 'advances',
    label: 'Adelantos',
    icon: 'card-outline',
    activeIcon: 'card',
    tagline: 'Control de préstamos y anticipos',
    columns: [
      {
        title: 'SOLICITUDES',
        items: ['Nuevo Adelanto', 'Límite Permitido', 'Saldos Pendientes']
      },
      {
        title: 'DEDUCCIONES',
        items: ['Amortización en Nómina', 'Historial de Préstamos']
      }
    ]
  },
  {
    id: 'employees',
    label: 'Empleados',
    icon: 'people-outline',
    activeIcon: 'people',
    tagline: 'Directorio de colaboradores y méritos',
    columns: [
      {
        title: 'PERSONAL',
        items: ['Lista de Empleados', 'Ficha & Documentos', 'Horarios & Roles']
      },
      {
        title: 'DESEMPEÑO',
        items: ['🏆 Empleado del Mes', 'Ranking de Puntos', 'Puntos Extra']
      }
    ]
  },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: 'briefcase-outline',
    activeIcon: 'briefcase',
    tagline: 'Clientes, marcas y contratos activos',
    columns: [
      {
        title: 'PORTAFOLIO',
        items: ['Proyectos Activos', 'Recaudación Mensual', 'Tarifas Acordadas']
      },
      {
        title: 'OPERACIONES',
        items: ['Locales & Clientes', 'Equipo Asignado']
      }
    ]
  },
  {
    id: 'attendance',
    label: 'Asistencia',
    icon: 'time-outline',
    activeIcon: 'time',
    tagline: 'Puntualidad, permisos y retardos',
    columns: [
      {
        title: 'CONTROL DIARIO',
        items: ['Asistencia de Hoy', 'Llegadas Tarde', 'Validación Admin']
      },
      {
        title: 'REPORTES',
        items: ['Permisos Especiales', 'Historial Mensual']
      }
    ]
  },
  {
    id: 'finances',
    label: 'Finanzas',
    icon: 'wallet-outline',
    activeIcon: 'wallet',
    tagline: 'Ingresos extras, pasivos y cobranzas',
    columns: [
      {
        title: 'FLUJO DE CAJA',
        items: ['Ingresos Extra', 'Cuentas por Pagar', 'Cuentas por Cobrar']
      },
      {
        title: 'AUDITORÍA',
        items: ['Balance Neto', 'Reporte Detallado']
      }
    ]
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
    tagline: 'Citas, reuniones y pipeline comercial',
    columns: [
      {
        title: 'CALENDARIO',
        items: ['Citas del Día', 'Reuniones de Mañana', 'Recordatorios Automáticos']
      },
      {
        title: 'NEGOCIACIONES',
        items: ['Tratos en Curso', 'Negociaciones Ganadas', 'Monto en Pipeline']
      }
    ]
  },
  {
    id: 'rules',
    label: 'Reglas',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
    tagline: 'Normativas internas y documentación legal',
    columns: [
      {
        title: 'DOCUMENTOS',
        items: ['Reglamento Interno', 'Políticas de Puntualidad', 'Exportar PDF']
      }
    ]
  },
];

export const NAV_ITEMS = [
  ...MAIN_NAV_ITEMS,
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings-outline',
    activeIcon: 'settings',
    tagline: 'Seguridad, temas y personalización',
    columns: [
      {
        title: 'SISTEMA',
        items: ['Modo Oscuro / Claro', 'Cambiar PIN Admin', 'Sincronización Firebase']
      }
    ]
  },
];

export const DesktopSidebar = ({ currentTab, onSelectTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <View
      style={[styles.sidebar, isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]}
      onMouseLeave={() => setHoveredItem(null)}
    >
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
          const isHovered = hoveredItem?.id === item.id;

          return (
            <View
              key={item.id}
              style={styles.navItemWrapper}
              onMouseEnter={() => setHoveredItem(item)}
            >
              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  isCollapsed && styles.sidebarItemCollapsed,
                  isActive && styles.sidebarItemActive,
                  isHovered && !isActive && styles.sidebarItemHovered,
                ]}
                onPress={() => {
                  onSelectTab(item.id);
                  setHoveredItem(null);
                }}
                activeOpacity={0.85}
                title={item.label}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={19}
                  color={isActive ? "#ffffff" : isHovered ? THEME.colors.primaryLight : "#94a3b8"}
                />
                {!isCollapsed && (
                  <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive, isHovered && !isActive && styles.sidebarLabelHovered]} numberOfLines={1}>
                    {item.label}
                  </Text>
                )}
                {!isCollapsed && isHovered && (
                  <Ionicons name="chevron-forward" size={13} color="#60a5fa" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Separated Settings Button at bottom */}
      <View
        style={[styles.bottomSection, isCollapsed && styles.bottomSectionCollapsed]}
        onMouseEnter={() => setHoveredItem(NAV_ITEMS.find(n => n.id === 'settings'))}
      >
        <TouchableOpacity
          style={[styles.sidebarItem, styles.settingsItem, isCollapsed && styles.sidebarItemCollapsed, currentTab === 'settings' && styles.sidebarItemActive]}
          onPress={() => {
            onSelectTab('settings');
            setHoveredItem(null);
          }}
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

      {/* Motion-style Staggered Flyout Menu Preview on Hover */}
      {hoveredItem && (
        <View style={[styles.motionFlyout, isCollapsed ? styles.motionFlyoutCollapsed : styles.motionFlyoutExpanded]}>
          <View style={styles.flyoutHeader}>
            <View style={styles.flyoutIconBox}>
              <Ionicons name={hoveredItem.activeIcon || hoveredItem.icon} size={18} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.flyoutTitle}>{hoveredItem.label}</Text>
              <Text style={styles.flyoutTagline}>{hoveredItem.tagline}</Text>
            </View>
          </View>

          <View style={styles.flyoutDivider} />

          <View style={styles.columnsContainer}>
            {(hoveredItem.columns || []).map((col, colIdx) => (
              <View key={colIdx} style={styles.flyoutColumn}>
                <Text style={styles.columnTitle}>{col.title}</Text>
                <View style={styles.columnItemsList}>
                  {col.items.map((subItem, itemIdx) => (
                    <TouchableOpacity
                      key={itemIdx}
                      style={styles.columnItemBtn}
                      onPress={() => {
                        onSelectTab(hoveredItem.id);
                        setHoveredItem(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.bulletDot} />
                      <Text style={styles.columnItemText}>{subItem}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.flyoutEnterBtn}
            onPress={() => {
              onSelectTab(hoveredItem.id);
              setHoveredItem(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.flyoutEnterText}>Abrir {hoveredItem.label}</Text>
            <Ionicons name="arrow-forward" size={13} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#0b1120',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    paddingVertical: 14,
    height: '100%',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1000,
  },
  sidebarExpanded: { width: 230 },
  sidebarCollapsed: { width: 68, alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b', gap: 10 },
  logoWrapper: { padding: 2, backgroundColor: '#ffffff', borderRadius: 9999, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  brandTitleBox: { flex: 1 },
  brandTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  brandSub: { color: '#60a5fa', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  sidebarNav: { paddingHorizontal: 12, gap: 4 },
  sidebarNavCollapsed: { paddingHorizontal: 6, alignItems: 'center' },
  navItemWrapper: { position: 'relative' },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, gap: 11, backgroundColor: 'transparent' },
  sidebarItemCollapsed: { paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'center', gap: 0 },
  sidebarItemHovered: { backgroundColor: 'rgba(30, 41, 59, 0.7)' },
  sidebarItemActive: { backgroundColor: THEME.colors.primary, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  sidebarLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  sidebarLabelHovered: { color: '#f8fafc' },
  sidebarLabelActive: { color: '#ffffff', fontWeight: '900' },
  bottomSection: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1e293b' },
  bottomSectionCollapsed: { paddingHorizontal: 6, alignItems: 'center' },
  settingsItem: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },

  /* Motion Staggered Flyout Menu */
  motionFlyout: {
    position: 'absolute',
    top: 20,
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    padding: 20,
    width: 380,
    shadowColor: '#000000',
    shadowOffset: { width: 12, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 25,
    zIndex: 9999,
  },
  motionFlyoutExpanded: { left: 236 },
  motionFlyoutCollapsed: { left: 74 },
  flyoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flyoutIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.4, shadowRadius: 8 },
  flyoutTitle: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  flyoutTagline: { color: '#94a3b8', fontSize: 11, fontWeight: '500', marginTop: 2 },
  flyoutDivider: { height: 1, backgroundColor: '#1e293b', marginVertical: 14 },
  columnsContainer: { flexDirection: 'row', gap: 18 },
  flyoutColumn: { flex: 1, gap: 8 },
  columnTitle: { color: '#60a5fa', fontSize: 10, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  columnItemsList: { gap: 6 },
  columnItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#334155' },
  columnItemText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  flyoutEnterBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.4)', paddingVertical: 8, borderRadius: 10 },
  flyoutEnterText: { color: '#60a5fa', fontSize: 11.5, fontWeight: '800' },
});
