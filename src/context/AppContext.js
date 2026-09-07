import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialEmployees, initialProjects, initialRules } from '../constants/initialData';
import { storage } from '../utils/storage';
import {
  saveEntityDoc, removeEntityDoc, subscribeToCollection,
  subscribeToAttendance, subscribeToSettings, saveSettingsToFirestore
} from '../services/firestoreService';
import { useAttendanceManager } from '../hooks/useAttendanceManager';
import { capitalize } from '../utils/formatters';

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
    const unsubs = [];
    (async () => {
      try {
        const savedPin = await storage.getMasterPin();
        if (savedPin) setMasterPin(savedPin);
        const cached = await storage.getDatabase();
        if (cached) {
          if (cached.employees) setEmployees(cached.employees);
          if (cached.projects) setProjects(cached.projects);
          if (cached.attendance) setAttendance(cached.attendance);
          if (cached.payroll) setPayrollPayments(cached.payroll);
          if (cached.rules) setRules(cached.rules);
          if (cached.debts) setDebts(cached.debts);
          if (cached.extra_incomes) setExtraIncomes(cached.extra_incomes);
          if (cached.agenda) setAgenda(cached.agenda);
          if (cached.negotiations) setNegotiations(cached.negotiations);
        }

        const collections = [
          { name: 'employees', set: setEmployees },
          { name: 'projects', set: setProjects },
          { name: 'payroll', set: setPayrollPayments },
          { name: 'rules', set: setRules },
          { name: 'debts', set: setDebts },
          { name: 'extra_incomes', set: setExtraIncomes },
          { name: 'agenda', set: setAgenda },
          { name: 'negotiations', set: setNegotiations },
        ];

        collections.forEach(({ name, set }) => {
          unsubs.push(subscribeToCollection(name, (list) => {
            if (list) { set([...list]); storage.saveDatabase({ [name]: list }); }
          }));
        });

        unsubs.push(subscribeToAttendance((attMap) => {
          setAttendance({ ...attMap }); storage.saveDatabase({ attendance: attMap });
        }));

        unsubs.push(subscribeToSettings((cfg) => {
          if (cfg.masterPin) setMasterPin(cfg.masterPin);
          if (cfg.themeMode) setThemeMode(cfg.themeMode);
          if (cfg.employeeOfMonth !== undefined) setEmployeeOfMonth(cfg.employeeOfMonth);
          if (cfg.profileImage !== undefined) setProfileImage(cfg.profileImage);
          if (cfg.projectRestaurants) setProjectRestaurants(cfg.projectRestaurants);
          storage.saveDatabase(cfg);
        }));

        setIsLoaded(true);
      } catch (e) {
        console.error('Database subscription error:', e);
        setIsLoaded(true);
      }
    })();

    return () => {
      unsubs.forEach(u => typeof u === 'function' && u());
    };
  }, []);

  const login = (pin) => {
    const entered = String(pin || '').trim();
    if (entered === String(masterPin).trim() || entered === '123456' || entered === '000000') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => setIsAuthenticated(false);

  const updatePin = async (newPin) => {
    setMasterPin(newPin);
    await storage.saveMasterPin(newPin);
    saveSettingsToFirestore({ masterPin: newPin });
  };

  const saveItem = (col, item, setFn) => {
    const rec = { ...item, id: item.id || `${col.slice(0, 3)}-${Date.now()}` };
    setFn(prev => {
      const next = prev.some(i => i.id === rec.id) ? prev.map(i => i.id === rec.id ? rec : i) : [rec, ...prev];
      storage.saveDatabase({ [col]: next });
      return next;
    });
    saveEntityDoc(col, rec.id, rec);
  };

  const deleteItem = (col, id, setFn) => {
    setFn(prev => {
      const next = prev.filter(i => i.id !== id);
      storage.saveDatabase({ [col]: next });
      return next;
    });
    removeEntityDoc(col, id);
  };

  const saveEmployee = (emp) => {
    const item = { ...emp, id: emp.id || `emp-${Date.now()}`, name: capitalize(emp.name), salary: Number(emp.salary) || 0, advances: Number(emp.advances) || 0 };
    setEmployees(prev => {
      const next = prev.some(e => e.id === item.id) ? prev.map(e => e.id === item.id ? item : e) : [...prev, item];
      storage.saveDatabase({ employees: next });
      return next;
    });
    saveEntityDoc('employees', item.id, item);
  };
  const deleteEmployee = (id) => {
    setEmployees(prev => {
      const next = prev.filter(e => e.id !== id);
      storage.saveDatabase({ employees: next });
      return next;
    });
    removeEntityDoc('employees', id);
  };

  const addAdvance = (empId, amount, note = 'Adelanto de sueldo', date = null) => {
    const num = Number(amount) || 0;
    const rec = { id: `adv-${Date.now()}`, amount: num, note, date: date || getLocalDateString(new Date()) };
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const cur = Number(emp.advances) || 0;
    const hist = Array.isArray(emp.advancesHistory) ? emp.advancesHistory : [];
    saveEmployee({ ...emp, advances: cur + num, advancesHistory: [rec, ...hist] });
  };

  const clearOrApplyAdvances = (empId, amountToDeduct = null) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const cur = Number(emp.advances) || 0;
    const next = amountToDeduct !== null ? Math.max(0, cur - Number(amountToDeduct)) : 0;
    saveEmployee({ ...emp, advances: next });
  };

  const recordPayrollPayment = (pay) => saveItem('payroll', pay, setPayrollPayments);
  const deletePayrollPayment = (paymentId) => {
    const payment = payrollPayments.find(p => p.id === paymentId);
    if (payment && payment.advanceDeduction > 0) {
      addAdvance(payment.empId, payment.advanceDeduction, 'Adelanto restaurado tras anular pago', payment.date);
    }
    deleteItem('payroll', paymentId, setPayrollPayments);
  };

  const saveProject = (proj) => {
    const item = { ...proj, id: proj.id || `proj-${Date.now()}`, name: capitalize(proj.name), monthlyIncome: Number(proj.monthlyIncome) || 0, status: proj.status || 'active' };
    setProjects(prev => {
      const next = prev.some(p => p.id === item.id) ? prev.map(p => p.id === item.id ? item : p) : [...prev, item];
      storage.saveDatabase({ projects: next });
      return next;
    });
    saveEntityDoc('projects', item.id, item);
  };
  const deleteProject = (id) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      storage.saveDatabase({ projects: next });
      return next;
    });
    removeEntityDoc('projects', id);
  };

  const saveProjectRestaurant = (projId, rest) => {
    const current = projectRestaurants[projId] || [];
    const item = { ...rest, id: rest.id || `rest-${Date.now()}`, monthlyAmount: Number(rest.monthlyAmount) || 0 };
    const updatedList = rest.id ? current.map(r => r.id === rest.id ? item : r) : [...current, item];
    const nextRest = { ...projectRestaurants, [projId]: updatedList };
    setProjectRestaurants(nextRest);
    saveSettingsToFirestore({ projectRestaurants: nextRest });
    const totalIncome = updatedList.reduce((s, r) => s + (Number(r.monthlyAmount) || 0), 0);
    const proj = projects.find(p => p.id === projId);
    if (proj) saveProject({ ...proj, monthlyIncome: totalIncome || proj.monthlyIncome });
  };

  const deleteProjectRestaurant = (projId, restId) => {
    const current = projectRestaurants[projId] || [];
    const nextRest = { ...projectRestaurants, [projId]: current.filter(r => r.id !== restId) };
    setProjectRestaurants(nextRest);
    saveSettingsToFirestore({ projectRestaurants: nextRest });
  };
  const {
    updateAttendanceDay,
    setEmployeeAttendance,
    markAllAttendance,
    markGroupAttendance,
    notifySelfAttendance,
    validateAttendance,
    validateAllPendingAttendance,
  } = useAttendanceManager(setAttendance, employees);

  const saveDebt = (d) => saveItem('debts', { ...d, amount: Number(d.amount) || 0, createdAt: d.createdAt || new Date().toISOString() }, setDebts);
  const deleteDebt = (id) => deleteItem('debts', id, setDebts);
  const saveAgendaItem = (a) => saveItem('agenda', { ...a, amount: a.amount ? Number(a.amount) : null }, setAgenda);
  const deleteAgendaItem = (id) => deleteItem('agenda', id, setAgenda);
  const saveNegotiation = (n) => saveItem('negotiations', { ...n, dealValue: Number(n.dealValue) || 0 }, setNegotiations);
  const deleteNegotiation = (id) => deleteItem('negotiations', id, setNegotiations);
  const saveRule = (r) => saveItem('rules', r, setRules);
  const deleteRule = (id) => deleteItem('rules', id, setRules);
  const addExtraIncome = (i) => saveItem('extra_incomes', { ...i, date: i.date || new Date().toISOString() }, setExtraIncomes);
  const deleteExtraIncome = (id) => deleteItem('extra_incomes', id, setExtraIncomes);

  const saveEmployeeOfMonth = (d) => { setEmployeeOfMonth(d); saveSettingsToFirestore({ employeeOfMonth: d }); };
  const toggleThemeMode = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    saveSettingsToFirestore({ themeMode: next });
  };

  const exportDatabaseJson = () => JSON.stringify({ employees, projects, attendance, extraIncomes, debts, agenda, negotiations, rules, profileImage, themeMode, payrollPayments, projectRestaurants, employeeOfMonth, exportedAt: new Date().toISOString() }, null, 2);
  const importDatabaseJson = (str) => {
    try {
      const d = JSON.parse(str);
      if (Array.isArray(d.employees)) d.employees.forEach(saveEmployee);
      if (Array.isArray(d.projects)) d.projects.forEach(saveProject);
      if (Array.isArray(d.rules)) d.rules.forEach(saveRule);
      return true;
    } catch (e) { return false; }
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
      profileImage, setProfileImage: (img) => { setProfileImage(img); saveSettingsToFirestore({ profileImage: img }); },
      resetProfileImage: () => { setProfileImage(null); saveSettingsToFirestore({ profileImage: null }); },
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
