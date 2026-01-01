// In-memory database service for HR module
// This can be upgraded to MongoDB/PostgreSQL in production

class Database {
    constructor() {
        this.jobs = [];
        this.applications = [];
        this.interviewResults = [];
        this.jobIdCounter = 1;
        this.applicationIdCounter = 1;
        this.resultIdCounter = 1;
    }

    // ==================== JOBS ====================

    createJob(jobData) {
        const job = {
            id: this.jobIdCounter++,
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements || [],
            skills: jobData.skills || [],
            location: jobData.location,
            salary: jobData.salary,
            employmentType: jobData.employmentType || 'Full-time',
            postedBy: jobData.postedBy || 'HR',
            postedDate: new Date().toISOString(),
            deadline: jobData.deadline,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.jobs.push(job);
        return job;
    }

    getAllJobs(activeOnly = false) {
        if (activeOnly) {
            return this.jobs.filter(job => job.status === 'active');
        }
        return this.jobs;
    }

    getJobById(id) {
        return this.jobs.find(job => job.id === parseInt(id));
    }

    updateJob(id, updates) {
        const index = this.jobs.findIndex(job => job.id === parseInt(id));
        if (index === -1) return null;

        this.jobs[index] = {
            ...this.jobs[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return this.jobs[index];
    }

    deleteJob(id) {
        const index = this.jobs.findIndex(job => job.id === parseInt(id));
        if (index === -1) return false;

        this.jobs.splice(index, 1);
        return true;
    }

    // ==================== APPLICATIONS ====================

    createApplication(applicationData) {
        const application = {
            id: this.applicationIdCounter++,
            jobId: applicationData.jobId,
            candidateName: applicationData.candidateName,
            candidateEmail: applicationData.candidateEmail,
            resumeUrl: applicationData.resumeUrl,
            status: 'pending', // pending, interview_scheduled, interviewed, shortlisted, rejected
            appliedDate: new Date().toISOString(),
            videoUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.applications.push(application);
        return application;
    }

    getApplicationsByJobId(jobId) {
        return this.applications.filter(app => app.jobId === parseInt(jobId));
    }

    getApplicationsByEmail(email) {
        return this.applications.filter(app => app.candidateEmail === email);
    }

    getApplicationById(id) {
        return this.applications.find(app => app.id === parseInt(id));
    }

    updateApplicationStatus(id, status) {
        const index = this.applications.findIndex(app => app.id === parseInt(id));
        if (index === -1) return null;

        this.applications[index].status = status;
        this.applications[index].updatedAt = new Date().toISOString();
        return this.applications[index];
    }

    updateApplicationVideo(id, videoUrl) {
        const index = this.applications.findIndex(app => app.id === parseInt(id));
        if (index === -1) return null;

        this.applications[index].videoUrl = videoUrl;
        this.applications[index].updatedAt = new Date().toISOString();
        return this.applications[index];
    }

    // ==================== INTERVIEW RESULTS ====================

    createInterviewResult(resultData) {
        const result = {
            id: this.resultIdCounter++,
            applicationId: resultData.applicationId,
            jobId: resultData.jobId,
            sessionId: resultData.sessionId,
            scores: resultData.scores || {},
            transcript: resultData.transcript || [],
            overallScore: resultData.overallScore || 0,
            completedDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        this.interviewResults.push(result);

        // Update application status to 'interviewed'
        this.updateApplicationStatus(resultData.applicationId, 'interviewed');

        return result;
    }

    getInterviewResultByApplicationId(applicationId) {
        return this.interviewResults.find(result => result.applicationId === parseInt(applicationId));
    }

    getInterviewResultBySessionId(sessionId) {
        return this.interviewResults.find(result => result.sessionId === sessionId);
    }

    // ==================== STATISTICS ====================

    getHRStats() {
        const totalJobs = this.jobs.length;
        const activeJobs = this.jobs.filter(job => job.status === 'active').length;
        const totalApplications = this.applications.length;
        const pendingReviews = this.applications.filter(app => app.status === 'interviewed').length;
        const shortlisted = this.applications.filter(app => app.status === 'shortlisted').length;

        return {
            totalJobs,
            activeJobs,
            totalApplications,
            pendingReviews,
            shortlisted
        };
    }

    getCandidateStats(email) {
        const applications = this.getApplicationsByEmail(email);
        const totalApplications = applications.length;
        const pending = applications.filter(app => app.status === 'pending').length;
        const interviewed = applications.filter(app => app.status === 'interviewed').length;
        const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;

        return {
            totalApplications,
            pending,
            interviewed,
            shortlisted,
            rejected
        };
    }
}

// Create singleton instance
const db = new Database();

export default db;
