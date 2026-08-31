/**
 * Calculates payroll distributions dynamically based on available budget or percentage.
 */
export const calculateDynamicPayroll = ({
  employees = [],
  includeRent = false,
  rentAmount = 300,
  calculationMode = 'budget', // 'budget' | 'percentage'
  availableBudget = 0,
  targetPercentage = 30,
}) => {
  const activeEmployees = employees.filter(e => e.status !== 'inactive');
  const totalBaseSalary = activeEmployees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  // Effective budget for salaries
  let netBudget = Number(availableBudget) || 0;
  let rentToPay = 0;

  if (includeRent) {
    rentToPay = rentAmount;
    if (calculationMode === 'budget') {
      netBudget = Math.max(0, netBudget - rentToPay);
    }
  }

  let effectivePercentage = 0;
  if (calculationMode === 'percentage') {
    effectivePercentage = Math.max(0, Math.min(100, Number(targetPercentage) || 0));
  } else if (totalBaseSalary > 0) {
    effectivePercentage = Math.min(100, (netBudget / totalBaseSalary) * 100);
  }

  // Calculate each employee amount with rounding
  let totalDistributed = 0;
  let totalAdvancesDeducted = 0;

  const rows = activeEmployees.map((emp) => {
    const base = Number(emp.salary) || 0;
    const rawGross = (base * effectivePercentage) / 100;
    // Round to clean integer
    const grossPayment = Math.round(rawGross);
    const advances = Number(emp.advances) || 0;
    
    // Deduct advances up to the gross payment
    const advanceDeduction = Math.min(advances, grossPayment);
    const netPayment = Math.max(0, grossPayment - advanceDeduction);
    const remainingAdvance = advances - advanceDeduction;

    totalDistributed += netPayment;
    totalAdvancesDeducted += advanceDeduction;

    return {
      ...emp,
      baseSalary: base,
      grossPayment,
      advanceDeduction,
      netPayment,
      remainingAdvance,
      appliedPercentage: totalBaseSalary > 0 ? (grossPayment / base) * 100 : 0
    };
  });

  const totalPayrollOutflow = totalDistributed + rentToPay;

  return {
    rows,
    totalBaseSalary,
    effectivePercentage: Number(effectivePercentage.toFixed(2)),
    rentToPay,
    totalDistributed,
    totalAdvancesDeducted,
    totalPayrollOutflow,
    budgetRemaining: calculationMode === 'budget' ? Math.max(0, Number(availableBudget) - totalPayrollOutflow) : 0
  };
};
