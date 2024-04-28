import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavedJobsList = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const [employerNames, setEmployerNames] = useState({});
  const userId = localStorage.getItem('userId');

  const handleFileSelect = (event, jobId) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [jobId]: event.target.files[0]
    }));
  };

  const [jobs, setJobs] = useState({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (userId) {
      fetchJobsAndSavedJobs();
    }
  }, [userId]);

  const fetchJobsAndSavedJobs = async () => {
    try {
      const [savedJobsResponse, jobsResponse] = await Promise.all([
        axios.get(`http://localhost:5024/api/savedjobs/${userId}`),
        axios.get(`http://localhost:5024/api/jobs`)
      ]);

      const savedJobsData = savedJobsResponse.data;
      const allJobsData = jobsResponse.data;

      const jobsWithTitles = savedJobsData.map(savedJob => {
        const job = allJobsData.find(job => job.jobId === savedJob.jobId);
        if (job) {
          return { ...job, jobTitle: job.jobTitle };
        }
        return null;
      }).filter(Boolean);

      setSavedJobs(savedJobsData);
      setJobs({
        loading: false,
        data: jobsWithTitles,
        error: null,
      });

      const employers = {};
      await Promise.all(jobsWithTitles.map(async job => {
        try {
          const response = await axios.get(`http://localhost:5024/api/user/${job.employerId}`);
          employers[job.employerId] = response.data.name;
        } catch (error) {
          console.error(`Failed to fetch employer info for job ${job.jobId}:`, error);
          employers[job.employerId] = 'Unknown';
        }
      }));
      setEmployerNames(employers);
    } catch (error) {
      console.error('Error fetching jobs and saved jobs:', error);
      setJobs({
        loading: false,
        data: [],
        error: error.message,
      });
    }
  };

  const handleShowInput = (jobId) => {
    setShowInput(prev => ({
      ...prev,
      [jobId]: true
    }));
  };

  const handleAddProposal = (jobId) => {
    if (!files[jobId]) {
      alert("Please select a file to attach with the proposal.");
      return;
    }

    const job = jobs.data.find(job => job.jobId === jobId);
    if (!job) {
      console.error(`Job with ID ${jobId} not found.`);
      return;
    }

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('jobSeekerId', userId);
    formData.append('employerId', job.employerId);
    formData.append('status', 'Pending');
    formData.append('attachment', files[jobId]);

    axios.post(`http://localhost:5024/api/proposals`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      const updatedJobsData = jobs.data.map(job => {
        if (job.jobId === jobId) {
          return { ...job, numOfProposals: (job.numOfProposals || 0) + 1 };
        }
        return job;
      });
      setJobs(prevJobs => ({ ...prevJobs, data: updatedJobsData }));

      setShowInput(prev => ({ ...prev, [jobId]: false }));
      alert('Proposal added successfully!');
    })
    .catch(error => {
      console.error('Failed to create proposal:', error);
      alert('Failed to add proposal. Please try again.');
    });
  };

  return (
    <div className="container">
      <h1>Saved Jobs</h1>
      <div className="job-list-container mt-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <ul className="list-group">
          {jobs.data.map(job => (
            <li key={job.jobId} className="list-group-item">
              <div className="row">
                <div className="col-md-8">
                  <h5>{job.jobName}</h5>
                  <p><strong>Employer:</strong> {employerNames[job.employerId]}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Budget:</strong> ${job.jobBudget}</p>
                  <p><strong>Date Posted:</strong> {new Date(job.postCreationDate).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {job.jobType}</p>
                  <p><strong>Description:</strong> {job.jobDescription}</p>
                </div>
                <div className="col-md-4">
                  <div className="text-end">
                    {!showInput[job.jobId] ? (
                      <button className="btn btn-primary mt-2" onClick={() => handleShowInput(job.jobId)}>
                        Add Proposal
                      </button>
                    ) : (
                      <>
                        <input
                          type="file"
                          className="form-control-file mt-2"
                          onChange={(e) => handleFileSelect(e, job.jobId)}
                        />
                        <button className="btn btn-success mt-2" onClick={() => handleAddProposal(job.jobId)}>
                          Submit Proposal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SavedJobsList;
