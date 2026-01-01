import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoStorage {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../../uploads/videos');
        this.ensureUploadsDirExists();
    }

    ensureUploadsDirExists() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
            console.log('📁 Created videos upload directory:', this.uploadsDir);
        }
    }

    /**
     * Save video blob to disk
     * @param {Buffer} videoBuffer - Video file buffer
     * @param {number} applicationId - Application ID
     * @returns {string} - Saved file path
     */
    saveVideo(videoBuffer, applicationId) {
        const timestamp = Date.now();
        const filename = `interview-${applicationId}-${timestamp}.webm`;
        const filepath = path.join(this.uploadsDir, filename);

        fs.writeFileSync(filepath, videoBuffer);
        console.log(`✅ Video saved: ${filename}`);

        return `/uploads/videos/${filename}`;
    }

    /**
     * Get video file path
     * @param {number} applicationId - Application ID
     * @returns {string|null} - File path or null if not found
     */
    getVideoPath(applicationId) {
        const files = fs.readdirSync(this.uploadsDir);
        const videoFile = files.find(file => file.startsWith(`interview-${applicationId}-`));

        if (!videoFile) {
            return null;
        }

        return path.join(this.uploadsDir, videoFile);
    }

    /**
     * Get video URL for streaming
     * @param {number} applicationId - Application ID
     * @returns {string|null} - Video URL or null if not found
     */
    getVideoUrl(applicationId) {
        const files = fs.readdirSync(this.uploadsDir);
        const videoFile = files.find(file => file.startsWith(`interview-${applicationId}-`));

        if (!videoFile) {
            return null;
        }

        return `/uploads/videos/${videoFile}`;
    }

    /**
     * Delete video file
     * @param {number} applicationId - Application ID
     * @returns {boolean} - Success status
     */
    deleteVideo(applicationId) {
        const videoPath = this.getVideoPath(applicationId);

        if (!videoPath || !fs.existsSync(videoPath)) {
            return false;
        }

        fs.unlinkSync(videoPath);
        console.log(`🗑️ Video deleted for application ${applicationId}`);
        return true;
    }

    /**
     * Check if video exists
     * @param {number} applicationId - Application ID
     * @returns {boolean} - Existence status
     */
    videoExists(applicationId) {
        return this.getVideoPath(applicationId) !== null;
    }

    /**
     * Get video file size
     * @param {number} applicationId - Application ID
     * @returns {number|null} - File size in bytes or null if not found
     */
    getVideoSize(applicationId) {
        const videoPath = this.getVideoPath(applicationId);

        if (!videoPath || !fs.existsSync(videoPath)) {
            return null;
        }

        const stats = fs.statSync(videoPath);
        return stats.size;
    }
}

// Create singleton instance
const videoStorage = new VideoStorage();

export default videoStorage;
