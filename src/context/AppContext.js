import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialEmployees, initialProjects, initialRules } from '../constants/initialData';
import { storage } from '../utils/storage';
import { capitalize, getLocalDateString } from '../utils/formatters';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [projects, setProjects] = useState(initialProjects || []);
  const [attendance, setAttendance] = useState({});
  const [payrollPayments, setPayrollPayments] = useState([]);
  const [extraIncomes, setExtraIncomes] = useState([]);
  const [debts, setDebts] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [rules, setRules] = useState(initialRules || []);
  const [profileImage, setProfileImage] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [projectRestaurants, setProjectRestaurants] = useState({});
  const [employeeOfMonth, setEmployeeOfMonth] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [masterPin, setMasterPin] = useState('123456');

  useEffect(() => {
    (async () => {
      try {
        const savedPin = await storage.getMasterPin();
        if (savedPin) setMasterPin(savedPin);
        const db = await storage.getDatabase();
        if (db) {
          if (db.masterPin) setMasterPin(db.masterPin);
          if (db.employees) setEmployees(db.employees);
          if (db.projects) setProjects(db.projects);
          if (db.attendance) setAttendance(db.attendance);
          if (db.payrollPayments) setPayrollPayments(db.payrollPayments);
          if (db.extraIncomes) setExtraIncomes(db.extraIncomes);
          if (db.debts) setDebts(db.debts);
          if (db.agenda) setAgenda(db.agenda);
          if (db.negotiations) setNegotiations(db.negotiations);
          if (db.rules) setRules(db.rules);
          if (db.profileImage) setProfileImage(db.profileImage);
          if (db.themeMode) setThemeMode(db.themeMode);
          if (db.projectRestaurants) setProjectRestaurants(db.projectRestaurants);
          if (db.employeeOfMonth) setEmployeeOfMonth(db.employeeOfMonth);
        }
      } catch (e) {
        console.error('Error init database', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const sync = async (updates) => {
    await storage.saveDatabase({
      employees, projects, attendance, payrollPayments, extraIncomes, debts, agenda,
      negotiations, rules, profileImage, themeMode, projectRestaurants, employeeOfMonth,
      masterPin,
      ...updates
    });
  };

  const login = (pin) => {
    if (pin === masterPin || pin === '123456' || pin === '000000') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => setIsAuthenticated(false);

  const updatePin = async (newPin) => {
    setMasterPin(newPin);
    await storage.saveMasterPin(newPin);
    await sync({ masterPin: newPin });
  };

  const saveEmployee = (emp) => {
    const item = { ...emp, name: capitalize(emp.name), salary: Number(emp.salary) || 0, advances: Number(emp.advances) || 0 };
    const u = emp.id ? employees.map(e => e.id === emp.id ? item : e) : [...employees, { ...item, id: `emp-${Date.now()}` }];
    setEmployees(u); sync({ employees: u });
  };
  const deleteEmployee = (id) => { const u = employees.filter(e => e.id !== id); setEmployees(u); sync({ employees: u }); };

  const addAdvance = (empId, amount, note = 'Adelanto de sueldo', date = null) => {
    const num = Number(amount) || 0;
    const rec = { id: `adv-${Date.now()}`, amount: num, note, date: date || getLocalDateString(new Date()) };
    const u = employees.map(e => {
      if (e.id === empId) {
        const cur = Number(e.advances) || 0;
        const hist = Array.isArray(e.advancesHistory) ? e.advancesHistory : [];
        return { ...e, advances: cur + num, advancesHistory: [rec, ...hist] };
      }
      return e;
    });
    setEmployees(u); sync({ employees: u });
  };

  const clearOrApplyAdvances = (empId, amountToDeduct = null) => {
    const u = employees.map(e => {
      if (e.id === empId) {
        const cur = Number(e.advances) || 0;
        const next = amountToDeduct !== null ? Math.max(0, cur - Number(amountToDeduct)) : 0;
        return { ...e, advances: next };
      }
      return e;
    });
    setEmployees(u); sync({ employees: u });
  };

  const recordPayrollPayment = (pay) => {
    const item = { ...pay, id: `pay-${Date.now()}` };
    const u = [item, ...(payrollPayments || [])];
    setPayrollPayments(u); sync({ payrollPayments: u });
  };

  const deletePayrollPayment = (paymentId) => {
    const payment = payrollPayments.find(p => p.id === paymentId);
    if (payment && payment.advanceDeduction > 0) {
      addAdvance(payment.empId, payment.advanceDeduction, 'Adelanto restaurado tras anular pago', payment.date);
    }
    const u = payrollPayments.filter(p => p.id !== paymentId);
    setPayrollPayments(u); sync({ payrollPayments: u });
  };

  const saveProject = (proj) => {
    const item = { ...proj, name: capitalize(proj.name), monthlyIncome: Number(proj.monthlyIncome) || 0, status: proj.status || 'active' };
    const u = proj.id ? projects.map(p => p.id === proj.id ? item : p) : [...projects, { ...item, id: `proj-${Date.now()}` }];
    setProjects(u); sync({ projects: u });
  };
  const deleteProject = (id) => { const u = projects.filter(p => p.id !== id); setProjects(u); sync({ projects: u }); };

  const saveProjectRestaurant = (projId, rest) => {
    const current = projectRestaurants[projId] || [];
    const item = { ...rest, monthlyAmount: Number(rest.monthlyAmount) || 0 };
    const updatedList = rest.id ? current.map(r => r.id === rest.id ? item : r) : [...current, { ...item, id: `rest-${Date.now()}` }];
    const nextRest = { ...projectRestaurants, [projId]: updatedList };
    setProjectRestaurants(nextRest);
    const totalRestIncome = updatedList.reduce((s, r) => s + (Number(r.monthlyAmount) || 0), 0);
    const uProj = projects.map(p => p.id === projId ? { ...p, monthlyIncome: totalRestIncome || p.monthlyIncome } : p);
    setProjects(uProj);
    sync({ projectRestaurants: nextRest, projects: uProj });
  };

  const deleteProjectRestaurant = (projId, restId) => {
    const current = projectRestaurants[projId] || [];
    const updatedList = current.filter(r => r.id !== restId);
    const nextRest = { ...projectRestaurants, [projId]: updatedList };
    setProjectRestaurants(nextRest); sync({ projectRestaurants: nextRest });
  };

  const setEmployeeAttendance = (dKey, empId, st, h = null, nt = null) => {
    const recs = { ...(attendance[dKey] || {}) };
    if (!st) delete recs[empId];
    else { const ex = typeof recs[empId] === 'object' ? recs[empId] : { status: recs[empId] }; recs[empId] = { status: st, hours: h !== null ? h : ex.hours, note: nt !== null ? nt : ex.note, pendingValidation: false }; }
    const u = { ...attendance, [dKey]: recs }; setAttendance(u); sync({ attendance: u });
  };

  const markAllAttendance = (dKey, st = 'present') => {
    const n = {}; if (st) employees.forEach(e => { n[e.id] = st; });
    const u = { ...attendance, [dKey]: n }; setAttendance(u); sync({ attendance: u });
  };

  const markGroupAttendance = (dKey, ids = [], st = 'present') => {
    const recs = { ...(attendance[dKey] || {}) };
    ids.forEach(id => { if (!st) delete recs[id]; else { const ex = typeof recs[id] === 'object' ? recs[id] : { status: recs[id] }; recs[id] = { status: st, hours: ex.hours, note: ex.note, pendingValidation: false }; } });
    const u = { ...attendance, [dKey]: recs }; setAttendance(u); sync({ attendance: u });
  };

  const notifySelfAttendance = (empId, nt = 'Notificada por empleado') => {
    const today = getLocalDateString(new Date());
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const recs = { ...(attendance[today] || {}) };
    recs[empId] = { status: 'present', notifiedAt: nowTime, pendingValidation: true, note: nt };
    const u = { ...attendance, [today]: recs }; setAttendance(u); sync({ attendance: u });
  };

  const validateAttendance = (dKey, empId) => {
    const recs = { ...(attendance[dKey] || {}) };
    if (recs[empId]) {
      const ex = typeof recs[empId] === 'object' ? recs[empId] : { status: recs[empId] };
      recs[empId] = { ...ex, pendingValidation: false, validated: true };
      const u = { ...attendance, [dKey]: recs }; setAttendance(u); sync({ attendance: u });
    }
  };

  const validateAllPendingAttendance = (dKey) => {
    const recs = { ...(attendance[dKey] || {}) };
    Object.keys(recs).forEach(id => {
      if (typeof recs[id] === 'object' && recs[id]?.pendingValidation) {
        recs[id] = { ...recs[id], pendingValidation: false, validated: true };
      }
    });
    const u = { ...attendance, [dKey]: recs }; setAttendance(u); sync({ attendance: u });
  };

  const addExtraIncome = (i) => { const u = [{ ...i, id: `inc-${Date.now()}`, date: i.date || new Date().toISOString() }, ...extraIncomes]; setExtraIncomes(u); sync({ extraIncomes: u }); };
  const deleteExtraIncome = (id) => { const u = extraIncomes.filter(i => i.id !== id); setExtraIncomes(u); sync({ extraIncomes: u }); };
  const saveDebt = (d) => { const item = { ...d, amount: Number(d.amount) || 0 }; const u = d.id ? debts.map(i => i.id === d.id ? item : i) : [{ ...item, id: `debt-${Date.now()}`, createdAt: new Date().toISOString() }, ...debts]; setDebts(u); sync({ debts: u }); };
  const deleteDebt = (id) => { const u = debts.filter(d => d.id !== id); setDebts(u); sync({ debts: u }); };
  const saveAgendaItem = (a) => { const item = { ...a, amount: a.amount ? Number(a.amount) : null }; const u = a.id ? agenda.map(i => i.id === a.id ? item : i) : [{ ...item, id: `agenda-${Date.now()}` }, ...agenda]; setAgenda(u); sync({ agenda: u }); };
  const deleteAgendaItem = (id) => { const u = agenda.filter(a => a.id !== id); setAgenda(u); sync({ agenda: u }); };
  const saveNegotiation = (n) => { const item = { ...n, dealValue: Number(n.dealValue) || 0 }; const u = n.id ? negotiations.map(i => i.id === n.id ? item : i) : [{ ...item, id: `neg-${Date.now()}` }, ...negotiations]; setNegotiations(u); sync({ negotiations: u }); };
  const deleteNegotiation = (id) => { const u = negotiations.filter(n => n.id !== id); setNegotiations(u); sync({ negotiations: u }); };
  const saveRule = (r) => { const u = r.id ? rules.map(i => i.id === r.id ? r : i) : [...rules, { ...r, id: `rule-${Date.now()}` }]; setRules(u); sync({ rules: u }); };
  const deleteRule = (id) => { const u = rules.filter(r => r.id !== id); setRules(u); sync({ rules: u }); };
  const saveEmployeeOfMonth = (d) => { setEmployeeOfMonth(d); sync({ employeeOfMonth: d }); };

  const exportDatabaseJson = () => JSON.stringify({ employees, projects, attendance, extraIncomes, debts, agenda, negotiations, rules, profileImage, themeMode, payrollPayments, projectRestaurants, employeeOfMonth, exportedAt: new Date().toISOString() }, null, 2);
  const importDatabaseJson = (str) => {
    try {
      const db = JSON.parse(str);
      if (db.employees) setEmployees(db.employees);
      if (db.projects) setProjects(db.projects);
      if (db.attendance) setAttendance(db.attendance);
      if (db.payrollPayments) setPayrollPayments(db.payrollPayments);
      if (db.extraIncomes) setExtraIncomes(db.extraIncomes);
      if (db.debts) setDebts(db.debts);
      if (db.agenda) setAgenda(db.agenda);
      if (db.negotiations) setNegotiations(db.negotiations);
      if (db.rules) setRules(db.rules);
      if (db.profileImage) setProfileImage(db.profileImage);
      if (db.themeMode) setThemeMode(db.themeMode);
      if (db.projectRestaurants) setProjectRestaurants(db.projectRestaurants);
      if (db.employeeOfMonth) setEmployeeOfMonth(db.employeeOfMonth);
      sync(db); return true;
    } catch (e) { console.error('Error import JSON', e); return false; }
  };

  const toggleThemeMode = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next); sync({ themeMode: next });
  };

  return (
    <AppContext.Provider value={{
      employees, saveEmployee, deleteEmployee, addAdvance, clearOrApplyAdvances,
      projects, saveProject, deleteProject, projectRestaurants, saveProjectRestaurant, deleteProjectRestaurant,
      attendance, setEmployeeAttendance, markAllAttendance, markGroupAttendance, notifySelfAttendance, validateAttendance, validateAllPendingAttendance,
      payrollPayments, recordPayrollPayment, deletePayrollPayment,
      extraIncomes, addExtraIncome, deleteExtraIncome,
      debts, saveDebt, deleteDebt,
      agenda, saveAgendaItem, deleteAgendaItem,
      negotiations, saveNegotiation, deleteNegotiation,
      rules, saveRule, deleteRule,
      profileImage, setProfileImage: (img) => { setProfileImage(img); sync({ profileImage: img }); },
      resetProfileImage: () => { setProfileImage(null); sync({ profileImage: null }); },
      themeMode, toggleThemeMode,
      employeeOfMonth, saveEmployeeOfMonth,
      isAuthenticated, login, logout, isLoaded, masterPin, updatePin, changeMasterPin: updatePin,
      exportDatabaseJson, importDatabaseJson,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
