'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface WorkflowHeartbeat {
  workflow_name: string;
  last_run_at: string | null;
  last_status: 'ok' | 'error';
  items_processed: number;
  error_message: string | null;
}

interface HealthData {
  heartbeats: WorkflowHeartbeat[];
  lastUpdated: string;
}

const WORKFLOW_CONFIG = {
  'W1_phase1_sender': {
    label: 'Phase 1 Sender',
    intervalMinutes: null, // Manual - no interval check
  },
  'W2_reply_processor': {
    label: 'Reply Processor', 
    intervalMinutes: 60,
  },
  'W3_reply_sender': {
    label: 'Reply Sender',
    intervalMinutes: 60,
  },
  'W4_interested_reply': {
    label: 'Interested Reply',
    intervalMinutes: 6 * 60, // 6 hours
  },
  'W5_phase2_sender': {
    label: 'Phase 2 Sender',
    intervalMinutes: 24 * 60, // 24 hours
  },
} as const;

type WorkflowName = keyof typeof WORKFLOW_CONFIG;

type StatusColor = 'green' | 'yellow' | 'red' | 'gray';

function getWorkflowStatus(heartbeat: WorkflowHeartbeat | undefined, config: typeof WORKFLOW_CONFIG[WorkflowName]): { status: string; color: StatusColor; pulse: boolean } {
  if (!heartbeat || !heartbeat.last_run_at) {
    return { status: 'never', color: 'gray', pulse: false };
  }

  if (heartbeat.last_status === 'error') {
    return { status: 'error', color: 'red', pulse: false };
  }

  // Manual workflow (W1) - just check if it ran successfully
  if (!config.intervalMinutes) {
    return { status: 'healthy', color: 'green', pulse: true };
  }

  const lastRun = new Date(heartbeat.last_run_at);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60));
  const intervalMinutes = config.intervalMinutes;

  if (minutesAgo <= intervalMinutes * 2) {
    return { status: 'healthy', color: 'green', pulse: true };
  } else if (minutesAgo <= intervalMinutes * 4) {
    return { status: 'warning', color: 'yellow', pulse: false };
  } else {
    return { status: 'down', color: 'red', pulse: false };
  }
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  
  const lastRun = new Date(timestamp);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60));
  
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  } else {
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  }
}

interface StatusCardProps {
  workflowName: WorkflowName;
  heartbeat: WorkflowHeartbeat | undefined;
  config: typeof WORKFLOW_CONFIG[WorkflowName];
}

function StatusCard({ workflowName, heartbeat, config }: StatusCardProps) {
  const { status, color, pulse } = getWorkflowStatus(heartbeat, config);
  
  const statusColors: Record<StatusColor, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500', 
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  const cardColors: Record<StatusColor, string> = {
    green: 'border-green-500/20 bg-green-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    red: 'border-red-500/20 bg-red-500/5', 
    gray: 'border-[var(--admin-border-light)] bg-[var(--admin-card)]',
  };

  return (
    <div className={`border rounded-lg p-3 ${cardColors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <div 
          className={`w-2 h-2 rounded-full ${statusColors[color]} ${pulse ? 'animate-pulse' : ''}`}
        />
        <span className="text-sm font-medium text-[var(--admin-text-primary)]">
          {config.label}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-[var(--admin-text-secondary)]">
          Last run: {formatTimeAgo(heartbeat?.last_run_at || null)}
        </p>
        <p className="text-xs text-[var(--admin-text-secondary)]">
          Items: {heartbeat?.items_processed || 0}
        </p>
        {heartbeat?.last_status === 'error' && heartbeat?.error_message && (
          <p className="text-xs text-red-400 truncate" title={heartbeat.error_message}>
            {heartbeat.error_message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/acquisition/health');
      if (!response.ok) {
        throw new Error(`Failed to fetch health: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load health data on mount
  useEffect(() => {
    fetchHealth();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">System Health</h2>
          <button
            onClick={fetchHealth}
            className="p-2 rounded-lg hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] hover:text-[var(--primary)] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-sm text-red-400">Failed to load system health</p>
          </div>
          <p className="text-xs text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Create a map of heartbeats by workflow name
  const heartbeatMap = new Map(
    healthData?.heartbeats?.map(h => [h.workflow_name, h]) || []
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)]">System Health</h2>
          <p className="text-sm text-[var(--admin-text-secondary)]">
            {lastUpdated ? `Updated: ${lastUpdated}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.entries(WORKFLOW_CONFIG) as [WorkflowName, typeof WORKFLOW_CONFIG[WorkflowName]][]).map(([workflowName, config]) => (
          <StatusCard
            key={workflowName}
            workflowName={workflowName}
            heartbeat={heartbeatMap.get(workflowName)}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}