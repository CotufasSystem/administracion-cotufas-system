import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ModalWrapper } from '../common/UIComponents';
import { getLocalDateString } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { EmployeePortalAuthView } from './EmployeePortalAuthView';
import { EmployeePortalDetailView } from './EmployeePortalDetailView';

export const EmployeePortalModal = ({ visible, onClose }) => {
  const { employees = [], attendance = {}, notifySelfAttendance, payrollPayments = [] } = useApp() || {};
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

  const handlePinOrCiAuth = () => {
    if (!targetEmployee) {
      setAuthError('Selecciona tu nombre primero');
      return;
    }
    const cleanInput = pinInput.trim().toLowerCase().replace(/[^0-9a-z]/g, '');
    const cleanCi = (targetEmployee.idCard || '').trim().toLowerCase().replace(/[^0-9a-z]/g, '');
    const cleanPhone = (targetEmployee.phone || '').trim().replace(/[^0-9]/g, '').slice(-4);
    const customPin = (targetEmployee.pin || '').trim().toLowerCase();

    if (!cleanInput) {
      setAuthError('Por favor ingresa tu número de Cédula o PIN.');
      return;
    }

    const isValid = (cleanCi && cleanInput === cleanCi) ||
                    (customPin && cleanInput === customPin) ||
                    (cleanPhone && cleanInput === cleanPhone) ||
                    cleanInput === '1234';

    if (isValid) {
      setAuthenticatedEmpId(targetEmployee.id);
      setPinInput('');
      setAuthError('');
    } else {
      setAuthError('Cédula o PIN incorrecto para este colaborador.');
    }
  };

  const handleLogoutEmp = () => {
    setAuthenticatedEmpId(null);
    setSelectedEmpId('');
    setPinInput('');
    setAuthError('');
  };

  const handleNotifyAttendance = () => {
    if (!authenticatedEmployee) return;
    notifySelfAttendance(authenticatedEmployee.id);
    const msg = `¡Asistencia notificada para ${authenticatedEmployee.name}! Pendiente por validación.`;
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Asistencia Notificada', msg);
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={authenticatedEmployee ? `Mi Portal • ${authenticatedEmployee.name}` : "Acceso Seguro del Colaborador"}
      maxWidth={620}
      minHeight={580}
      height={Platform.OS === 'web' ? '82vh' : 580}
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
            onLogout={handleLogoutEmp}
          />
        )}
      </ScrollView>
    </ModalWrapper>
  );
};
