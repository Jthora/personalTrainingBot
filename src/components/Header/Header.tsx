import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsStore } from '../../store/SettingsStore';
import { Web3AuthService } from '../../services/Web3AuthService';
import styles from './Header.module.css';
import logo from '../../assets/images/WingCommanderLogo-288x162.gif';
import { useCoachSelection } from '../../hooks/useCoachSelection';
import { getCoachPalette } from '../../data/coachThemes';

interface UserProfile {
    nickname?: string;
    avatar?: string;
}

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isWeb3Connected, setIsWeb3Connected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const { coachId } = useCoachSelection();
    const [coachColor, setCoachColor] = useState<string>(getCoachPalette(coachId).accent);

    useEffect(() => {
        const initializeUser = async () => {
            const settingsStore = SettingsStore.getInstance();
            await settingsStore.initialize();
            
            const web3Service = Web3AuthService.getInstance();
            const address = await web3Service.getWalletAddress();
            
            if (address) {
                setIsWeb3Connected(true);
                setWalletAddress(address);
                
                // Get user profile
                const preferences = settingsStore.getUserPreferences();
                setUserProfile(preferences.profile);
            }
        };

        initializeUser();
    }, []);

    const navigateTo = (path: string) => {
        navigate(path);
        setShowUserMenu(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const handleWeb3Login = async () => {
        try {
            const settingsStore = SettingsStore.getInstance();
            const address = await settingsStore.connectWeb3();
            
            if (address) {
                setIsWeb3Connected(true);
                setWalletAddress(address);
                const preferences = settingsStore.getUserPreferences();
                setUserProfile(preferences.profile);
            }
        } catch (error) {
            console.error('Failed to connect Web3:', error);
        }
    };

    const handleWeb3Logout = async () => {
        try {
            const settingsStore = SettingsStore.getInstance();
            await settingsStore.disconnectWeb3();
            setIsWeb3Connected(false);
            setWalletAddress('');
            setUserProfile(null);
            setShowUserMenu(false);
        } catch (error) {
            console.error('Failed to disconnect Web3:', error);
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
        // Store theme preference
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    };

    // Initialize theme on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    // Update coach color when selected coach changes
    useEffect(() => {
        const palette = getCoachPalette(coachId);
        setCoachColor(palette.accent);
    }, [coachId]);

    return (
        <header className={styles.header}>
            {/* Left Side - Logo */}
            <div className={styles.leftSection}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Wing Commander Logo" className={styles.logo} />
                </div>
            </div>

            {/* Center - Title (hugging the logo) */}
            <div className={styles.centerSection}>
                <h1 className={styles.headerTitle}>Personal Training Bot</h1>
            </div>

            {/* Right Side - Navigation and Login */}
            <div className={styles.rightSection}>
                <nav className={styles.nav}>
                    <button 
                        onClick={() => navigateTo('/')} 
                        className={`${styles.navButton} ${isActive('/') ? styles.active : ''}`}
                        style={{ '--coach-color': coachColor } as React.CSSProperties}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => navigateTo('/schedules')} 
                        className={`${styles.navButton} ${isActive('/schedules') ? styles.active : ''}`}
                        style={{ '--coach-color': coachColor } as React.CSSProperties}
                    >
                        Schedules
                    </button>
                    <button 
                        onClick={() => navigateTo('/workouts')} 
                        className={`${styles.navButton} ${isActive('/workouts') ? styles.active : ''}`}
                        style={{ '--coach-color': coachColor } as React.CSSProperties}
                    >
                        Workouts
                    </button>
                    <button 
                        onClick={() => navigateTo('/training')} 
                        className={`${styles.navButton} ${isActive('/training') ? styles.active : ''}`}
                        style={{ '--coach-color': coachColor } as React.CSSProperties}
                    >
                        Training
                    </button>
                </nav>
                
                <div className={styles.loginSection}>
                    <button 
                        className={styles.themeToggleButton}
                        onClick={toggleTheme}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        style={{ '--coach-color': coachColor } as React.CSSProperties}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    
                    {isWeb3Connected ? (
                        <div className={styles.userProfile}>
                            <button 
                                className={styles.userButton}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{ '--coach-color': coachColor } as React.CSSProperties}
                            >
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>
                                        {userProfile?.nickname || truncateAddress(walletAddress)}
                                    </span>
                                    <span className={styles.connectionStatus}>🟢 Connected</span>
                                </div>
                                <span className={styles.userAvatar}>
                                    {userProfile?.avatar || '👤'}
                                </span>
                            </button>
                            
                            {showUserMenu && (
                                <div className={styles.userMenu}>
                                    <div className={styles.menuItem}>
                                        📊 Progress
                                    </div>
                                    <div className={styles.menuItem}>
                                        🏆 Achievements
                                    </div>
                                    <div className={styles.menuSeparator}></div>
                                    <div className={styles.menuItem} onClick={handleWeb3Logout}>
                                        🚪 Disconnect
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            className={styles.loginButton}
                            onClick={handleWeb3Login}
                            title="Connect Web3 Wallet"
                            style={{ '--coach-color': coachColor } as React.CSSProperties}
                        >
                            🔗
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;