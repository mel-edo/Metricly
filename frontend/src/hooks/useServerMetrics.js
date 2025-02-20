import { useState, useEffect } from "react";

export const useServerMetrics = (currentServer) => {
  const [metrics, setMetrics] = useState({
    system: null,
    docker: [],
    historical: [],
    alerts: [],
    isLoading: true
  });

  useEffect(() => {
    if (!currentServer) return;

    console.log("Fetching metrics for:", currentServer.ip_address);

    const fetchData = async () => {
      try {
        const systemRes = await fetch(`/metrics/system?server=${currentServer.ip_address}`);
        const systemData = systemRes.ok ? await systemRes.json() : {};

        const dockerRes = await fetch(`/metrics/docker?server=${currentServer.ip_address}`);
        const dockerData = dockerRes.ok ? await dockerRes.json() : [];

        const historicalRes = await fetch(`/metrics/servers/${currentServer.ip_address}/metrics`);
        const historicalData = historicalRes.ok ? await historicalRes.json() : [];

        setMetrics({
          system: systemData,
          docker: dockerData,
          historical: historicalData,
          alerts: [],
          isLoading: false
        });

      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 🔄 Fetch every 5 seconds

    return () => clearInterval(interval);  // ✅ Cleanup interval on unmount
  }, [currentServer]);

  return metrics;
};
