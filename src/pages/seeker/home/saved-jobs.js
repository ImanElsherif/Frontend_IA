import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavedJobsList = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchSavedJobs();
    }
  }, [userId]);

  const fetchSavedJobs = () => {
    axios.get(`http://localhost:5024/api/savedjobs/${userId}`)
      .then(async response => {
        const jobsWithTitles = await Promise.all(response.data.map(async job => {
          const jobTitle = await getJobName(job.jobId);
          return { ...job, jobTitle };
        }));
        setSavedJobs(jobsWithTitles);
      })
      .catch(error => {
        console.error('Error fetching saved jobs:', error);
      });
  };

  const getJobName = async (jobId) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/jobs/${jobId}`);
      return response.data.jobTitle;
    } catch (error) {
      console.error(`Failed to fetch job name for ID ${jobId}:`, error);
      return 'Unknown';
    }
  };

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
    formData.append('employerId', job.employerId); // Access employerId from found job
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
          return { ...job, numOfProposals: (job.numOfProposals || 0) + 1 }; // Increment numOfProposals by 1
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
      <div className="job-list-container">
        <ul className="list-group">
          {savedJobs.map(job => (
            <li key={job.jobId} className="list-group-item">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <div>
                  <strong>{job.jobTitle}</strong>
                </div>
              </div>
              <div>
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SavedJobsList;
