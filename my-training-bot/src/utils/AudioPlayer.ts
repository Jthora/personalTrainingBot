import skipSound from '../assets/sounds/skip.wav';
import completeSound from '../assets/sounds/complete.mp3';
import timeoutSound from '../assets/sounds/timeout.wav';

const sounds = {
    skip: skipSound,
    complete: completeSound,
    timeout: timeoutSound
};

let currentAudios: HTMLAudioElement[] = [];

export const playSound = (soundUrl: string) => {
    try {
        const audio = new Audio(soundUrl);
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

export const setVolume = (volume: number) => {
    currentAudios.forEach(audio => {
        audio.volume = volume;
    });
};

export const playSkipSound = () => {
    playSound(sounds.skip);
};

export const playCompleteSound = () => {
    playSound(sounds.complete);
};

export const playTimeoutSound = () => {
    playSound(sounds.timeout);
};