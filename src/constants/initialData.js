export const INITIAL_EMPLOYEES = [
  { id: 'emp-1', name: 'Alejandro', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-1'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-2', name: 'Angel', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-1'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-3', name: 'Cesar', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-2'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-4', name: 'Clara', salary: 300, binance: 'castilloclara88@gmail.com', area: 'Operaciones', projectIds: ['proj-1', 'proj-2'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-5', name: 'Diego', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-2'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-6', name: 'Francys', salary: 300, binance: '', area: 'Servicios Generales / Limpieza', exemptAttendance: true, projectIds: [], schedule: 'Flexible', advances: 0 },
  { id: 'emp-7', name: 'Genesis', salary: 200, binance: '', area: 'Servicios Generales / Limpieza', projectIds: [], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-8', name: 'Hector', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-1'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-9', name: 'Javier', salary: 400, binance: '', area: '👑 Dueño / Socio Propietario', isOwner: true, exemptAttendance: true, projectIds: ['proj-4'], schedule: 'Flexible', advances: 0 },
  { id: 'emp-10', name: 'Leonardo', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-1'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-11', name: 'Luis', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-2'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-12', name: 'Michelle', salary: 400, binance: '', area: '👑 Dueña / Socia Propietaria', isOwner: true, exemptAttendance: true, projectIds: ['proj-2'], schedule: 'Flexible', advances: 0 },
  { id: 'emp-13', name: 'Moisés', salary: 200, binance: '', area: 'Operaciones', projectIds: ['proj-3'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-14', name: 'Palazi', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-1'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
  { id: 'emp-15', name: 'Sebastián', salary: 300, binance: '', area: 'Operaciones', projectIds: ['proj-4'], schedule: '9:00 AM - 5:00 PM', advances: 0 },
];

export const INITIAL_PROJECTS = [
  { id: 'proj-1', name: 'Casino', monthlyIncome: 2000, status: 'active', note: 'Ingreso recurrente $2000' },
  { id: 'proj-2', name: 'Home 24', monthlyIncome: 800, status: 'active', note: 'Ingreso mensual $800' },
  { id: 'proj-3', name: 'Petrolera', monthlyIncome: 0, status: 'active', note: 'Activo sin tarifa fija registrada' },
  { id: 'proj-4', name: 'Maseasy', monthlyIncome: 0, status: 'active', note: 'Tarifa mensual por definir' },
];

export const INITIAL_FIXED_EXPENSES = [
  { id: 'fix-1', name: 'Alquiler', amount: 300, payDay: 20, note: 'Se paga en la segunda quincena' }
];

export const INITIAL_RULES = [
  { id: 'r-1', title: 'Art. 1° - Jornada Laboral, Puntualidad y Registro de Asistencia', description: 'Todo colaborador debe cumplir estrictamente con su horario y proyecto asignado. Las inasistencias justificadas deben ser notificadas con un mínimo de 24 horas de anticipación a la Administración. Las ausencias no notificadas se considerarán faltas injustificadas y podrán ser objeto de sanción disciplinaria.' },
  { id: 'r-2', title: 'Art. 2° - Compromiso de Entregas, Estándares de Calidad y Reportes', description: 'Es obligación del colaborador registrar diariamente los avances técnicos y entregables en las plataformas y repositorios oficiales de la empresa antes del cierre de cada jornada operativa, garantizando el cumplimiento de los estándares de calidad pactados.' },
  { id: 'r-3', title: 'Art. 3° - Confidencialidad, Seguridad de la Información y Propiedad Intelectual', description: 'Queda terminantemente prohibida la divulgación, copia, extracción o uso no autorizado de código fuente, bases de datos, credenciales de acceso, diseños y datos comerciales de clientes y proyectos de Cotufas System. Toda creación técnica es propiedad intelectual exclusiva de la empresa.' },
  { id: 'r-4', title: 'Art. 4° - Política de Adelantos de Sueldo y Cronograma de Liquidación', description: 'Las solicitudes de adelanto salarial deberán tramitarse formalmente ante la Administración y estarán sujetas a disponibilidad presupuestaria. Todo monto adelantado será deducido automáticamente en el corte de nómina quincenal inmediato.' },
  { id: 'r-5', title: 'Art. 5° - Métodos de Pago, Cuentas Oficiales y Responsabilidad Fiscal', description: 'El colaborador es responsable de suministrar y mantener activa su cuenta oficial (Binance / Transferencia) debidamente verificada para la dispersión de pagos quincenales, eximiendo a la empresa de demoras por datos erróneos.' },
  { id: 'r-6', title: 'Art. 6° - Régimen Disciplinario y Rescisión de Contrato', description: 'El incumplimiento reiterado de las directrices, faltas injustificadas, abandono de puesto o faltas graves a la confidencialidad constituirán causal justificada de terminación de la relación laboral y rescisión inmediata de contrato.' }
];

export const DEFAULT_PIN = '123456';
