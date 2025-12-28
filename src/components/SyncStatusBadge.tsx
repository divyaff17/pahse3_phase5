import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getSyncMetadata } from '@/lib/db';
import { useEffect, useState } from 'react';

interface SyncStatusBadgeProps {
    entityType: 'cart' | 'wishlist' | 'product' | 'reservation';
    entityId: string;
    className?: string;
}

type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

/**
 * Shows sync status for individual items (products, reservations, etc.)
 */
export function SyncStatusBadge({ entityType, entityId, className = '' }: SyncStatusBadgeProps) {
    const { isSyncing } = useSyncStatus();
    const [status, setStatus] = useState<SyncStatus | null>(null);
    const [lastSynced, setLastSynced] = useState<number | null>(null);

    useEffect(() => {
        const loadStatus = async () => {
            const metadata = await getSyncMetadata(entityType, entityId);
            if (metadata) {
                setStatus(metadata.syncStatus as SyncStatus);
                setLastSynced(metadata.lastSyncedAt);
            }
        };

        loadStatus();

        // Refresh every 5 seconds
        const interval = setInterval(loadStatus, 5000);
        return () => clearInterval(interval);
    }, [entityType, entityId]);

    if (!status || status === 'synced') {
        return null; // Don't show badge if synced
    }

    const getIcon = () => {
        if (isSyncing) return <RefreshCw className="w-3 h-3 animate-spin" />;

        switch (status) {
            case 'pending':
                return <Clock className="w-3 h-3" />;
            case 'conflict':
                return <AlertTriangle className="w-3 h-3" />;
            case 'error':
                return <XCircle className="w-3 h-3" />;
            case 'synced':
                return <CheckCircle2 className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'conflict':
            case 'error':
                return 'destructive';
            case 'synced':
                return 'default';
            default:
                return 'secondary';
        }
    };

    const getTooltipText = () => {
        switch (status) {
            case 'pending':
                return 'Waiting to sync';
            case 'conflict':
                return 'Sync conflict - needs resolution';
            case 'error':
                return 'Sync failed - will retry';
            case 'synced':
                return lastSynced
                    ? `Synced ${new Date(lastSynced).toLocaleTimeString()}`
                    : 'Synced';
            default:
                return 'Unknown status';
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant={getVariant()} className={`gap-1 ${className}`}>
                    {getIcon()}
                    <span className="text-xs capitalize">{status}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <p>{getTooltipText()}</p>
            </TooltipContent>
        </Tooltip>
    );
}
