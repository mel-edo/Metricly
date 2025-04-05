import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from '../ui/button';
import { Clock } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

interface SystemMetricsChartProps {
  data: ChartDataPoint[];
}

export function SystemMetricsChart({ data }: SystemMetricsChartProps) {
  const [timeRange, setTimeRange] = useState('1h');
  
  return (
    <div className="bg-metricly-secondary rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Clock size={16} className="mr-2" />
          System Metrics History
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === '1h' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('1h')}
            className="h-7 px-2 text-xs"
          >
            1H
          </Button>
          <Button 
            variant={timeRange === '6h' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('6h')}
            className="h-7 px-2 text-xs"
          >
            6H
          </Button>
          <Button 
            variant={timeRange === '24h' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('24h')}
            className="h-7 px-2 text-xs"
          >
            24H
          </Button>
        </div>
      </div>
      
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
              domain={[0, 100]} 
              unit="%" 
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#1E1E2E', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#4ade80" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#60a5fa" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="disk" 
              stroke="#fbbf24" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}