/**
 * VideoRecorder - Records video stream from webcam
 * Used to capture user's face during interview
 */
export class VideoRecorder {
    constructor(stream) {
        this.stream = stream;
        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;
    }

    /**
     * Start recording the video stream
     */
    start() {
        if (this.isRecording) {
            console.warn('VideoRecorder is already recording');
            return;
        }

        try {
            // Create MediaRecorder with appropriate options
            const options = { mimeType: 'video/webm;codecs=vp8,opus' };

            // Fallback for browsers that don't support the preferred codec
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.chunks = [];

            // Collect data chunks
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.chunks.push(event.data);
                }
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every 1 second
            this.isRecording = true;

            console.log('VideoRecorder started');
        } catch (error) {
            console.error('Failed to start video recording:', error);
            throw error;
        }
    }

    /**
     * Stop recording and return the video blob
     * @returns {Promise<Blob>} Video blob
     */
    stop() {
        return new Promise((resolve, reject) => {
            if (!this.isRecording || !this.mediaRecorder) {
                reject(new Error('VideoRecorder is not recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                try {
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    this.isRecording = false;
                    console.log('VideoRecorder stopped, blob size:', blob.size);
                    resolve(blob);
                } catch (error) {
                    reject(error);
                }
            };

            this.mediaRecorder.onerror = (error) => {
                console.error('MediaRecorder error:', error);
                reject(error);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Pause recording
     */
    pause() {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            console.log('VideoRecorder paused');
        }
    }

    /**
     * Resume recording
     */
    resume() {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            console.log('VideoRecorder resumed');
        }
    }

    /**
     * Get current recording state
     */
    getState() {
        return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
    }

    /**
     * Download the recorded video
     * @param {Blob} blob - Video blob to download
     * @param {string} filename - Filename for the download
     */
    static downloadVideo(blob, filename = 'interview-recording.webm') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

export default VideoRecorder;
