/**
 * SilenceDetector - Monitors audio stream for silence and triggers callback
 * Used for auto-skip functionality in voice interviews
 */
export class SilenceDetector {
    constructor(stream, onSilenceDetected, onSpeechDetected, silenceThresholdMs = 10000) {
        this.stream = stream;
        this.onSilenceDetected = onSilenceDetected;
        this.onSpeechDetected = onSpeechDetected;
        this.silenceThresholdMs = silenceThresholdMs;

        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.rafId = null;

        this.silenceStartTime = null;
        this.isSilent = false;
        this.isRunning = false;

        // Threshold for considering audio as "silent" (0-255 scale)
        this.volumeThreshold = 10;
    }

    /**
     * Start monitoring the audio stream for silence
     */
    start() {
        if (this.isRunning) return;

        try {
            // Create audio context and analyser
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            // Connect stream to analyser
            this.source = this.audioContext.createMediaStreamSource(this.stream);
            this.source.connect(this.analyser);

            this.isRunning = true;
            this.silenceStartTime = Date.now();
            this._checkAudioLevel();

            console.log('SilenceDetector started');
        } catch (error) {
            console.error('Failed to start silence detector:', error);
        }
    }

    /**
     * Stop monitoring and cleanup resources
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.silenceStartTime = null;
        this.isSilent = false;

        console.log('SilenceDetector stopped');
    }

    /**
     * Reset the silence timer (call when user starts speaking)
     */
    reset() {
        this.silenceStartTime = Date.now();
        this.isSilent = false;
    }

    /**
     * Get current audio volume level (0-255)
     */
    getVolume() {
        if (!this.analyser || !this.dataArray) return 0;

        this.analyser.getByteTimeDomainData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = Math.abs(this.dataArray[i] - 128);
            sum += value;
        }

        return sum / this.dataArray.length;
    }

    /**
     * Check audio level continuously
     * @private
     */
    _checkAudioLevel() {
        if (!this.isRunning) return;

        const volume = this.getVolume();
        const now = Date.now();
        const silenceDuration = now - this.silenceStartTime;

        // Check if currently silent
        if (volume < this.volumeThreshold) {
            // User is silent
            if (!this.isSilent) {
                // Just became silent
                this.isSilent = true;
                this.silenceStartTime = now;
            } else {
                // Still silent - check if threshold exceeded
                if (silenceDuration >= this.silenceThresholdMs) {
                    // Silence threshold exceeded - trigger callback
                    if (this.onSilenceDetected) {
                        this.onSilenceDetected(silenceDuration);
                    }
                    // Reset to avoid repeated triggers
                    this.silenceStartTime = now;
                }
            }
        } else {
            // User is speaking
            if (this.isSilent) {
                // Just started speaking
                this.isSilent = false;
                if (this.onSpeechDetected) {
                    this.onSpeechDetected();
                }
            }
            // Reset silence timer
            this.silenceStartTime = now;
        }

        // Continue checking
        this.rafId = requestAnimationFrame(() => this._checkAudioLevel());
    }

    /**
     * Get remaining time until auto-skip (in milliseconds)
     */
    getRemainingTime() {
        if (!this.isSilent) return this.silenceThresholdMs;

        const elapsed = Date.now() - this.silenceStartTime;
        const remaining = Math.max(0, this.silenceThresholdMs - elapsed);
        return remaining;
    }

    /**
     * Get remaining time in seconds (for display)
     */
    getRemainingSeconds() {
        return Math.ceil(this.getRemainingTime() / 1000);
    }
}

export default SilenceDetector;
