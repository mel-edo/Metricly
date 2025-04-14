import { useState, useEffect } from 'react';
import { formatBytes } from '../utils/formatUtils';
import { MetricsCardGrid } from './metrics/MetricsCardGrid';
import { DiskMountsSection } from './metrics/DiskMountsSection';
import { SystemMetricsChart } from './metrics/SystemMetricsChart';
import { useServer } from '../contexts/ServerContext';
import { getCurrentSystemMetrics, getServerMetrics, ServerMetrics } from '../services/servers';
import { useQuery } from '@tanstack/react-query';
import { CoolSpinner } from './ui/cool-spinner';

// Transform server metrics to chart data format
const transformMetricsToChartData = (metrics: ServerMetrics[]) => {
  return metrics.map(metric => ({
    time: new Date(metric.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    cpu: metric.cpu_percent,
    memory: metric.memory_info.percent,
    disk: Object.values(metric.disk_usage)[0]?.percent || 0,
  }));
};

export function SystemOverview() {
  const { activeServer } = useServer();
  const serverIp = activeServer?.ip_address || '127.0.0.1';

  // Fetch current system metrics
  const { data: currentMetrics, isLoading: isLoadingCurrent, error: currentError } = useQuery({
    queryKey: ['currentMetrics', serverIp],
    queryFn: () => getCurrentSystemMetrics(serverIp),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch historical metrics
  const { data: historicalMetrics, isLoading: isLoadingHistorical, error: historicalError } = useQuery({
    queryKey: ['historicalMetrics', serverIp],
    queryFn: () => getServerMetrics(serverIp, '1h'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process metrics for display
  const isLoading = isLoadingCurrent || isLoadingHistorical;
  const error = currentError || historicalError;

  // Transform historical metrics to chart data
  const chartData = historicalMetrics ? transformMetricsToChartData(historicalMetrics) : [];

  // Prepare system data for display
  const systemData = currentMetrics ? {
    cpu: {
      usage: currentMetrics.cpu_percent,
      cores: currentMetrics.cpu_count || 1,
      model: 'CPU'
    },
    memory: {
      used: currentMetrics.memory_info.used,
      total: currentMetrics.memory_info.total,
      percentage: currentMetrics.memory_info.percent
    },
    disk: {
      used: Object.values(currentMetrics.disk_usage)[0]?.used || 0,
      total: Object.values(currentMetrics.disk_usage)[0]?.total || 0,
      percentage: Object.values(currentMetrics.disk_usage)[0]?.percent || 0,
      mounts: Object.entries(currentMetrics.disk_usage).map(([path, info]) => ({
        path,
        used: info.used,
        total: info.total,
        percentage: info.percent
      }))
    }
  } : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-metricly-secondary rounded-lg flex items-center justify-center">
          <CoolSpinner size="lg" text="Loading system metrics..." variant="accent" />
        </div>
      </div>
    );
  }

  if (error || !systemData) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
        <p className="text-red-500">Error loading system metrics</p>
        <p className="text-sm text-red-400 mt-2">
          {error instanceof Error ? error.message : 'Failed to fetch metrics'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsCardGrid systemData={systemData} formatBytes={formatBytes} />
      {systemData.disk.mounts.length > 0 && (
        <DiskMountsSection mounts={systemData.disk.mounts} formatBytes={formatBytes} />
      )}
      <SystemMetricsChart data={chartData} isLoading={isLoadingHistorical} />
    </div>
  );
}
