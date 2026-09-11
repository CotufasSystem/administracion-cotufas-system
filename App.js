import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { getTheme } from './src/constants/theme';
import { Header } from './src/components/common/Header';
import { DesktopSidebar } from './src/components/common/Navigation';

// Screens
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PayrollScreen } from './src/screens/PayrollScreen';
import { AdvancesScreen } from './src/screens/AdvancesScreen';
import { EmployeesScreen } from './src/screens/EmployeesScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { FinanceScreen } from './src/screens/FinanceScreen';
import { AgendaScreen } from './src/screens/AgendaScreen';
import { RulesScreen } from './src/screens/RulesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useBadgeSync } from './src/hooks/useBadgeSync';

const INJECTED_HOVER_STYLES = `
  /* Framer Motion micro-interactions across ALL buttons */
  [role="button"], 
  button, 
  a, 
  .r-1loqt21,
  [data-focusable="true"],
  [style*="cursor: pointer"],
  [style*="cursor:pointer"] {
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), 
                box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), 
                background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                filter 0.2s ease !important;
    cursor: pointer !important;
  }
  
  /* Elevating upward movement and slight spring scale on hover */
  [role="button"]:hover, 
  button:hover, 
  a:hover, 
  .r-1loqt21:hover,
  [data-focusable="true"]:hover,
  [style*="cursor: pointer"]:hover,
  [style*="cursor:pointer"]:hover {
    transform: translateY(-2.5px) scale(1.02) !important;
    filter: brightness(1.05);
  }

  /* Tactile spring press feedback when clicked */
  [role="button"]:active, 
  button:active, 
  a:active, 
  .r-1loqt21:active,
  [data-focusable="true"]:active,
  [style*="cursor: pointer"]:active,
  [style*="cursor:pointer"]:active {
    transform: translateY(1px) scale(0.96) !important;
    transition-duration: 0.08s !important;
  }

  /* Prevent transform compounding inside nested buttons */
  [role="button"] [role="button"],
  .r-1loqt21 .r-1loqt21 {
    transform: none !important;
  }
`;

const MainLayout = () => {
  const { isAuthenticated, isLoaded, themeMode } = useApp();
  useBadgeSync(); // Sincroniza el globo del icono automáticamente en tiempo real
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const currentTheme = getTheme(themeMode);

  // Inject motion micro-interaction styles directly into DOM for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'cotufas-motion-interactions';
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.type = 'text/css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = INJECTED_HOVER_STYLES;
    }
  }, []);

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.bgDark }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const getScreenTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Panel Principal';
      case 'payroll': return 'Nómina & Reparto Inteligente';
      case 'advances': return 'Control de Adelantos de Sueldo';
      case 'employees': return 'Directorio de Empleados';
      case 'projects': return 'Proyectos de la Empresa & Clientes';
      case 'attendance': return 'Asistencia & Horarios';
      case 'finances': return 'Finanzas, Ingresos & Deudas';
      case 'agenda': return 'Agenda & Negociaciones';
      case 'rules': return 'Reglamento & Documentación Legal';
      case 'settings': return 'Configuración & Seguridad';
      default: return 'Cotufas System';
    }
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard': return <DashboardScreen onNavigate={setCurrentTab} />;
      case 'payroll': return <PayrollScreen />;
      case 'advances': return <AdvancesScreen />;
      case 'employees': return <EmployeesScreen />;
      case 'projects': return <ProjectsScreen />;
      case 'attendance': return <AttendanceScreen />;
      case 'finances': return <FinanceScreen />;
      case 'agenda': return <AgendaScreen />;
      case 'rules': return <RulesScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <DashboardScreen onNavigate={setCurrentTab} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.bgDark }]}>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} backgroundColor={currentTheme.colors.bgDark} />
      <View style={[styles.mainContainer, { backgroundColor: currentTheme.colors.bgDark }]}>
        {isDesktop && <DesktopSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />}

        <View style={[styles.contentArea, { backgroundColor: currentTheme.colors.bgDark }]}>
          <Header
            title={getScreenTitle()}
            subtitle="Cotufas System • Control Total"
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
          />
          <View style={styles.screenWrapper}>
            {renderActiveScreen()}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, flexDirection: 'row' },
  contentArea: { flex: 1, flexDirection: 'column' },
  screenWrapper: { flex: 1 },
});
