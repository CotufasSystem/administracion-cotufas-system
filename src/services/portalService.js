import { saveEntityDoc, removeEntityDoc } from './firestoreService.js';
import { getLocalDateString } from '../utils/formatters.js';

/**
 * Calculates business days between two date strings (YYYY-MM-DD),
 * excluding Saturdays and Sundays.
 */
export const calculateBusinessDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

/**
 * Calculates total calendar days between two dates inclusive.
 */
export const calculateTotalDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/* =========================================================================
   1. MÓDULO DE SOLICITUD DE ADELANTOS DE SUELDO
========================================================================= */

/**
 * Creates a new advance request with client/business rule validations:
 * - Amount > 0
 * - Amount <= maxAllowedPercent of base salary (default 50%)
 * - No existing request in 'pending' status
 */
export const submitAdvanceRequest = async ({
  employee,
  amount,
  reason = '',
  requiredByDate = '',
  maxAllowedPercent = 50,
  existingRequests = [],
}) => {
  if (!employee || !employee.id) {
    throw new Error('Identificación de empleado inválida.');
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Ingresa un monto válido mayor a 0.');
  }

  const baseSalary = Number(employee.salary) || 0;
  const maxLimit = (baseSalary * maxAllowedPercent) / 100;
  if (baseSalary > 0 && numAmount > maxLimit) {
    throw new Error(`El monto ($${numAmount}) excede el límite permitido del ${maxAllowedPercent}% de tu sueldo base ($${maxLimit.toFixed(2)}).`);
  }

  // Check if has a pending request
  const hasPending = (existingRequests || []).some(
    (req) => req.employeeId === employee.id && req.status === 'pending'
  );
  if (hasPending) {
    throw new Error('Ya tienes una solicitud de adelanto pendiente por revisión del administrador.');
  }

  const id = `advreq-${Date.now()}`;
  const newRequest = {
    id,
    employeeId: employee.id,
    employeeName: employee.name,
    idCard: employee.idCard || '',
    amount: numAmount,
    currency: 'USD',
    salaryBaseline: baseSalary,
    maxAllowedPercent,
    reason: (reason || '').trim(),
    requiredByDate: requiredByDate || getLocalDateString(new Date()),
    status: 'pending', // 'pending' | 'approved' | 'rejected' | 'settled'
    adminComment: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ok = await saveEntityDoc('advance_requests', id, newRequest);
  if (!ok) {
    throw new Error('No se pudo guardar la solicitud en la base de datos.');
  }

  return newRequest;
};

/* =========================================================================
   2. MÓDULO DE REPOSOS MÉDICOS Y PERMISOS
========================================================================= */

/**
 * Creates a new leave request (medical, personal, etc.) with attached document.
 */
export const submitLeaveRequest = async ({
  employee,
  type, // 'medical_leave' | 'personal_permission' | 'bereavement' | 'legal_procedure' | 'vacation'
  startDate,
  endDate,
  description,
  attachments = [],
}) => {
  if (!employee || !employee.id) {
    throw new Error('Identificación de colaborador inválida.');
  }
  if (!startDate || !endDate) {
    throw new Error('Debes indicar las fechas de inicio y fin.');
  }

  const businessDays = calculateBusinessDays(startDate, endDate);
  const totalDays = calculateTotalDays(startDate, endDate);

  if (totalDays <= 0) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
  }

  const id = `leavereq-${Date.now()}`;
  const newLeave = {
    id,
    employeeId: employee.id,
    employeeName: employee.name,
    idCard: employee.idCard || '',
    type: type || 'medical_leave',
    startDate,
    endDate,
    totalDays,
    businessDays,
    description: (description || '').trim(),
    attachments: attachments || [],
    status: 'under_review', // 'under_review' | 'approved' | 'rejected'
    adminFeedback: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ok = await saveEntityDoc('leave_requests', id, newLeave);
  if (!ok) {
    throw new Error('No se pudo registrar la solicitud de reposo/permiso.');
  }

  return newLeave;
};

/* =========================================================================
   3. JUSTIFICACIÓN DE INASISTENCIA O TARDANZA
========================================================================= */

/**
 * Scans attendance records for unjustified absences or marked delays for an employee.
 */
export const getUnjustifiedIncidents = (employeeId, attendanceMap = {}, existingJustifications = []) => {
  if (!employeeId) return [];

  const justifiedDates = new Set(
    (existingJustifications || [])
      .filter((j) => j.employeeId === employeeId)
      .map((j) => j.dateKey)
  );

  const incidents = [];

  // Inspect attendance records
  Object.keys(attendanceMap || {}).forEach((dateKey) => {
    const dayRecord = attendanceMap[dateKey]?.[employeeId];
    if (!dayRecord) return;

    // 1. Falta registrada
    const isAbsent =
      (typeof dayRecord === 'string' && dayRecord === 'absent') ||
      (typeof dayRecord === 'object' && dayRecord?.status === 'absent');

    // 2. Tardanza registrada
    const isLate =
      typeof dayRecord === 'object' &&
      (dayRecord?.delayMinutes > 15 || dayRecord?.isLate);

    if (isAbsent && !justifiedDates.has(dateKey)) {
      incidents.push({
        dateKey,
        type: 'absent',
        label: 'Inasistencia / Falta',
        record: dayRecord,
        time: typeof dayRecord === 'object' ? dayRecord.checkInTime : null,
      });
    } else if (isLate && !justifiedDates.has(dateKey)) {
      incidents.push({
        dateKey,
        type: 'late_entry',
        label: `Llegada Tardía (${dayRecord.delayMinutes || '15+'} min)`,
        record: dayRecord,
        time: dayRecord.checkInTime,
      });
    }
  });

  // Sort descending by date
  return incidents.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};

/**
 * Submits a justification for an absent or late day.
 */
export const submitAttendanceJustification = async ({
  employee,
  dateKey,
  incidentType,
  reason,
  attachments = [],
}) => {
  if (!employee || !employee.id) throw new Error('Empleado no identificado.');
  if (!dateKey) throw new Error('Fecha no indicada.');
  if (!reason || !reason.trim()) throw new Error('Debes ingresar el motivo de la justificación.');

  const id = `just-${Date.now()}`;
  const newJustification = {
    id,
    employeeId: employee.id,
    employeeName: employee.name,
    idCard: employee.idCard || '',
    dateKey,
    incidentType: incidentType || 'absent',
    reason: reason.trim(),
    attachments: attachments || [],
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    adminComment: '',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };

  const ok = await saveEntityDoc('attendance_justifications', id, newJustification);
  if (!ok) {
    throw new Error('Error al guardar la justificación.');
  }

  return newJustification;
};

/* =========================================================================
   4. ACCIONES DE RESOLUCIÓN POR EL ADMINISTRADOR
========================================================================= */

/**
 * Resolves an advance request (approves or rejects).
 */
export const resolveAdvanceRequest = async ({
  requestId,
  status, // 'approved' | 'rejected'
  adminComment = '',
}) => {
  if (!requestId) throw new Error('ID de solicitud no especificado.');
  const updateData = {
    id: requestId,
    status,
    adminComment: adminComment.trim(),
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ok = await saveEntityDoc('advance_requests', requestId, updateData);
  if (!ok) throw new Error('No se pudo actualizar el estado del adelanto.');
  return updateData;
};

/**
 * Resolves a leave/permission request.
 */
export const resolveLeaveRequest = async ({
  requestId,
  status, // 'approved' | 'rejected'
  adminFeedback = '',
}) => {
  if (!requestId) throw new Error('ID de solicitud no especificado.');
  const updateData = {
    id: requestId,
    status,
    adminFeedback: adminFeedback.trim(),
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ok = await saveEntityDoc('leave_requests', requestId, updateData);
  if (!ok) throw new Error('No se pudo actualizar la solicitud de reposo/permiso.');
  return updateData;
};

/**
 * Resolves an attendance justification.
 */
export const resolveAttendanceJustification = async ({
  justificationId,
  status, // 'approved' | 'rejected'
  adminComment = '',
}) => {
  if (!justificationId) throw new Error('ID de justificación no especificado.');
  const updateData = {
    id: justificationId,
    status,
    adminComment: adminComment.trim(),
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ok = await saveEntityDoc('attendance_justifications', justificationId, updateData);
  if (!ok) throw new Error('No se pudo actualizar la justificación de asistencia.');
  return updateData;
};
