import { useState } from 'react';
import { formatBytes } from '../utils/formatUtils';
import { MetricsCardGrid } from './metrics/MetricsCardGrid';
import { DiskMountsSection } from './metrics/DiskMountsSection';
import { SystemMetricsChart } from './metrics/SystemMetricsChart';

const generateFakeHistoricalData = () => {
  const data = [];
  const now = new Date();

  for (let i = 60; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40) + 5,
      memory: Math.floor(Math.random() * 60) + 20,
      disk: Math.floor(Math.random() * 30) + 50,
    });
  }

  return data;
};

export function SystemOverview() {
  const [historicalData] = useState(generateFakeHistoricalData());

  const fakeSystemData = {
    cpu: {
      usage: 11.8,
      cores: 8,
      model: 'Intel Core i7-10700K'
    },
    memory: {
      used: 4.75 * 1024 * 1024 * 1024, // 4.75 GB in bytes
      total: 9.66 * 1024 * 1024 * 1024, // 9.66 GB in bytes
      percentage: 53.2
    },
    disk: {
      used: 60.49 * 1024 * 1024 * 1024, // 60.49 GB in bytes
      total: 75.16 * 1024 * 1024 * 1024, // 75.16 GB in bytes
      percentage: 80.5,
      mounts: [
        { path: '/boot/efi', used: 35.73, total: 256.0 },
        { path: '/home/meledo/Games', used: 66.24, total: 157.02 },
        { path: '/home/meledo/Homework', used: 318.21, total: 457.38 }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <MetricsCardGrid systemData={fakeSystemData} formatBytes={formatBytes} />
      <DiskMountsSection mounts={fakeSystemData.disk.mounts} formatBytes={formatBytes} />
      <SystemMetricsChart data={historicalData} />
    </div>
  );
}
