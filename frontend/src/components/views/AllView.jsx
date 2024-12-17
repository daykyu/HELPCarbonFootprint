// src/components/views/AllView.jsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { getImpactLevel } from '../../utils/impactLevels';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6'];

const AllView = ({ footprintData }) => {
  // Sort and calculate impact levels
  const sortedBreakdown = Object.entries(footprintData.breakdown)
    .sort((a, b) => b[1].percentage - a[1].percentage)
    .map(([category, data]) => {
      const impact = getImpactLevel(data.percentage, category.toLowerCase());
      return {
        category,
        data,
        impact
      };
    });

  const barData = [
    {
      category: 'Transportation',
      value: footprintData.breakdown.transportation.annual,
      target: footprintData.target.goal / 3
    },
    {
      category: 'Energy',
      value: footprintData.breakdown.energy.annual,
      target: footprintData.target.goal / 3
    },
    {
      category: 'Dietary',
      value: footprintData.breakdown.dietary.annual,
      target: footprintData.target.goal / 3
    }
  ];

  const formatValue = (value) => {
    if (value === 0) return '0';
    return value < 0.01 ? '< 0.01' : value.toFixed(2);
  };

  return (
    <div className="space-y-6" data-testid="all-view-container">
      {/* Impact Summary with Legend */}
      <div className="bg-white p-6 rounded-lg shadow" data-testid="impact-summary">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Impact Summary</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2" data-testid="impact-legend-high">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">High: ≥40%</span>
            </div>
            <div className="flex items-center gap-2" data-testid="impact-legend-medium">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">Medium: 25-39%</span>
            </div>
            <div className="flex items-center gap-2" data-testid="impact-legend-low">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Low: &lt;25%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedBreakdown.map(({ category, data, impact }) => (
            <div 
              key={category} 
              className={`p-4 rounded-lg ${impact.color}`}
              data-testid={`impact-${category.toLowerCase()}`}
              data-impact-level={impact.testId}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium capitalize">{category}</h5>
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        impact.color.replace('bg-', 'border-')
                      }`}
                      data-testid={`impact-level-${category.toLowerCase()}`}
                    >
                      {impact.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatValue(data.daily)} {footprintData.current.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">{data.percentage}%</p>
                  <p className="text-xs text-gray-600">of total emissions</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${impact.dotColor}`}
                    style={{ width: `${data.percentage}%` }}
                    data-testid={`progress-${category.toLowerCase()}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annual Emissions Chart */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="annual-emissions-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Annual Emissions by Category
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${formatValue(value)} ${footprintData.projected.unit}`}
                />
                <Legend />
                <Bar dataKey="value" name="Current" fill="#3B82F6" />
                <Bar dataKey="target" name="Target" fill="#E5E7EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="daily-emissions-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Daily Emissions Distribution
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(footprintData.breakdown).map(([name, data]) => ({
                    name: name,
                    value: data.daily,
                    percentage: data.percentage
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${formatValue(value)} ${footprintData.current.unit}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllView;