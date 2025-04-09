class SoundManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.isLoaded = false;
        this.loadSounds();
    }

    loadSounds() {
        try {
            // Define sound URLs
            const soundUrls = {
                eat: 'https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3',
                powerup: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
                gameOver: 'https://assets.mixkit.co/active_storage/sfx/1426/1426-preview.mp3',
                move: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
            };

            // Counter for loaded sounds
            let loadedCount = 0;
            const totalSounds = Object.keys(soundUrls).length;

            // Load each sound
            for (const [name, url] of Object.entries(soundUrls)) {
                const sound = loadSound(url, 
                    // Success callback
                    () => {
                        loadedCount++;
                        if (loadedCount === totalSounds) {
                            this.isLoaded = true;
                            console.log('All sounds loaded successfully');
                        }
                    },
                    // Error callback
                    (err) => {
                        console.warn(`Failed to load sound ${name}:`, err);
                    }
                );

                // Store the sound and set initial volume
                this.sounds[name] = sound;
                if (sound && sound.setVolume) {
                    sound.setVolume(0.5);
                }
            }

        } catch (error) {
            console.warn('Could not initialize sound effects:', error);
            this.sounds = {};
        }
    }

    play(soundName) {
        try {
            // Check if sound exists and is loaded
            const sound = this.sounds[soundName];
            if (!this.isMuted && sound && sound.isLoaded() && !sound.isPlaying()) {
                // Stop any other playing sounds of the same type
                if (soundName === 'move') {
                    Object.values(this.sounds).forEach(s => {
                        if (s && s.isPlaying()) {
                            s.stop();
                        }
                    });
                }
                
                // Play the sound
                sound.play();
            }
        } catch (error) {
            console.warn('Could not play sound:', soundName, error);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.setVolume) {
                    if (this.isMuted) {
                        sound.setVolume(0);
                    } else {
                        sound.setVolume(0.5);
                        // Stop any currently playing sounds when unmuting
                        if (sound.isPlaying()) {
                            sound.stop();
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Could not toggle mute:', error);
        }
    }

    setVolume(volume) {
        try {
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.setVolume) {
                    sound.setVolume(volume);
                }
            });
        } catch (error) {
            console.warn('Could not set volume:', error);
        }
    }

    // Check if a specific sound is loaded
    isSoundLoaded(soundName) {
        return this.sounds[soundName] && this.sounds[soundName].isLoaded();
    }

    // Check if all sounds are loaded
    areAllSoundsLoaded() {
        return this.isLoaded && Object.values(this.sounds).every(sound => sound && sound.isLoaded());
    }
} 