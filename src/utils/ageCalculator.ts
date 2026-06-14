export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
}

export function calculateAge(dob: Date, referenceDate: Date = new Date()): AgeCalculationResult {
  let years = referenceDate.getFullYear() - dob.getFullYear();
  let months = referenceDate.getMonth() - dob.getMonth();
  let days = referenceDate.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
    days += previousMonthDate.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = (years * 12) + months + (days / 30); // Approximate fraction of month

  return {
    years,
    months,
    days,
    totalMonths
  };
}

// Determines eligible age class based on total exact months
export function getEligibleAgeClass(totalMonths: number, availableClasses: any[]) {
  // Returns all classes where the dog's age falls within the min/max limits
  return availableClasses.filter(cls => {
    const min = cls.minMonths !== null ? cls.minMonths : 0;
    const max = cls.maxMonths !== null ? cls.maxMonths : 999;
    return totalMonths >= min && totalMonths <= max;
  });
}
