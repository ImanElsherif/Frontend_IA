import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const JobList_seek = () => {
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const [jobNames, setJobNames] = useState({});

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

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    axios.get('http://localhost:5024/api/jobs/accepted-jobs-with-no-accepted-proposals')
      .then(async response => {
        const updatedJobs = await Promise.all(response.data.map(async job => {
          const jobName = await getJobName(job.jobId);
          return { ...job, jobName }; // Include the jobName in the job object
        }));
        setJobs({
          loading: false,
          data: updatedJobs,
          error: null,
        });
      })
      .catch(error => {
        setJobs({
          loading: false,
          data: [],
          error: error.message,
        });
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

  useEffect(() => {
    const updateJobNames = async () => {
      const updatedJobs = await Promise.all(jobs.data.map(async job => {
        const jobName = await getJobName(job.jobId);
        return { ...job, jobName };
      }));
      setJobs(prevJobs => ({ ...prevJobs, data: updatedJobs }));
    };
  
    if (!jobs.loading && jobs.data.length > 0) {
      updateJobNames();
    }
  }, [jobs]);
  

  if (jobs.loading) {
    return <div>Loading...</div>;
  }

  if (jobs.error) {
    return <div>Error: {jobs.error}</div>;
  }

  const userId = localStorage.getItem('userId');

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
  
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('jobSeekerId', userId);
    formData.append('employerId', jobs.data.find(job => job.jobId === jobId).employerId);
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
      <h1>Job List</h1>
      <ul className="list-group">
        {jobs.data.map(job => (
          <li key={job.jobId} className="list-group-item">
            <div className="d-flex flex-column align-items-start">
              <strong>{job.jobName}</strong>
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
  );
};
