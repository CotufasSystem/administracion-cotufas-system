import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { PayrollCalculator } from '../components/payroll/PayrollCalculator';
import { PayrollEmployeeRow } from '../components/payroll/PayrollEmployeeRow';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { calculateDynamicPayroll } from '../utils/payrollCalc';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/formatters';

export const PayrollScreen = () => {
  const { employees, saveEmployee, payrollPayments, recordPayrollPayment, deletePayrollPayment, clearOrApplyAdvances } = useApp();

  const [budgetInput, setBudgetInput] = useState('1400');
  const [calculationMode, setCalculationMode] = useState('budget');
  const [paymentDate, setPaymentDate] = useState(() => getLocalDateString(new Date()));
  const [targetPercentage, setTargetPercentage] = useState(30);
  const [includeRent, setIncludeRent] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAddEmployeeModal, setIsAddEmployeeModal] = useState(false);

  const totalBase = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const currentMonth = paymentDate.slice(0, 7);

  // Month payment tracking & Quincena 1 freeze detection
  const q1PaidInfo = useMemo(() => {
    const monthPayments = (payrollPayments || []).filter(p => (p.date || '').startsWith(currentMonth));
    const q1Payments = monthPayments.filter(p => {
      const dayNum = parseInt((p.date || '').slice(8, 10), 10);
      return dayNum <= 15;
    });

    const q1GrossTotal = q1Payments.reduce((sum, p) => sum + (Number(p.grossPayment) || 0), 0);
    const hasQ1Paid = q1Payments.length > 0 && q1GrossTotal > 0 && totalBase > 0;
    const q1Percent = hasQ1Paid ? Number(((q1GrossTotal / totalBase) * 100).toFixed(2)) : 30;
    const q2Percent = Number(Math.max(0, 100 - q1Percent).toFixed(2));

    return { hasQ1Paid, q1Percent, q2Percent, q1PaymentsCount: q1Payments.length };
  }, [payrollPayments, currentMonth, totalBase]);

  const handleApplyQuincenaPreset = (day) => {
    if (day === 5) {
      setCalculationMode('preset-05');
      setTargetPercentage(q1PaidInfo.q1Percent);
      setIncludeRent(false);
      setBudgetInput(String(Math.round(totalBase * (q1PaidInfo.q1Percent / 100))));
    } else if (day === 20) {
      setCalculationMode('preset-20');
      setTargetPercentage(q1PaidInfo.q2Percent);
      setIncludeRent(true);
      setBudgetInput(String(Math.round((totalBase * (q1PaidInfo.q2Percent / 100)) + 300)));
    }
  };

  const summaryData = useMemo(() => {
    return calculateDynamicPayroll({
      employees,
      includeRent,
      rentAmount: 300,
      calculationMode: calculationMode.startsWith('preset') ? 'percentage' : 'budget',
      availableBudget: Number(budgetInput) || 0,
      targetPercentage,
    });
  }, [employees, includeRent, calculationMode, budgetInput, targetPercentage]);

  const handleDeletePayment = (paymentId) => {
    const doDelete = () => deletePayrollPayment(paymentId);
    if (Platform.OS === 'web') {
      if (window.confirm('¿Anular este registro de pago?')) doDelete();
    } else {
      Alert.alert('Anular Pago', '¿Deseas anular este pago registrado?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Anular', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  const handlePayIndividual = (payData) => {
    const doPay = () => {
      recordPayrollPayment({ ...payData, date: paymentDate });
      if (payData.advanceDeduction > 0) {
        clearOrApplyAdvances(payData.empId, payData.advanceDeduction);
      }
      const msg = `¡Pago registrado para ${payData.empName} con fecha ${paymentDate}!`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Pago Registrado', msg);
    };

    const confirmMsg = `¿Confirmar pago de $${payData.netPayment} a ${payData.empName} con fecha ${paymentDate}?`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) doPay();
    } else {
      Alert.alert('Confirmar Pago', confirmMsg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: doPay }
      ]);
    }
  };

  const handlePayBonusStandalone = (bonusData) => {
    const doPayBonus = () => {
      recordPayrollPayment({
        empId: bonusData.empId,
        empName: bonusData.empName,
        baseSalary: 0,
        grossPayment: 0,
        advanceDeduction: 0,
        bonus: bonusData.bonus,
        netPayment: bonusData.bonus,
        isStandaloneBonus: true,
        note: 'Bono independiente fuera de nómina',
        date: paymentDate,
      });
      const msg = `¡Bono extra de $${bonusData.bonus} pagado a ${bonusData.empName} fuera de mensualidad!`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Bono Registrado', msg);
    };

    const confirmMsg = `¿Pagar Bono Extra independiente de $${bonusData.bonus} a ${bonusData.empName} fuera de mensualidad con fecha ${paymentDate}?`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) doPayBonus();
    } else {
      Alert.alert('Pagar Bono Extra', confirmMsg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar Bono', onPress: doPayBonus }
      ]);
    }
  };

  const handleConfirmAllPayroll = () => {
    const doApplyAll = () => {
      summaryData.rows.forEach((row) => {
        recordPayrollPayment({
          empId: row.id,
          empName: row.name,
          baseSalary: row.baseSalary,
          grossPayment: row.grossPayment,
          advanceDeduction: row.advanceDeduction || 0,
          bonus: Number(row.bonus) || 0,
          netPayment: row.netPayment,
          date: paymentDate,
        });
        if (row.advanceDeduction > 0) clearOrApplyAdvances(row.id, row.advanceDeduction);
      });
      const msg = `¡Nómina general procesada con fecha ${paymentDate}!`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Éxito', msg);
    };

    const confirmMsg = `¿Confirmar pago de nómina para los ${summaryData.rows.length} empleados con fecha ${paymentDate}?`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) doApplyAll();
    } else {
      Alert.alert('Confirmar Nómina', confirmMsg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar y Pagar a Todos', onPress: doApplyAll }
      ]);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <PrimaryButton title="Agregar Empleado" icon="person-add-outline" onPress={() => setIsAddEmployeeModal(true)} small />
      </View>

      <Card title="Calculadora Inteligente de Quincena" icon="calculator-outline">
        <PayrollCalculator
          budgetInput={budgetInput}
          setBudgetInput={setBudgetInput}
          calculationMode={calculationMode}
          setCalculationMode={setCalculationMode}
          targetPercentage={targetPercentage}
          setTargetPercentage={setTargetPercentage}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          includeRent={includeRent}
          setIncludeRent={setIncludeRent}
          summaryData={summaryData}
          onApplyQuincenaPreset={handleApplyQuincenaPreset}
          q1PaidInfo={q1PaidInfo}
        />
      </Card>

      <View style={styles.actionRowRight}>
        <PrimaryButton
          title={`Confirmar Pago a Todos (${summaryData.rows.length} Empleados) • Fecha: ${paymentDate}`}
          icon="checkmark-done-circle"
          variant="success"
          onPress={handleConfirmAllPayroll}
          small
        />
      </View>

      <Card title="Desglose y Pago Individual" icon="list-outline">
        {summaryData.rows.map((row) => {
          const recentPayment = (payrollPayments || []).find(p => p.empId === row.id && p.date === paymentDate);
          return (
            <PayrollEmployeeRow
              key={row.id}
              employee={row}
              onEditEmployee={setEditingEmployee}
              onPayIndividual={handlePayIndividual}
              onPayBonusStandalone={handlePayBonusStandalone}
              onDeletePayment={handleDeletePayment}
              isPaid={Boolean(recentPayment)}
              paymentRecord={recentPayment}
              paymentDate={paymentDate}
            />
          );
        })}
      </Card>

      <EmployeeModal
        visible={Boolean(editingEmployee || isAddEmployeeModal)}
        employee={editingEmployee}
        onClose={() => { setEditingEmployee(null); setIsAddEmployeeModal(false); }}
        onSave={saveEmployee}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: THEME.spacing.md, gap: THEME.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  actionRowRight: { flexDirection: 'row', justifyContent: 'stretch', alignItems: 'center', width: '100%' },
});
