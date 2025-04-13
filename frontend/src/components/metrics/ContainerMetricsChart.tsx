
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Button } from '../ui/button';
import { Clock } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  cpu: number;
  memory: number;
}

interface ContainerMetricsChartProps {
  data: ChartDataPoint[];
  containerName: string;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="custom-tooltip bg-metricly-background border border-metricly-secondary/50 rounded-md p-3 shadow-md">
      <p className="font-medium text-xs mb-2 pb-1 border-b border-metricly-secondary/30">
        Time: {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs">
            {entry.name}: <span className="font-medium">{Number(entry.value).toFixed(1)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function ContainerMetricsChart({ data, containerName, timeRange, onTimeRangeChange }: ContainerMetricsChartProps) {

  return (
    <div className="bg-metricly-secondary rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Clock size={16} className="mr-2" />
          {containerName} metrics
        </h3>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === '1h' ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange('1h')}
            className="h-7 px-2 text-xs"
          >
            1H
          </Button>
          <Button
            variant={timeRange === '6h' ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange('6h')}
            className="h-7 px-2 text-xs"
          >
            6H
          </Button>
          <Button
            variant={timeRange === '24h' ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange('24h')}
            className="h-7 px-2 text-xs"
          >
            24H
          </Button>
        </div>
      </div>

      <div className="h-[240px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-metricly-accent mb-2">No metrics data available</div>
              <p className="text-xs text-muted-foreground">Try selecting a different time range or container</p>
            </div>
          </div>
        ) : (
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
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 10 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="Memory Usage"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
