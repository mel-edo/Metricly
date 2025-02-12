// src/hooks/useServerMetrics.js
import { useState, useEffect } from 'react';

export const useServerMetrics = (currentServer) => {
  const [metrics, setMetrics] = useState({
    system: null,
    docker: [],
    historical: [],
    alerts: [],
    isLoading: { system: true, docker: true }
  });

  const checkThresholds = (systemMetrics) => {
    const newAlerts = [];
    if (parseFloat(systemMetrics?.cpu_percent) > 90) {
      newAlerts.push(`High CPU Usage: ${systemMetrics.cpu_percent}`);
    }
    if (parseFloat(systemMetrics?.memory_info.percent) > 85) {
      newAlerts.push(`High Memory Usage: ${systemMetrics.memory_info.percent}`);
    }
    return newAlerts;
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentServer) return;

      try {
        // System metrics
        const systemRes = await fetch(`/metrics/system?server=${currentServer.ip_address}`);
        const systemData = await systemRes.json();
        
        // Docker metrics
        const dockerRes = await fetch(`/metrics/docker?server=${currentServer.ip_address}`);
        const dockerData = await dockerRes.json();

        // Historical metrics
        const historicalRes = await fetch(`/api/servers/${currentServer.ip_address}/metrics`);
        const historicalData = await historicalRes.json();

        setMetrics(prev => ({
          ...prev,
          system: systemData,
          docker: dockerData,
          historical: historicalData,
          alerts: [...checkThresholds(systemData), ...prev.alerts.slice(0, 4)],
          isLoading: { system: false, docker: false }
        }));

      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [currentServer]);

  return { ...metrics, setMetrics };
};