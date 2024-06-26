import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthToken } from "../../../services/auth";

const SavedJobsList = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const [employerNames, setEmployerNames] = useState({});
  const [proposalStatus, setProposalStatus] = useState({});
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [message, setMessage] = useState({ text: '', type: '' });

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
    const { token, user } = getAuthToken();
    try {
      const [savedJobsResponse, jobsResponse] = await Promise.all([
        axios.get(`http://localhost:5024/api/savedjobs/${userId}`),
        axios.get(`http://localhost:5024/api/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);
  
      const savedJobsData = savedJobsResponse.data;
      const allJobsData = jobsResponse.data;
  
      const jobsWithTitles = savedJobsData.map(savedJob => {
        const job = allJobsData.find(job => job.jobId === savedJob.jobId);
        if (job) {
          return { ...job, jobTitle: job.jobTitle, savedJobId: savedJob.savedJobId }; // Add savedJobId here
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
      const statuses = {};
      await Promise.all(jobsWithTitles.map(async job => {
        try {
          const response = await axios.get(`http://localhost:5024/api/user/employer/${job.employerId}`);
          employers[job.employerId] = response.data.name;
  
          fetchUserProposals(job.jobId);
  
        } catch (error) {
          console.error(`Failed to fetch employer info for job ${job.jobId}:`, error);
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
  
  const fetchUserProposals = async (jobId) => {
    try {
      const userProposalsResponse = await axios.get(`http://localhost:5024/api/proposals/job/${jobId}/user/${userId}`);
      const status = userProposalsResponse.data || 'No Proposal';
      setProposalStatus(prevStatuses => ({ ...prevStatuses, [jobId]: status }));
    } catch (error) {
      console.error(`Failed to fetch proposal status for job ${jobId}:`, error);
      setProposalStatus(prevStatuses => ({ ...prevStatuses, [jobId]: 'No Proposal' }));
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
      setMessage({ text: "Please select a file to attach with the proposal.", type: 'error' });
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
      setProposalStatus(prevStatuses => ({ ...prevStatuses, [jobId]: 'Pending' }));
      setMessage({ text: 'Proposal added successfully!', type: 'success' });
    })
    .catch(error => {
      console.error('Failed to create proposal:', error);
      setMessage({ text: 'Failed to add proposal. Please try again.', type: 'error' });
    });
  };

  const deleteSavedJob = (savedJobId) => {
    axios.delete(`http://localhost:5024/api/savedjobs/${savedJobId}`)
      .then(() => {
        setMessage({ text: "Job deleted successfully!", type: 'success' });
        // Filter out the deleted job from the jobs state
        const updatedJobs = jobs.data.filter(job => job.savedJobId !== savedJobId);
        setJobs(prevJobs => ({ ...prevJobs, data: updatedJobs }));
      })
      .catch(error => {
        console.error('Failed to delete the saved job:', error);
        setMessage({ text: "Failed to delete job. Please try again.", type: 'error' });
      });
  };

  return (
    <div className="container">
      <h1>Saved Jobs</h1>
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message.text}
        </div>
      )}
      <div className="job-list-container mt-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <ul className="list-group">
          {jobs.data.map(job => (
            <li key={job.jobId} className="list-group-item">
              <div className="row">
                <div className="col-md-8">
                  <div>
                    <h5><strong>Job Title: {job.jobTitle}</strong></h5>
                    <p><strong>Company Name:</strong> {employerNames[job.employerId]}</p>
                    <p><strong>Description:</strong> {job.jobDescription}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Budget:</strong> ${job.jobBudget}</p>
                    <p><strong>Date Posted:</strong> {new Date(job.postCreationDate).toLocaleDateString()}</p>
                    <p><strong>Type:</strong> {job.jobType}</p>
                    {(!showInput[job.jobId] && proposalStatus[job.jobId] !== 'No Proposal') && (
                      <p><strong>Your Proposal Status:</strong> 
                        <button
                          className={`btn btn-sm ${proposalStatus[job.jobId] === 'Accepted' ? 'btn-success' : proposalStatus[job.jobId] === 'Pending' ? 'btn-warning' : 'btn-danger'} ms-2`}
                        >
                          {proposalStatus[job.jobId]}
                        </button>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="col-md-4">
                <button
  className={`btn btn-sm btn-outline-secondary ms-2`}
  onClick={() => deleteSavedJob(job.savedJobId)} // Use the deleteSavedJob function
>
  <i className="fas fa-trash"></i> Unsave
</button> 
                  {!showInput[job.jobId] && proposalStatus[job.jobId] === 'No Proposal' && (
                    <div className="text-end">
                      <button className="btn btn-primary mt-2" onClick={() => handleShowInput(job.jobId)}>
                        Add Proposal
                      </button>
                    </div>
                  )}
                
                  {showInput[job.jobId] && (
                    <div className="text-end mt-2">
                      <input type="file" onChange={(event) => handleFileSelect(event, job.jobId)} />
                      <button className="btn btn-success mt-2" onClick={() => handleAddProposal(job.jobId)}>
                        Submit Proposal
                      </button>
                      
                    </div>
                  )}
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
