// MISSING: VM monitoring/metrics API not yet implemented — shape predicted from
// OpenShift/Prometheus monitoring patterns. Expected endpoint:
//   GET /api/fulfillment/v1/compute_instances/{id}/metrics?window={minutes}m
// Each series returns timestamped samples at ~30s intervals.

export interface UtilizationSample {
  /** Unix epoch milliseconds */
  timestamp: number;
  value: number;
}

export interface VmCpuUtilization {
  /** Current usage in millicores */
  usedMillicores: number;
  /** Total millicores allocated to the VM (vCPUs × 1000) */
  totalMillicores: number;
  percentUsed: number;
  history: UtilizationSample[];
}

export interface VmMemoryUtilization {
  usedBytes: number;
  totalBytes: number;
  percentUsed: number;
  history: UtilizationSample[];
}

export interface VmStorageUtilization {
  usedBytes: number;
  totalBytes: number;
  percentUsed: number;
  history: UtilizationSample[];
}

export interface VmNetworkUtilization {
  /** Total bytes/sec (in + out) */
  totalBytesPerSec: number;
  inBytesPerSec: number;
  outBytesPerSec: number;
  history: UtilizationSample[];
}

export interface VmUtilizationData {
  cpu: VmCpuUtilization;
  memory: VmMemoryUtilization;
  storage: VmStorageUtilization;
  network: VmNetworkUtilization;
  /** Observation window in minutes */
  windowMinutes: number;
  windowStart: number;
  windowEnd: number;
}

// ── Mock implementation ──────────────────────────────────────────────────────
// Replace with a real useApiQuery call once the metrics endpoint lands.

const generateSamples = (
  count: number,
  base: number,
  jitter: number,
  endMs: number,
  stepMs: number,
): UtilizationSample[] =>
  Array.from({ length: count }, (_, i) => ({
    timestamp: endMs - (count - 1 - i) * stepMs,
    value: Math.max(0, base + (Math.random() - 0.5) * 2 * jitter),
  }));

// MISSING: useVmUtilization — returns static mock; replace with real query
export const useVmUtilization = (
  _vmId: string,
  windowMinutes: number = 5,
): { data: VmUtilizationData; isLoading: false } => {
  const now = Date.now();
  const stepMs = (windowMinutes * 60 * 1000) / 10;
  const count = 10;

  const MISSING_data: VmUtilizationData = {
    windowMinutes,
    windowStart: now - windowMinutes * 60 * 1000,
    windowEnd: now,

    cpu: {
      usedMillicores: 92,
      totalMillicores: 1000,
      percentUsed: 9.2,
      history: generateSamples(count, 92, 15, now, stepMs),
    },

    memory: {
      usedBytes: 573 * 1024 * 1024,
      totalBytes: 2 * 1024 * 1024 * 1024,
      percentUsed: 28,
      history: generateSamples(count, 573 * 1024 * 1024, 20 * 1024 * 1024, now, stepMs),
    },

    storage: {
      usedBytes: 7.2 * 1024 * 1024 * 1024,
      totalBytes: 30 * 1024 * 1024 * 1024,
      percentUsed: 24,
      history: generateSamples(count, 7.2 * 1024 * 1024 * 1024, 0.05 * 1024 * 1024 * 1024, now, stepMs),
    },

    network: {
      totalBytesPerSec: 5.3 * 1024,
      inBytesPerSec: 2.9 * 1024,
      outBytesPerSec: 2.4 * 1024,
      history: generateSamples(count, 5.3 * 1024, 1.5 * 1024, now, stepMs),
    },
  };

  return { data: MISSING_data, isLoading: false };
};
