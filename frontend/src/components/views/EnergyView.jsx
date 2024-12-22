// src/components/views/EnergyView.jsx
// import react
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { getImpactLevel } from '../../utils/impactLevels';

const EMISSION_FACTORS = {
  coal: 0.9,
  natural_gas: 0.5,
  solar: 0.05,
  wind: 0.02
};

const EnergyView = ({ data, todayData }) => {
  // Calculate historical data
  const historyData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    emissions: item.energy.amount * EMISSION_FACTORS[item.energy.type],
    consumption: item.energy.amount,
    source: item.energy.type
  }));

  // Calculate summary statistics
  const totalEmissions = data.reduce((acc, item) => 
    acc + (item.energy.amount * EMISSION_FACTORS[item.energy.type]), 0);
  const totalConsumption = data.reduce((acc, item) => acc + item.energy.amount, 0);
  const averageDaily = totalEmissions / data.length;

  // Calculate source distribution
  const sourceDistribution = data.reduce((acc, item) => {
    const source = item.energy.type;
    acc[source] = (acc[source] || 0) + (item.energy.amount * EMISSION_FACTORS[source]);
    return acc;
  }, {});

  // Calculate today's impact level
  const todayEmissions = todayData.energy?.amount * 
    EMISSION_FACTORS[todayData.energy?.type] || 0;
  const impactLevel = getImpactLevel(
    (todayEmissions / averageDaily) * 100, 
    'energy'
  );

  // Format source distribution for bar chart
  const sourceData = Object.entries(sourceDistribution).map(([source, emissions]) => ({
    source: source.replace('_', ' '),
    emissions: Number(emissions.toFixed(2))
  }));

  return (
    <div className="space-y-6" data-testid="energy-view">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="energy-summary">
        <div className="bg-white p-4 rounded-lg shadow" data-testid="energy-total-emissions">
          <h4 className="text-sm font-medium text-gray-600">Total Emissions</h4>
          <p className="text-2xl font-bold text-blue-600">
            {totalEmissions.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Period total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="energy-daily-average">
          <h4 className="text-sm font-medium text-gray-600">Daily Average</h4>
          <p className="text-2xl font-bold text-green-600">
            {averageDaily.toFixed(2)} kg CO2e
          </p>
          <p className="text-sm text-gray-500">Per day</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow" data-testid="energy-total-consumption">
          <h4 className="text-sm font-medium text-gray-600">Total Consumption</h4>
          <p className="text-2xl font-bold text-purple-600">
            {totalConsumption.toFixed(1)} kWh
          </p>
          <p className="text-sm text-gray-500">All sources</p>
        </div>
      </div>

      {/* Today's Details */}
      <div className="bg-white rounded-lg shadow p-6" data-testid="energy-today">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Today's Energy Usage</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="energy-source">
            <p className="text-sm text-gray-600">Source</p>
            <p className="font-medium capitalize">
              {(todayData.energy?.type || 'Not recorded').replace('_', ' ')}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="energy-consumption">
            <p className="text-sm text-gray-600">Consumption</p>
            <p className="font-medium">
              {todayData.energy?.amount?.toFixed(1) || '0'} kWh
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg" data-testid="energy-emissions">
            <p className="text-sm text-gray-600">Emissions</p>
            <p className="font-medium">
              {todayEmissions.toFixed(2)} kg CO2e
            </p>
          </div>
          <div 
            className={`p-3 rounded-lg ${impactLevel.color}`}
            data-testid="energy-impact-level"
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
        <div className="bg-white rounded-lg shadow p-6" data-testid="energy-history-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Energy Usage History
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
                  dataKey="consumption" 
                  stroke="#10B981" 
                  name="Consumption (kWh)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="energy-source-chart">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Emissions by Source
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} kg CO2e`} />
                <Bar dataKey="emissions" fill="#3B82F6" name="CO2 Emissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyView;
