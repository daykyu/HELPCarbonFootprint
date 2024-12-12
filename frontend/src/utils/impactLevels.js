// src/utils/impactLevels.js
const IMPACT_THRESHOLDS = {
    HIGH: 40,
    MEDIUM: 25
  };
  
  const getImpactLevel = (value, category = 'general') => {
    let thresholds = {
      transportation: { HIGH: 40, MEDIUM: 25 },
      energy: { HIGH: 40, MEDIUM: 25 },
      dietary: { HIGH: 40, MEDIUM: 25 },
      general: { HIGH: 40, MEDIUM: 25 }
    };
  
    const { HIGH, MEDIUM } = thresholds[category] || thresholds.general;
  
    // Pastikan value adalah angka
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      console.error('Invalid value provided to getImpactLevel:', value);
      return {
        level: 'Invalid',
        color: 'text-gray-600 bg-gray-50',
        dotColor: 'bg-gray-500',
        textClass: 'text-gray-600'
      };
    }
  
    if (numericValue >= HIGH) {
      return {
        level: 'High Impact',
        color: 'text-red-600 bg-red-50',
        dotColor: 'bg-red-500',
        textClass: 'text-red-600',
        testId: 'high-impact'
      };
    }
    if (numericValue >= MEDIUM) {
      return {
        level: 'Medium Impact',
        color: 'text-yellow-600 bg-yellow-50',
        dotColor: 'bg-yellow-500',
        textClass: 'text-yellow-600',
        testId: 'medium-impact'
      };
    }
    return {
      level: 'Low Impact',
      color: 'text-green-600 bg-green-50',
      dotColor: 'bg-green-500',
      textClass: 'text-green-600',
      testId: 'low-impact'
    };
  };
  
  // Helper function untuk testing
  const validateImpactLevel = (value, category) => {
    const impact = getImpactLevel(value, category);
    return {
      isValid: impact.level !== 'Invalid',
      impact
    };
  };
  
  export { IMPACT_THRESHOLDS, getImpactLevel, validateImpactLevel };