import { Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { ProgressBar } from '../ProgressBar';

interface SystemData {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    mounts: Array<{ path: string; used: number; total: number }>;
  };
}

interface MetricsCardGridProps {
  systemData: SystemData;
  formatBytes: (bytes: number, decimals?: number) => string;
}

export function MetricsCardGrid({ systemData, formatBytes }: MetricsCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard title="CPU Usage" icon={<Cpu size={16} />}>
        <div className="space-y-3">
          <div className="text-2xl font-semibold">{systemData.cpu.usage}%</div>
          <ProgressBar 
            value={systemData.cpu.usage} 
            max={100} 
            className="mt-2" 
            tooltip={`${systemData.cpu.cores} Cores - ${systemData.cpu.model}`}
          />
        </div>
      </MetricCard>
      
      <MetricCard title="Memory Usage" icon={<MemoryStick size={16} />}>
        <div className="space-y-3">
          <div className="text-2xl font-semibold">{systemData.memory.percentage}%</div>
          <div className="text-xs text-muted-foreground">
            {formatBytes(systemData.memory.used)} / {formatBytes(systemData.memory.total)}
          </div>
          <ProgressBar 
            value={systemData.memory.used} 
            max={systemData.memory.total} 
            className="mt-2" 
          />
        </div>
      </MetricCard>
      
      <MetricCard title="Disk Usage" icon={<HardDrive size={16} />}>
        <div className="space-y-3">
          <div className="text-2xl font-semibold">{systemData.disk.percentage}%</div>
          <div className="text-xs text-muted-foreground">
            {formatBytes(systemData.disk.used)} / {formatBytes(systemData.disk.total)}
          </div>
          <ProgressBar 
            value={systemData.disk.used} 
            max={systemData.disk.total} 
            className="mt-2" 
          />
        </div>
      </MetricCard>
    </div>
  );
}