import skipSound from '../assets/sounds/skip.wav';
import completeSound from '../assets/sounds/complete.mp3';
import timeoutSound from '../assets/sounds/timeout.wav';

const sounds = {
    skip: skipSound,
    complete: completeSound,
    timeout: timeoutSound
};

const defaultSoundSettings = {
    globalVolume: 1,
    skip: { enabled: true, volume: 1 },
    complete: { enabled: true, volume: 1 },
    timeout: { enabled: true, volume: 1 }
};

const loadSoundSettings = () => {
    const savedSettings = localStorage.getItem('soundSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSoundSettings;
};

const soundSettings = loadSoundSettings();

const saveSoundSettings = () => {
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
};

let currentAudios: HTMLAudioElement[] = [];

export const setSoundEnabled = (sound: keyof typeof sounds, enabled: boolean) => {
    soundSettings[sound].enabled = enabled;
    saveSoundSettings();
};

export const setSoundVolume = (sound: keyof typeof sounds, volume: number) => {
    soundSettings[sound].volume = volume;
    saveSoundSettings();
};

export const setGlobalVolume = (volume: number) => {
    soundSettings.globalVolume = volume;
    currentAudios.forEach(audio => {
        audio.volume = volume;
    });
    saveSoundSettings();
};

export const playSound = (soundUrl: string, sound: keyof typeof sounds) => {
    if (!soundSettings[sound].enabled) return;
    try {
        const audio = new Audio(soundUrl);
        audio.volume = soundSettings[sound].volume * soundSettings.globalVolume;
        audio.play();
        currentAudios.push(audio);
        audio.addEventListener('ended', () => {
            currentAudios = currentAudios.filter(a => a !== audio);
        });
    } catch (error) {
        console.error('Error playing sound:', error);
    }
};

export const stopSound = (soundUrl?: string) => {
    if (soundUrl) {
        currentAudios.forEach(audio => {
            if (audio.src.includes(soundUrl)) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        currentAudios = currentAudios.filter(audio => !audio.src.includes(soundUrl));
    } else {
        currentAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        currentAudios = [];
    }
};

export const playSkipSound = () => {
    playSound(sounds.skip, 'skip');
};

export const playCompleteSound = () => {
    playSound(sounds.complete, 'complete');
};

export const playTimeoutSound = () => {
    playSound(sounds.timeout, 'timeout');
};