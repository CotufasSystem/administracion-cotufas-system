import { useCallback } from 'react';
import { storage } from '../utils/storage';
import { saveAttendanceDayToFirestore } from '../services/firestoreService';
import { getLocalDateString } from '../utils/formatters';

export const useAttendanceManager = (setAttendance, employees) => {
  const updateAttendanceDay = useCallback((dateKey, updater) => {
    setAttendance((prev) => {
      const dayRecs = updater({ ...(prev[dateKey] || {}) });
      const next = { ...prev, [dateKey]: dayRecs };
      storage.saveDatabase({ attendance: next });
      saveAttendanceDayToFirestore(dateKey, dayRecs);
      return next;
    });
  }, [setAttendance]);

  const setEmployeeAttendance = useCallback((dateKey, empId, status, hours = null, note = null) => {
    updateAttendanceDay(dateKey, (dayRecs) => {
      if (!status) {
        delete dayRecs[empId];
      } else {
        const existing = typeof dayRecs[empId] === 'object' ? dayRecs[empId] : { status: dayRecs[empId] };
        dayRecs[empId] = {
          status,
          hours: hours !== null ? hours : existing.hours,
          note: note !== null ? note : existing.note,
          pendingValidation: false,
        };
      }
      return dayRecs;
    });
  }, [updateAttendanceDay]);

  const markAllAttendance = useCallback((dateKey, status = 'present') => {
    updateAttendanceDay(dateKey, () => {
      const dayRecs = {};
      if (status) {
        employees.forEach((emp) => {
          dayRecs[emp.id] = status;
        });
      }
      return dayRecs;
    });
  }, [updateAttendanceDay, employees]);

  const markGroupAttendance = useCallback((dateKey, empIds = [], status = 'present') => {
    updateAttendanceDay(dateKey, (dayRecs) => {
      empIds.forEach((id) => {
        if (!status) {
          delete dayRecs[id];
        } else {
          const existing = typeof dayRecs[id] === 'object' ? dayRecs[id] : { status: dayRecs[id] };
          dayRecs[id] = {
            status,
            hours: existing.hours,
            note: existing.note,
            pendingValidation: false,
          };
        }
      });
      return dayRecs;
    });
  }, [updateAttendanceDay]);

  const notifySelfAttendance = useCallback((empId, type = 'checkin', note = null) => {
    const today = getLocalDateString(new Date());
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateAttendanceDay(today, (dayRecs) => {
      const current = dayRecs[empId];
      const existing = typeof current === 'object' ? current : (current ? { status: current } : {});

      if (type === 'checkout') {
        const checkIn = existing.checkInTime || existing.notifiedAt || '';
        dayRecs[empId] = {
          ...existing,
          status: existing.status || 'present',
          checkOutTime: nowTime,
          checkoutAt: nowTime,
          hours: checkIn ? `${checkIn} - ${nowTime}` : existing.hours,
          note: note !== null ? note : (existing.note || 'Salida notificada por colaborador'),
        };
      } else {
        dayRecs[empId] = {
          ...existing,
          status: 'present',
          notifiedAt: nowTime,
          checkInTime: nowTime,
          pendingValidation: true,
          note: note !== null ? note : (existing.note || 'Entrada notificada por colaborador'),
        };
      }
      return dayRecs;
    });
  }, [updateAttendanceDay]);

  const validateAttendance = useCallback((dateKey, empId) => {
    updateAttendanceDay(dateKey, (dayRecs) => {
      if (dayRecs[empId]) {
        const existing = typeof dayRecs[empId] === 'object' ? dayRecs[empId] : { status: dayRecs[empId] };
        dayRecs[empId] = { ...existing, pendingValidation: false, validated: true };
      }
      return dayRecs;
    });
  }, [updateAttendanceDay]);

  const validateAllPendingAttendance = useCallback((dateKey) => {
    updateAttendanceDay(dateKey, (dayRecs) => {
      Object.keys(dayRecs).forEach((id) => {
        if (typeof dayRecs[id] === 'object' && dayRecs[id]?.pendingValidation) {
          dayRecs[id] = { ...dayRecs[id], pendingValidation: false, validated: true };
        }
      });
      return dayRecs;
    });
  }, [updateAttendanceDay]);

  return {
    updateAttendanceDay,
    setEmployeeAttendance,
    markAllAttendance,
    markGroupAttendance,
    notifySelfAttendance,
    validateAttendance,
    validateAllPendingAttendance,
  };
};
