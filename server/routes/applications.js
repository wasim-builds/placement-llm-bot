import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../services/database.js';

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Submit job application
router.post('/', upload.single('resume'), (req, res) => {
    try {
        const { jobId, candidateName, candidateEmail } = req.body;

        if (!jobId || !candidateName || !candidateEmail) {
            return res.status(400).json({ error: 'Job ID, name, and email are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        // Check if job exists
        const job = db.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Check if already applied
        const existingApplications = db.getApplicationsByEmail(candidateEmail);
        const alreadyApplied = existingApplications.some(app => app.jobId === parseInt(jobId));

        if (alreadyApplied) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        const application = db.createApplication({
            jobId: parseInt(jobId),
            candidateName,
            candidateEmail,
            resumeUrl: `/uploads/resumes/${req.file.filename}`
        });

        res.status(201).json({
            ...application,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Get all applications for a job (HR only)
router.get('/job/:jobId', (req, res) => {
    try {
        const applications = db.getApplicationsByJobId(req.params.jobId);

        // Enrich with interview results
        const applicationsWithResults = applications.map(app => {
            const interviewResult = db.getInterviewResultByApplicationId(app.id);
            return {
                ...app,
                interviewResult: interviewResult || null
            };
        });

        res.json(applicationsWithResults);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get candidate's applications
router.get('/candidate/:email', (req, res) => {
    try {
        const applications = db.getApplicationsByEmail(req.params.email);

        // Enrich with job details and interview results
        const applicationsWithDetails = applications.map(app => {
            const job = db.getJobById(app.jobId);
            const interviewResult = db.getInterviewResultByApplicationId(app.id);
            return {
                ...app,
                job: job || null,
                interviewResult: interviewResult || null
            };
        });

        res.json(applicationsWithDetails);
    } catch (error) {
        console.error('Error fetching candidate applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get single application by ID
router.get('/:id', (req, res) => {
    try {
        const application = db.getApplicationById(req.params.id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const job = db.getJobById(application.jobId);
        const interviewResult = db.getInterviewResultByApplicationId(application.id);

        res.json({
            ...application,
            job: job || null,
            interviewResult: interviewResult || null
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Update application status (HR only)
router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'interview_scheduled', 'interviewed', 'shortlisted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedApplication = db.updateApplicationStatus(req.params.id, status);

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(updatedApplication);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// Get interview result for application
router.get('/:id/interview-result', (req, res) => {
    try {
        const interviewResult = db.getInterviewResultByApplicationId(req.params.id);

        if (!interviewResult) {
            return res.status(404).json({ error: 'Interview result not found' });
        }

        res.json(interviewResult);
    } catch (error) {
        console.error('Error fetching interview result:', error);
        res.status(500).json({ error: 'Failed to fetch interview result' });
    }
});

// Get HR statistics
router.get('/stats/hr', (req, res) => {
    try {
        const stats = db.getHRStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching HR stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get candidate statistics
router.get('/stats/candidate/:email', (req, res) => {
    try {
        const stats = db.getCandidateStats(req.params.email);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching candidate stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
