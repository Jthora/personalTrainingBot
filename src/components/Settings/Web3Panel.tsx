import React, { useEffect, useState } from 'react';
import styles from './Web3Panel.module.css';
import { SettingsStore } from '../../store/SettingsStore';

const Web3Panel: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [nickname, setNickname] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const settingsStore = SettingsStore.getInstance();
                await settingsStore.initialize();
                const address = await settingsStore.getWalletAddress();
                if (address) {
                    setIsConnected(true);
                    setWalletAddress(address);
                    const prefs = settingsStore.getUserPreferences();
                    setNickname(prefs.profile?.nickname ?? '');
                }
            } catch (e) {
                console.error('Web3Panel init failed', e);
                setError('Unable to load wallet status');
            } finally {
                setLoading(false);
            }
        };
        void init();
    }, []);

    const handleConnect = async () => {
        setError(null);
        try {
            const settingsStore = SettingsStore.getInstance();
            const address = await settingsStore.connectWeb3();
            if (address) {
                setIsConnected(true);
                setWalletAddress(address);
                const prefs = settingsStore.getUserPreferences();
                setNickname(prefs.profile?.nickname ?? '');
            }
        } catch (e) {
            console.error('Web3 connect failed', e);
            setError('Connect failed. Try again.');
        }
    };

    const handleDisconnect = async () => {
        setError(null);
        try {
            const settingsStore = SettingsStore.getInstance();
            await settingsStore.disconnectWeb3();
            setIsConnected(false);
            setWalletAddress('');
            setNickname('');
        } catch (e) {
            console.error('Web3 disconnect failed', e);
            setError('Disconnect failed.');
        }
    };

    const truncate = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div className={styles.panel}>
            <div className={styles.header}>Web3 Wallet</div>
            {loading ? (
                <div className={styles.row}>Loading wallet status…</div>
            ) : (
                <>
                    {error && <div className={styles.error} role="alert">{error}</div>}
                    <div className={styles.row}>
                        <span>Status:</span>
                        <span className={isConnected ? styles.good : styles.muted}>
                            {isConnected ? 'Connected' : 'Not connected'}
                        </span>
                    </div>
                    {isConnected && (
                        <div className={styles.meta}>
                            <div><strong>Wallet:</strong> {truncate(walletAddress)}</div>
                            {nickname && <div><strong>Nickname:</strong> {nickname}</div>}
                        </div>
                    )}
                    <div className={styles.actions}>
                        {isConnected ? (
                            <button type="button" onClick={handleDisconnect} className={styles.buttonSecondary}>
                                Disconnect
                            </button>
                        ) : (
                            <button type="button" onClick={handleConnect} className={styles.buttonPrimary}>
                                Connect wallet
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Web3Panel;
