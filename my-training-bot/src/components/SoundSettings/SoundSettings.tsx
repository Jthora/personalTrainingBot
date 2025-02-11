import React, { useState, useEffect } from 'react';
import { setSoundEnabled, setSoundVolume, setGlobalVolume } from '../../utils/AudioPlayer';
import styles from './SoundSettings.module.css';

const SoundSettings: React.FC = () => {
    const [volumes, setVolumes] = useState({
        global: 1,
        skip: 1,
        complete: 1,
        timeout: 1
    });

    const [enabled, setEnabled] = useState({
        skip: true,
        complete: true,
        timeout: true
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('soundSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setVolumes({
                global: settings.globalVolume,
                skip: settings.skip.volume,
                complete: settings.complete.volume,
                timeout: settings.timeout.volume
            });
            setEnabled({
                skip: settings.skip.enabled,
                complete: settings.complete.enabled,
                timeout: settings.timeout.enabled
            });
        }
    }, []);

    const handleVolumeChange = (sound: keyof typeof volumes, volume: number) => {
        setVolumes(prev => ({ ...prev, [sound]: volume }));
        if (sound === 'global') {
            setGlobalVolume(volume);
        } else {
            setSoundVolume(sound, volume);
        }
    };

    const handleEnabledChange = (sound: 'skip' | 'complete' | 'timeout', enabled: boolean) => {
        setEnabled(prev => ({ ...prev, [sound]: enabled }));
        setSoundEnabled(sound, enabled);
    };

    return (
        <div className={styles.soundSettings}>
            <div>
                <label>
                    Global Volume
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volumes.global}
                    onChange={e => handleVolumeChange('global', parseFloat(e.target.value))}
                />
            </div>
            {Object.keys(volumes).filter(sound => sound !== 'global').map(sound => (
                <div key={sound}>
                    <label>
                        <input
                            type="checkbox"
                            checked={enabled[sound as keyof typeof enabled]}
                            onChange={e => handleEnabledChange(sound as keyof typeof enabled, e.target.checked)}
                        />
                        {sound.charAt(0).toUpperCase() + sound.slice(1)} Sound
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumes[sound as keyof typeof volumes]}
                        onChange={e => handleVolumeChange(sound as keyof typeof volumes, parseFloat(e.target.value))}
                    />
                </div>
            ))}
        </div>
    );
};

export default SoundSettings;
