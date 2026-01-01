import express from 'express';
import db from '../services/database.js';

const router = express.Router();

// Create new job posting (HR only)
router.post('/', (req, res) => {
    try {
        const { title, description, requirements, skills, location, salary, employmentType, deadline } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const job = db.createJob({
            title,
            description,
            requirements,
            skills,
            location,
            salary,
            employmentType,
            deadline
        });

        res.status(201).json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job posting' });
    }
});

// Get all active jobs (public/candidates)
router.get('/', (req, res) => {
    try {
        const activeOnly = req.query.active !== 'false';
        const jobs = db.getAllJobs(activeOnly);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get all jobs for HR (including inactive)
router.get('/hr/all', (req, res) => {
    try {
        const jobs = db.getAllJobs(false);

        // Add application count to each job
        const jobsWithStats = jobs.map(job => {
            const applications = db.getApplicationsByJobId(job.id);
            return {
                ...job,
                applicationCount: applications.length,
                interviewedCount: applications.filter(app => app.status === 'interviewed').length,
                shortlistedCount: applications.filter(app => app.status === 'shortlisted').length
            };
        });

        res.json(jobsWithStats);
    } catch (error) {
        console.error('Error fetching HR jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get job by ID
router.get('/:id', (req, res) => {
    try {
        const job = db.getJobById(req.params.id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// Update job posting (HR only)
router.put('/:id', (req, res) => {
    try {
        const { title, description, requirements, skills, location, salary, employmentType, deadline, status } = req.body;

        const updatedJob = db.updateJob(req.params.id, {
            title,
            description,
            requirements,
            skills,
            location,
            salary,
            employmentType,
            deadline,
            status
        });

        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Delete job posting (HR only)
router.delete('/:id', (req, res) => {
    try {
        const deleted = db.deleteJob(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

export default router;
