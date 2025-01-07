import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const HistoricalTracking = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [historicalData, setHistoricalData] = useState([]);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [achievedMilestone, setAchievedMilestone] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [showInsightPopup, setShowInsightPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sustainabilityGoals] = useState([
    { id: 1, text: 'Reduce car usage by 10% in a week', completed: true },
    { id: 2, text: 'Reduce your carbon footprint by 5% in a week', completed: true },
    { id: 3, text: 'Use public transport, walk, or bike for a day', completed: true }
  ]);

  const [milestones] = useState([
    { id: 1, name: 'First Week Complete', description: 'Complete your first week of tracking', achieved: false },
    { id: 2, name: '10% Reduction Achieved', description: 'Reduce your carbon footprint by 10%', achieved: false },
    { id: 3, name: 'Consistent Logger', description: 'Log your activities for 30 days straight', achieved: false },
    { id: 4, name: 'Green Champion', description: 'Achieve all weekly goals', achieved: false }
  ]);

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Using the correct endpoint
      const response = await axios.get(`http://localhost:5000/api/historical/data?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setHistoricalData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to load historical data. Please try again later.');
      setLoading(false);
    }
  };
  const handleDataPointClick = (data) => {
    if (data && data.activePayload) {
      setSelectedDataPoint(data.activePayload[0].payload);
      setShowInsightPopup(true);
    }
  };

  // Achievement Popup Component
  const AchievementPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
          <p className="mb-4">
            {achievedMilestone?.description || 'Your goal has been achieved!'}
          </p>
          <button
            onClick={() => setShowAchievementPopup(false)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Insight Popup Component
  const InsightPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Emission Insights</h3>
          {selectedDataPoint && (
            <div className="text-left">
              <p className="mb-2">Date: {selectedDataPoint.date}</p>
              <p className="mb-2">Transportation: {selectedDataPoint.transportation.toFixed(2)} kg CO2</p>
              <p className="mb-2">Energy: {selectedDataPoint.energy.toFixed(2)} kg CO2</p>
              <p className="mb-2">Food: {selectedDataPoint.dietary.toFixed(2)} kg CO2</p>
              <p className="mt-4 font-semibold">
                {calculateInsight(selectedDataPoint)}
              </p>
            </div>
          )}
          <button
            onClick={() => setShowInsightPopup(false)}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const calculateInsight = (dataPoint) => {
    const total = dataPoint.transportation + dataPoint.energy + dataPoint.dietary;
    const categories = {
      transportation: dataPoint.transportation,
      energy: dataPoint.energy,
      dietary: dataPoint.dietary
    };
    const highestCategory = Object.entries(categories)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return `Your highest emission source is ${highestCategory}, contributing ${Math.round((categories[highestCategory]/total) * 100)}% of your total emissions for this day.`;
  };

  // Graph View
  const GraphView = () => (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Historical Tracking</h2>
        <button
          onClick={() => setShowMilestones(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          View Milestones
        </button>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                timeRange === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : historicalData.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={historicalData}
              onClick={handleDataPointClick}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'CO2 Emissions (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar 
                dataKey="transportation" 
                name="Transportation" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="energy" 
                name="Energy" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="dietary" 
                name="Food" 
                fill="#F59E0B" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-700">
            No historical data available. Start tracking your activities to see your progress!
          </p>
        </div>
      )}
    </div>
  );

  // Milestones View
  const MilestonesView = () => (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Milestones</h2>
        <button
          onClick={() => setShowMilestones(false)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Back to Graph
        </button>
      </div>

      {/* Sustainability Goals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Sustainability Goals</h3>
        <div className="space-y-2">
          {sustainabilityGoals.map(goal => (
            <div key={goal.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>{goal.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Milestones List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map(milestone => (
            <div 
              key={milestone.id} 
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <h4 className="font-semibold">{milestone.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
              {milestone.achieved && (
                <span className="text-sm text-green-600 mt-2 inline-block">Achieved!</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Main Content */}
      {showMilestones ? <MilestonesView /> : <GraphView />}

      {/* Achievement Popup */}
      {showAchievementPopup && <AchievementPopup />}

      {/* Insight Popup */}
      {showInsightPopup && <InsightPopup />}
    </div>
  );
};

export default HistoricalTracking;
