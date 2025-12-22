import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [show, setShow] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        console.log('🔌 Network status changed:', isOnline ? 'ONLINE' : 'OFFLINE');

        if (!isOnline) {
            // Show indicator immediately when offline
            setShow(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "Back online" message briefly
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    if (!show) return null;

    return (
        <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl transition-all duration-300 animate-in slide-in-from-top-5 ${isOnline
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <>
                        <Wifi className="w-5 h-5" />
                        <span className="text-sm font-semibold">Back online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-5 h-5" />
                        <span className="text-sm font-semibold">You're offline</span>
                        <CloudOff className="w-5 h-5 ml-1" />
                    </>
                )}
            </div>
        </div>
    );
}
