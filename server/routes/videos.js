import express from 'express';
import multer from 'multer';
import fs from 'fs';
import videoStorage from '../services/storage.js';
import db from '../services/database.js';

const router = express.Router();

// Configure multer for video uploads (in-memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Upload interview video
router.post('/upload', upload.single('video'), (req, res) => {
    try {
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({ error: 'Application ID is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        // Check if application exists
        const application = db.getApplicationById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Save video to disk
        const videoUrl = videoStorage.saveVideo(req.file.buffer, applicationId);

        // Update application with video URL
        db.updateApplicationVideo(applicationId, videoUrl);

        res.json({
            message: 'Video uploaded successfully',
            videoUrl,
            size: req.file.size
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// Stream video for playback (supports range requests)
router.get('/:applicationId', (req, res) => {
    try {
        const { applicationId } = req.params;
        const videoPath = videoStorage.getVideoPath(applicationId);

        if (!videoPath || !fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Handle range requests for video seeking
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/webm',
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            // Stream entire video
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/webm',
            };

            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

// Download video file
router.get('/:applicationId/download', (req, res) => {
    try {
        const { applicationId } = req.params;
        const videoPath = videoStorage.getVideoPath(applicationId);

        if (!videoPath || !fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const filename = `interview-${applicationId}.webm`;
        res.download(videoPath, filename);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

// Delete video (HR only)
router.delete('/:applicationId', (req, res) => {
    try {
        const { applicationId } = req.params;
        const deleted = videoStorage.deleteVideo(applicationId);

        if (!deleted) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Update application to remove video URL
        db.updateApplicationVideo(applicationId, null);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// Check if video exists
router.get('/:applicationId/exists', (req, res) => {
    try {
        const { applicationId } = req.params;
        const exists = videoStorage.videoExists(applicationId);
        const size = videoStorage.getVideoSize(applicationId);

        res.json({
            exists,
            size: size || 0
        });
    } catch (error) {
        console.error('Error checking video:', error);
        res.status(500).json({ error: 'Failed to check video' });
    }
});

export default router;
