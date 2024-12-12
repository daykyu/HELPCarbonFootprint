// src/components/views/TransportationView.jsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { getImpactLevel } from '../../utils/impactLevels';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];
const EMISSION_FACTORS = {
  car: 0.2,
  bus: 0.08,
  motorcycle: 0.1,
  bicycle: 0,
  walking: 0
};

const TransportationView = ({ data, todayData }) => {
  // Prepare emissions history data
  const historyData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    emissions: item.transportation.distance * EMISSION_FACTORS[item.transportation.type],
    distance: item.transportation.distance,
    mode: item.transportation.type
  }));

  // Calculate mode distribution
  const modeDistribution = data.reduce((acc, item) => {
    const emissions = item.transportation.distance * EMISSION_FACTORS[item.transportation.type];
    acc[item.transportation.type] = (acc[item.transportation.type] || 0) + emissions;
    return acc;
  }, {});

  // Calculate totals and averages
  const totalEmissions = Object.values(modeDistribution).reduce((a, b) => a + b, 0);
  const totalDistance = data.reduce((acc, item) => acc + item.transportation.distance, 0);
  const averageEmissions = totalEmissions / data.length;

  // Calculate today's data and impact
  const todayEmissions = todayData.transportation?.distance * 
    EMISSION_FACTORS[todayData.transportation?.type] || 0;
  
  const impactLevel = getImpactLevel(
    (todayEmissions / (EMISSION_FACTORS.car * 50)) * 100, // Using car with 50km as baseline
    'transportation'
  );

  const pieData = Object.entries(modeDistribution)
    .filter(([_, value]) => value > 0)
    .map(([mode, emissions]) => ({
      name: mode,
      value: Number(emissions.toFixed(2))
    }));

  return (
    <div className="space-y-6" data-testid="transportation-view">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="transportation-summary">
        <div className="bg-white p-4 rounded-lg shadow" data-testid="transportation-total-emissions">
          <h4 className="text-sm font-medium text-gray-600">Total Emissions</h4>
          <p className="text-2xl font-bold text-blue-600">
            {totalEmissions.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Period total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="transportation-daily-average">
          <h4 className="text-sm font-medium text-gray-600">Average Daily</h4>
          <p className="text-2xl font-bold text-green-600">
            {averageEmissions.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Per day</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="transportation-total-distance">
          <h4 className="text-sm font-medium text-gray-600">Total Distance</h4>
          <p className="text-2xl font-bold text-purple-600">
            {totalDistance.toFixed(1)} km
          </p>
          <p className="text-sm text-gray-500">All modes combined</p>
        </div>
      </div>

      {/* Today's Details */}
      <div className="bg-white rounded-lg shadow p-6" data-testid="transportation-today">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Today's Transportation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="transportation-mode">
            <p className="text-sm text-gray-600">Mode</p>
            <p className="font-medium capitalize">
              {todayData.transportation?.type || 'Not recorded'}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="transportation-distance">
            <p className="text-sm text-gray-600">Distance</p>
            <p className="font-medium">
              {todayData.transportation?.distance?.toFixed(1) || '0'} km
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="transportation-emissions">
            <p className="text-sm text-gray-600">Emissions</p>
            <p className="font-medium">{todayEmissions.toFixed(2)} kg CO2e</p>
          </div>
          <div 
            className={`p-3 rounded-lg ${impactLevel.color}`}
            data-testid="transportation-impact-level"
            data-impact={impactLevel.testId}
          >
            <p className="text-sm text-gray-600">Impact Level</p>
            <p className={`font-medium ${impactLevel.textClass}`}>
              {impactLevel.level}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emissions History */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="transportation-history-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Emissions History
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg CO2e`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#3B82F6" 
                  name="CO2 Emissions" 
                />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#10B981" 
                  name="Distance (km)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode Distribution */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="transportation-mode-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Transport Mode Distribution
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value.toFixed(1)} kg CO2e)`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg CO2e`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationView;