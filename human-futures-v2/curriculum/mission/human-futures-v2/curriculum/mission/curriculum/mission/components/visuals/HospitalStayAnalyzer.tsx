import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HospitalStayAnalyzer = () => {
  const [customData, setCustomData] = useState('3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 22, 25, 30, 35, 42');
  const [outlierRule, setOutlierRule] = useState('iqr');
  const [showOutliers, setShowOutliers] = useState(true);

  // Generate sample datasets
  const generateSkewedData = () => {
    const data = [];
    // Most stays are short (1-10 days)
    for (let i = 0; i < 15; i++) {
      data.push(Math.floor(Math.random() * 10) + 1);
    }
    // Some medium stays (10-20 days)
    for (let i = 0; i < 8; i++) {
      data.push(Math.floor(Math.random() * 10) + 10);
    }
    // Few long stays (20-60 days) - creates right skew
    for (let i = 0; i < 4; i++) {
      data.push(Math.floor(Math.random() * 40) + 20);
    }
    // Very rare extremely long stays
    if (Math.random() > 0.5) {
      data.push(Math.floor(Math.random() * 30) + 60);
    }
    return data.sort((a, b) => a - b);
  };

  const generateNormalData = () => {
    const data = [];
    const mean = 12;
    const std = 4;
    
    for (let i = 0; i < 25; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = Math.max(1, Math.round(mean + std * z));
      data.push(value);
    }
    return data.sort((a, b) => a - b);
  };

  // Parse data from input
  const parseData = (dataString) => {
    return dataString
      .split(',')
      .map(x => parseFloat(x.trim()))
      .filter(x => !isNaN(x))
      .sort((a, b) => a - b);
  };

  const data = useMemo(() => parseData(customData), [customData]);

  // Calculate five-number summary
  const fiveNumberSummary = useMemo(() => {
    if (data.length === 0) return null;
    
    const getQuartile = (arr, q) => {
      const pos = (arr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
      } else {
        return arr[base];
      }
    };

    const min = data[0];
    const q1 = getQuartile(data, 0.25);
    const median = getQuartile(data, 0.5);
    const q3 = getQuartile(data, 0.75);
    const max = data[data.length - 1];
    const iqr = q3 - q1;

    return { min, q1, median, q3, max, iqr };
  }, [data]);

  // Calculate outliers
  const outliers = useMemo(() => {
    if (!fiveNumberSummary) return { iqrOutliers: [], sdOutliers: [] };
    
    const { q1, q3, iqr } = fiveNumberSummary;
    
    // IQR rule: values outside Q1 - 1.5*IQR to Q3 + 1.5*IQR
    const iqrLower = q1 - 1.5 * iqr;
    const iqrUpper = q3 + 1.5 * iqr;
    const iqrOutliers = data.filter(x => x < iqrLower || x > iqrUpper);
    
    // 2 Standard Deviations rule
    const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);
    const sdLower = mean - 2 * std;
    const sdUpper = mean + 2 * std;
    const sdOutliers = data.filter(x => x < sdLower || x > sdUpper);
    
    return { 
      iqrOutliers, 
      sdOutliers, 
      iqrBounds: { lower: iqrLower, upper: iqrUpper },
      sdBounds: { lower: sdLower, upper: sdUpper }
    };
  }, [data, fiveNumberSummary]);

  // Create histogram data
  const histogramData = useMemo(() => {
    if (data.length === 0) return [];
    
    const max = Math.max(...data);
    const binSize = Math.max(1, Math.ceil(max / 10));
    const bins = {};
    
    data.forEach(value => {
      const bin = Math.floor(value / binSize) * binSize;
      bins[bin] = (bins[bin] || 0) + 1;
    });
    
    return Object.entries(bins)
      .map(([bin, count]) => ({
        range: `${bin}-${parseInt(bin) + binSize - 1}`,
        count,
        binStart: parseInt(bin)
      }))
      .sort((a, b) => a.binStart - b.binStart);
  }, [data]);

  const currentOutliers = outlierRule === 'iqr' ? outliers.iqrOutliers : outliers.sdOutliers;
  const currentBounds = outlierRule === 'iqr' ? outliers.iqrBounds : outliers.sdBounds;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hospital Stay Data Analyzer</h1>
        <p className="text-gray-600">Explore skewed data, five-number summaries, and outlier detection methods</p>
      </div>

      {/* Data Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">Data Input</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Stay Durations (days):
              </label>
              <textarea
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows="3"
                placeholder="Enter comma-separated values (e.g., 3, 5, 7, 12, 25, 30)"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCustomData(generateSkewedData().join(', '))}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Generate Skewed Data
              </button>
              <button
                onClick={() => setCustomData(generateNormalData().join(', '))}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Generate Normal Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-purple-800">Analysis Controls</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outlier Detection Rule:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="iqr"
                    checked={outlierRule === 'iqr'}
                    onChange={(e) => setOutlierRule(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">IQR Rule (Q1 - 1.5×IQR, Q3 + 1.5×IQR)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="2sd"
                    checked={outlierRule === '2sd'}
                    onChange={(e) => setOutlierRule(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">2 Standard Deviations (μ ± 2σ)</span>
                </label>
              </div>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOutliers}
                onChange={(e) => setShowOutliers(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Highlight Outliers</span>
            </label>
          </div>
        </div>
      </div>

      {data.length > 0 && fiveNumberSummary && (
        <>
          {/* Five Number Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Five-Number Summary</h2>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-blue-600">{fiveNumberSummary.min}</div>
                <div className="text-sm text-gray-600">Minimum</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-green-600">{fiveNumberSummary.q1.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Q1 (25th)</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-purple-600">{fiveNumberSummary.median.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Median (Q2)</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-orange-600">{fiveNumberSummary.q3.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Q3 (75th)</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-red-600">{fiveNumberSummary.max}</div>
                <div className="text-sm text-gray-600">Maximum</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-600">
                IQR = Q3 - Q1 = {fiveNumberSummary.iqr.toFixed(1)} days
              </span>
            </div>
          </div>

          {/* Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Box Plot */}
            <div className="bg-white p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Box Plot</h3>
              <div className="relative h-32">
                <svg width="100%" height="100%" viewBox="0 0 400 120">
                  {/* Scale */}
                  {(() => {
                    const padding = 40;
                    const width = 400 - 2 * padding;
                    const min = Math.min(...data);
                    const max = Math.max(...data);
                    const range = max - min;
                    const scale = (value) => padding + ((value - min) / range) * width;
                    
                    const q1Pos = scale(fiveNumberSummary.q1);
                    const medianPos = scale(fiveNumberSummary.median);
                    const q3Pos = scale(fiveNumberSummary.q3);
                    const minPos = scale(fiveNumberSummary.min);
                    const maxPos = scale(fiveNumberSummary.max);
                    
                    const whiskerMin = showOutliers 
                      ? scale(Math.max(fiveNumberSummary.min, currentBounds.lower))
                      : minPos;
                    const whiskerMax = showOutliers 
                      ? scale(Math.min(fiveNumberSummary.max, currentBounds.upper))
                      : maxPos;

                    return (
                      <g>
                        {/* Whiskers */}
                        <line x1={whiskerMin} y1="60" x2={q1Pos} y2="60" stroke="#666" strokeWidth="1" />
                        <line x1={q3Pos} y1="60" x2={whiskerMax} y2="60" stroke="#666" strokeWidth="1" />
                        <line x1={whiskerMin} y1="50" x2={whiskerMin} y2="70" stroke="#666" strokeWidth="1" />
                        <line x1={whiskerMax} y1="50" x2={whiskerMax} y2="70" stroke="#666" strokeWidth="1" />
                        
                        {/* Box */}
                        <rect 
                          x={q1Pos} 
                          y="40" 
                          width={q3Pos - q1Pos} 
                          height="40" 
                          fill="lightblue" 
                          stroke="#333" 
                          strokeWidth="2"
                        />
                        
                        {/* Median line */}
                        <line x1={medianPos} y1="40" x2={medianPos} y2="80" stroke="#333" strokeWidth="3" />
                        
                        {/* Outliers */}
                        {showOutliers && currentOutliers.map((outlier, i) => (
                          <circle 
                            key={i}
                            cx={scale(outlier)} 
                            cy="60" 
                            r="3" 
                            fill="red" 
                            stroke="#333" 
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Scale labels */}
                        <text x={minPos} y="95" textAnchor="middle" fontSize="10" fill="#666">
                          {fiveNumberSummary.min}
                        </text>
                        <text x={maxPos} y="95" textAnchor="middle" fontSize="10" fill="#666">
                          {fiveNumberSummary.max}
                        </text>
                        <text x={medianPos} y="25" textAnchor="middle" fontSize="10" fill="#333" fontWeight="bold">
                          {fiveNumberSummary.median.toFixed(1)}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Histogram */}
            <div className="bg-white p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Distribution</h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outlier Analysis */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 text-yellow-800">Outlier Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-blue-700 mb-2">IQR Rule</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Outliers: {outliers.iqrOutliers.length > 0 ? outliers.iqrOutliers.join(', ') : 'None'}
                </p>
                <p className="text-sm text-gray-600">
                  Range: {outliers.iqrBounds.lower.toFixed(1)} to {outliers.iqrBounds.upper.toFixed(1)} days
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-green-700 mb-2">2 Standard Deviations</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Outliers: {outliers.sdOutliers.length > 0 ? outliers.sdOutliers.join(', ') : 'None'}
                </p>
                <p className="text-sm text-gray-600">
                  Range: {outliers.sdBounds.lower.toFixed(1)} to {outliers.sdBounds.upper.toFixed(1)} days
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Key Insights:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dataset has {data.length} hospital stays ranging from {fiveNumberSummary.min} to {fiveNumberSummary.max} days</li>
                <li>• The median stay is {fiveNumberSummary.median.toFixed(1)} days, showing the typical patient experience</li>
                <li>• {outlierRule === 'iqr' ? 'IQR rule' : '2SD rule'} identifies {currentOutliers.length} outlier(s): 
                  {currentOutliers.length > 0 ? ` ${currentOutliers.join(', ')} days` : ' none'}
                </li>
                <li>• {fiveNumberSummary.median > (fiveNumberSummary.min + fiveNumberSummary.max) / 2 ? 
                  'Right-skewed: Most stays are short with some very long stays' : 
                  'Roughly symmetric distribution of stay lengths'}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HospitalStayAnalyzer;