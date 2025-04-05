import { ProgressBar } from '../ProgressBar';

interface DiskMount {
  path: string;
  used: number;
  total: number;
}

interface DiskMountsSectionProps {
  mounts: DiskMount[];
  formatBytes: (bytes: number, decimals?: number) => string;
}

export function DiskMountsSection({ mounts, formatBytes }: DiskMountsSectionProps) {
  if (!mounts.length) return null;
  
  return (
    <div className="bg-metricly-secondary rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Disk Mounts</h3>
      <div className="space-y-3">
        {mounts.map((mount, i) => (
          <ProgressBar 
            key={i}
            value={mount.used}
            max={mount.total}
            label={mount.path}
            tooltip={`${formatBytes(mount.used)} / ${formatBytes(mount.total)}`}
            showPercentage
          />
        ))}
      </div>
    </div>
  );
}
