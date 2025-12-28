import { useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncEngine } from '@/services/syncEngine';
import { useSyncStatus } from './useSyncStatus';

/**
 * Hook for offline sync functionality
 * NOW INTEGRATED with unified sync engine
 */
export function useOfflineSync() {
    const isOnline = useOnlineStatus();
    const { triggerSync, isSyncing, pendingCount, conflictCount } = useSyncStatus();

    const syncOfflineQueue = useCallback(async () => {
        if (!isOnline) return;

        try {
            console.log('🔄 Triggering sync via sync engine...');
            await triggerSync();
        } catch (error) {
            console.error('Error syncing offline queue:', error);
        }
    }, [isOnline, triggerSync]);

    useEffect(() => {
        if (isOnline) {
            // Sync when coming back online
            syncOfflineQueue();
        }
    }, [isOnline, syncOfflineQueue]);

    return {
        isOnline,
        syncOfflineQueue,
        isSyncing,
        pendingCount,
        conflictCount,
    };
}
