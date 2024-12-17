// src/pages/Recommendations.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HIGH_IMPACT_THRESHOLD = 40;

// Tips yang lebih terperinci dan personal
const IMPROVEMENT_TIPS = {
  transportation: {
    high: [
      {
        title: 'Public Transportation',
        description: 'Switch to public transportation to reduce your significant transportation emissions. Your recent travel patterns suggest potential for 50% reduction.',
        impact: 'High Impact',
        timeframe: 'Immediate',
        savingPotential: '2-3 kg CO2e per day'
      },
      {
        title: 'Carpooling Initiative',
        description: 'Based on your regular routes, carpooling could significantly reduce your emissions.',
        impact: 'Medium Impact',
        timeframe: 'Within a week',
        savingPotential: '1.5 kg CO2e per day'
      }
    ],
    normal: [
      {
        title: 'Active Transport Options',
        description: 'For trips under 5km, consider walking or cycling. Your travel patterns show several short trips that could be converted.',
        impact: 'Medium Impact',
        timeframe: 'Gradual',
        savingPotential: '0.5-1 kg CO2e per trip'
      }
    ]
  },
  energy: {
    high: [
      {
        title: 'Energy Efficiency Upgrade',
        description: 'Your energy consumption pattern suggests high usage during peak hours. Consider smart home solutions.',
        impact: 'High Impact',
        timeframe: 'Long-term',
        savingPotential: '30% reduction in energy emissions'
      },
      {
        title: 'Peak Hour Usage',
        description: 'Shift energy-intensive activities to off-peak hours based on your usage pattern.',
        impact: 'Medium Impact',
        timeframe: 'Immediate',
        savingPotential: '15% reduction in daily energy cost'
      }
    ],
    normal: [
      {
        title: 'Optimize Current Usage',
        description: 'Your energy use is moderate. Further optimize by using natural lighting during your typical active hours.',
        impact: 'Low Impact',
        timeframe: 'Ongoing',
        savingPotential: '5-10% reduction possible'
      }
    ]
  },
  diet: {
    high: [
      {
        title: 'Plant-Based Transition',
        description: 'Your dietary choices show high emissions. Gradually replace high-impact meals with plant-based alternatives.',
        impact: 'High Impact',
        timeframe: 'Gradual',
        savingPotential: '40% reduction in dietary emissions'
      },
      {
        title: 'Local Sourcing',
        description: 'Choose local and seasonal products to reduce transportation emissions from food.',
        impact: 'Medium Impact',
        timeframe: 'Immediate',
        savingPotential: '20% reduction in food-related emissions'
      }
    ],
    normal: [
      {
        title: 'Sustainable Choices',
        description: 'Your diet is relatively sustainable. Consider trying new plant-based options to further reduce impact.',
        impact: 'Low Impact',
        timeframe: 'Flexible',
        savingPotential: '10% additional reduction possible'
      }
    ]
  }
};

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('transportation');
  const [data, setData] = useState({
    activities: [],
    summary: {},
    trends: {},
    insights: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const [recentRes, summaryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/activities/recent', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/activities/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (recentRes.data.success && summaryRes.data.success) {
        setData({
          activities: recentRes.data.activities,
          summary: summaryRes.data.summary,
          trends: summaryRes.data.trends,
          insights: generateInsights(recentRes.data.activities)
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Recommendations error:', error);
      setError('Failed to fetch recommendations');
      setIsLoading(false);
    }
  };

  // To able generate insights for activities
  const generateInsights = (activities) => {
    if (!activities.length) return {};

    const categoryInsights = {
      transportation: { total: 0, frequent_mode: '', improvement_potential: 0 },
      energy: { total: 0, peak_usage: false, efficiency_score: 0 },
      diet: { total: 0, sustainable_choices: 0, impact_level: '' }
    };

    activities.forEach(activity => {
      // Calculate category-specific insights
      if (activity.transportation) {
        categoryInsights.transportation.total += activity.transportation.emissions;
      }
      if (activity.energy) {
        categoryInsights.energy.total += activity.energy.emissions;
      }
      if (activity.diet) {
        categoryInsights.diet.total += activity.diet.emissions;
      }
    });

    return categoryInsights;
  };

  const getRecommendations = (category) => {
    const impact = data.summary?.[category]?.percentage || 0;
    return IMPROVEMENT_TIPS[category][impact > HIGH_IMPACT_THRESHOLD ? 'high' : 'normal'];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen" data-testid="recommendations-loading">
        <div className="text-lg text-gray-600">Analyzing your activity patterns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen" data-testid="recommendations-error">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="recommendations-container">
      {/* Header with Overall Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Personalized Insights
        </h2>
      </div>

      {/* Recent Activities Analysis */}
      <div className="mb-8 bg-white rounded-lg shadow p-6" data-testid="recent-activities">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.activities.slice(0, 3).map((activity, index) => (
            <div 
              key={index} 
              className="bg-blue-50 p-4 rounded-lg"
              data-testid={`activity-${index}`}
            >
              <p className="font-medium text-blue-900">
                {new Date(activity.date).toLocaleDateString()}
              </p>
              <div className="mt-2 space-y-1">
                {activity.transportation && (
                  <p className="text-sm text-blue-700">
                     {activity.transportation.type}: {activity.transportation.emissions.toFixed(2)} kg CO2e
                  </p>
                )}
                {activity.energy && (
                  <p className="text-sm text-blue-700">
                     {activity.energy.type}: {activity.energy.emissions.toFixed(2)} kg CO2e
                  </p>
                )}
                {activity.diet && (
                  <p className="text-sm text-blue-700">
                     {activity.diet.type}: {activity.diet.emissions.toFixed(2)} kg CO2e
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['Transportation', 'Energy', 'Diet'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.toLowerCase()
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Detailed Analysis and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Impact Analysis */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="impact-analysis">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Impact Analysis</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Impact Level</span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                data.summary[activeTab]?.percentage > HIGH_IMPACT_THRESHOLD 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {data.summary[activeTab]?.percentage > HIGH_IMPACT_THRESHOLD ? 'High Impact' : 'Moderate Impact'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recent Trend</span>
              <span className={`font-medium ${
                data.trends[activeTab]?.direction === 'decreasing' 
                  ? 'text-green-600'
                  : data.trends[activeTab]?.direction === 'increasing'
                    ? 'text-red-600'
                    : 'text-blue-600'
              }`}>
                {data.trends[activeTab]?.direction === 'decreasing' ? '↓ Improving' :
                 data.trends[activeTab]?.direction === 'increasing' ? '↑ Increasing' : '→ Stable'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contribution to Total</span>
              <span className="font-medium">
                {data.summary[activeTab]?.percentage}% of total emissions
              </span>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-lg shadow p-6" data-testid="recommendations">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Personalized Action Plan
          </h4>
          <div className="space-y-4">
            {getRecommendations(activeTab).map((tip, index) => (
              <div 
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
                data-testid={`tip-${index}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-blue-900">{tip.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tip.impact === 'High Impact' 
                      ? 'bg-red-100 text-red-800'
                      : tip.impact === 'Medium Impact'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {tip.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Timeframe: {tip.timeframe}</span>
                  <span>Potential Saving: {tip.savingPotential}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-sm text-gray-500">
        Copyright © 2024 | All Rights Reserved<br />
        Developed by HELP University x STIKOM Students for BIT216 - Software Engineering Principles
      </div>
    </div>
  );
};

export default Recommendations;
