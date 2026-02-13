// Smart date formatting utility

export const formatYearSmart = (year: number): string => {
  const abs = Math.abs(year);
  
  // Millions of years ago (Ma)
  if (abs >= 1000000) {
    const val = abs / 1000000;
    // Remove trailing zeros, max 2 decimals
    return `${parseFloat(val.toFixed(2))} Ma`;
  }
  
  // Thousands of years ago (ka) - usually for pre-history before 10k BC
  if (abs >= 10000) {
    const val = abs / 1000;
    return `${parseFloat(val.toFixed(1))}k ya`;
  }
  
  // Standard History
  if (year < 0) {
    return `${abs} BC`;
  }
  
  if (year === 0) return '1 AD';
  
  return `${year} AD`;
};
