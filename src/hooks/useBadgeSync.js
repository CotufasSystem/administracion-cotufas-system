import { useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAgendaReminders } from './useAgendaReminders';
import { updateAppBadge } from '../services/badgeService';

export const useBadgeSync = () => {
  const { employees = [], attendance = {}, agenda = [], negotiations = [] } = useApp();
  const { totalRemindersCount } = useAgendaReminders(agenda, negotiations);

  // Pending attendances count
  const pendingCount = useMemo(() => {
    let count = 0;
    Object.keys(attendance || {}).forEach((dateKey) => {
      const dayRecs = attendance[dateKey] || {};
      Object.keys(dayRecs).forEach((empId) => {
        const rec = dayRecs[empId];
        if (typeof rec === 'object' && rec?.pendingValidation) {
          count++;
        }
      });
    });
    return count;
  }, [attendance]);

  const totalCount = pendingCount + totalRemindersCount;

  useEffect(() => {
    updateAppBadge(totalCount);
  }, [totalCount]);

  return { totalCount, pendingCount, totalRemindersCount };
};
