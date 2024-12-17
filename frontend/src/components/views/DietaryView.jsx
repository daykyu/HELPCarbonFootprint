// src/components/views/DietaryView.jsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { getImpactLevel } from '../../utils/impactLevels';

const EMISSION_FACTORS = {
  meat_heavy: 7.2,
  balanced: 4.7,
  vegetarian: 3.3,
  vegan: 2.9
};

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

const DietaryView = ({ data, todayData }) => {
  // Calculate historical data
  const historyData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    emissions: EMISSION_FACTORS[item.dietary.type],
    type: item.dietary.type
  }));

  // Calculate summary statistics
  const totalEmissions = data.reduce((acc, item) => 
    acc + EMISSION_FACTORS[item.dietary.type], 0);
  const averageEmissions = totalEmissions / data.length;

  // Calculate diet type distribution
  const dietDistribution = data.reduce((acc, item) => {
    const type = item.dietary.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Calculate today's impact level
  const todayEmissions = EMISSION_FACTORS[todayData.dietary?.type] || 0;
  const impactLevel = getImpactLevel(
    (todayEmissions / EMISSION_FACTORS.meat_heavy) * 100,
    'dietary'
  );

  // Convert to pie chart data
  const pieData = Object.entries(dietDistribution).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count,
    percentage: ((count / data.length) * 100).toFixed(1)
  }));

  const relativeToAverage = todayEmissions ? 
    ((todayEmissions / averageEmissions - 1) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6" data-testid="dietary-view">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="dietary-summary">
        <div className="bg-white p-4 rounded-lg shadow" data-testid="dietary-total-emissions">
          <h4 className="text-sm font-medium text-gray-600">Total Emissions</h4>
          <p className="text-2xl font-bold text-blue-600">
            {totalEmissions.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Period total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="dietary-daily-average">
          <h4 className="text-sm font-medium text-gray-600">Daily Average</h4>
          <p className="text-2xl font-bold text-green-600">
            {averageEmissions.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Per day</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="dietary-common-type">
          <h4 className="text-sm font-medium text-gray-600">Most Common Diet</h4>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {Object.entries(dietDistribution)
              .sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ')}
          </p>
          <p className="text-sm text-gray-500">Highest frequency</p>
        </div>
      </div>

      {/* Today's Details */}
      <div className="bg-white rounded-lg shadow p-6" data-testid="dietary-today">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Today's Dietary Impact</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="dietary-type">
            <p className="text-sm text-gray-600">Diet Type</p>
            <p className="font-medium capitalize">
              {(todayData.dietary?.type || 'Not recorded').replace('_', ' ')}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="dietary-emissions">
            <p className="text-sm text-gray-600">Emissions</p>
            <p className="font-medium">
              {todayEmissions.toFixed(2)} kg CO2e
            </p>
          </div>
          <div 
            className={`p-3 rounded-lg ${impactLevel.color}`}
            data-testid="dietary-impact-level"
            data-impact={impactLevel.testId}
          >
            <p className="text-sm text-gray-600">Impact Level</p>
            <p className={`font-medium ${impactLevel.textClass}`}>
              {impactLevel.level}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="dietary-relative">
            <p className="text-sm text-gray-600">Relative to Average</p>
            <p className="font-medium">
              {relativeToAverage}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      
    </div>
  );
};

export default DietaryView;