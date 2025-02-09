export const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.play();
};