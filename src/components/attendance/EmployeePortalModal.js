import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ModalWrapper } from '../common/UIComponents';
import { getLocalDateString } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { EmployeePortalAuthView } from './EmployeePortalAuthView';
import { EmployeePortalDetailView } from './EmployeePortalDetailView';

export const EmployeePortalModal = ({ visible, onClose }) => {
  const { employees = [], updateEmployeePortalProfile, attendance = {}, notifySelfAttendance, payrollPayments = [] } = useApp() || {};
  const activeEmployees = useMemo(
    () => (employees || []).filter((e) => e?.status !== 'inactive' && !e?.exemptAttendance && !e?.isOwner),
    [employees]
  );

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [authenticatedEmpId, setAuthenticatedEmpId] = useState(null);
  const [supportsBiometrics, setSupportsBiometrics] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Detect genuine biometric hardware support on mobile devices only
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          setSupportsBiometrics(hasHardware && isEnrolled);
        } catch (e) {
          setSupportsBiometrics(false);
        }
      } else {
        setSupportsBiometrics(false);
      }
    })();
  }, []);

  const authenticatedEmployee = (activeEmployees || []).find((e) => e.id === authenticatedEmpId);
  const targetEmployee = (activeEmployees || []).find((e) => e.id === selectedEmpId);

  const todayStr = getLocalDateString(new Date());
  const todayRecord = (attendance || {})[todayStr]?.[authenticatedEmployee?.id];

  const isPending = typeof todayRecord === 'object' && todayRecord?.pendingValidation;
  const isPresent = (typeof todayRecord === 'string' && todayRecord === 'present') || (typeof todayRecord === 'object' && todayRecord?.status === 'present' && !todayRecord?.pendingValidation);
  const isAbsent = (typeof todayRecord === 'string' && todayRecord === 'absent') || (typeof todayRecord === 'object' && todayRecord?.status === 'absent');
  const isPermission = (typeof todayRecord === 'string' && todayRecord === 'permission') || (typeof todayRecord === 'object' && todayRecord?.status === 'permission');

  const myPayments = useMemo(() => {
    if (!authenticatedEmployee?.id) return [];
    return (payrollPayments || []).filter((p) => p.empId === authenticatedEmployee.id);
  }, [payrollPayments, authenticatedEmployee?.id]);

  const currentMonthStr = todayStr.slice(0, 7);
  const myMonthAttendance = useMemo(() => {
    let presentCount = 0, absentCount = 0, permissionCount = 0;
    Object.keys(attendance || {}).forEach((dateKey) => {
      if (dateKey.startsWith(currentMonthStr)) {
        const rec = attendance[dateKey]?.[authenticatedEmployee?.id];
        const status = typeof rec === 'object' ? rec?.status : rec;
        if (status === 'present') presentCount++;
        else if (status === 'absent') absentCount++;
        else if (status === 'permission') permissionCount++;
      }
    });
    return { presentCount, absentCount, permissionCount };
  }, [attendance, currentMonthStr, authenticatedEmployee?.id]);

  const handleBiometricAuth = async () => {
    if (!targetEmployee) {
      setAuthError('Selecciona tu nombre primero');
      return;
    }
    if (Platform.OS === 'web' || !supportsBiometrics) {
      setAuthError('La autenticación biométrica solo está disponible en dispositivos móviles compatibles.');
      return;
    }

    setAuthError('');
    setIsScanning(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Autenticación de ${targetEmployee.name}`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar Cédula / PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setAuthenticatedEmpId(targetEmployee.id);
        setPinInput('');
      } else {
        setAuthError('Autenticación biométrica no completada.');
      }
    } catch (e) {
      setAuthError('Error al leer el sensor biométrico del dispositivo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinOrCiAuth = (explicitEmployee = null) => {
    const emp = explicitEmployee || targetEmployee;
    if (!emp) {
      setAuthError('No se encontró el colaborador.');
      return;
    }
    const cleanInput = pinInput.trim().toLowerCase().replace(/[^0-9a-z]/g, '');
    const cleanCi = (emp.idCard || '').trim().toLowerCase().replace(/[^0-9a-z]/g, '');
    const cleanPhone = (emp.phone || '').trim().replace(/[^0-9]/g, '').slice(-4);
    const customPin = (emp.pin || '').trim().toLowerCase();

    if (!cleanInput) {
      setAuthError('Por favor ingresa tu número de Cédula o PIN.');
      return;
    }

    // Si el usuario ya cambió su contraseña (emp.pin existe), SOLO puede entrar con su PIN.
    // Si aún no ha configurado contraseña (emp.pin está vacío), entra con su Cédula.
    let isValid = false;
    if (customPin) {
      isValid = cleanInput === customPin;
    } else {
      isValid = (cleanCi && cleanInput === cleanCi) || (cleanPhone && cleanInput === cleanPhone);
    }

    if (isValid) {
      setAuthenticatedEmpId(emp.id);
      setSelectedEmpId(emp.id);
      setPinInput('');
      setAuthError('');
    } else {
      setAuthError('Cédula o contraseña incorrecta para este colaborador.');
    }
  };

  const handleLogoutEmp = () => {
    setAuthenticatedEmpId(null);
    setSelectedEmpId('');
    setPinInput('');
    setAuthError('');
  };

  const handleNotifyAttendance = (type = 'checkin') => {
    if (!authenticatedEmployee) return;
    notifySelfAttendance(authenticatedEmployee.id, type);
    const label = type === 'checkout' ? 'Salida' : 'Entrada';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = `¡Hora de ${label} (${nowTime}) registrada con éxito para ${authenticatedEmployee.name}!`;
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert(`Hora de ${label} Registrada`, msg);
  };

  const handleUpdateProfile = ({ portalUsername, pin }) => {
    if (!authenticatedEmployee || !updateEmployeePortalProfile) return;
    updateEmployeePortalProfile(authenticatedEmployee.id, {
      portalUsername: portalUsername !== undefined ? portalUsername : authenticatedEmployee.portalUsername,
      pin: pin !== undefined ? pin : authenticatedEmployee.pin,
    });
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={authenticatedEmployee ? `Mi Portal • ${authenticatedEmployee.portalUsername || authenticatedEmployee.name}` : "Acceso al Portal"}
      maxWidth={480}
      minHeight={authenticatedEmployee ? 580 : 380}
      height={authenticatedEmployee ? (Platform.OS === 'web' ? '82vh' : 580) : null}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {!authenticatedEmployee ? (
          <EmployeePortalAuthView
            activeEmployees={activeEmployees}
            selectedEmpId={selectedEmpId}
            onSelectEmp={(id) => { setSelectedEmpId(id); setAuthError(''); }}
            supportsBiometrics={supportsBiometrics}
            onBiometricAuth={handleBiometricAuth}
            isScanning={isScanning}
            pinInput={pinInput}
            onChangePin={setPinInput}
            onPinAuth={handlePinOrCiAuth}
            authError={authError}
          />
        ) : (
          <EmployeePortalDetailView
            employee={authenticatedEmployee}
            todayStr={todayStr}
            todayRecord={todayRecord}
            isPending={isPending}
            isPresent={isPresent}
            isAbsent={isAbsent}
            isPermission={isPermission}
            myPayments={myPayments}
            myMonthAttendance={myMonthAttendance}
            onNotifyAttendance={handleNotifyAttendance}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogoutEmp}
          />
        )}
      </ScrollView>
    </ModalWrapper>
  );
};
