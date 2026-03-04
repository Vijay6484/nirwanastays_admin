import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : trend === 'down' ? (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        ) : null}
        <div
          className={`text-sm font-medium ${
            trend === 'up'
              ? 'text-green-600'
              : trend === 'down'
              ? 'text-red-600'
              : 'text-gray-500'
          }`}
        >
          {change}
        </div>
        <span className="text-sm text-gray-500 ml-1">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;
