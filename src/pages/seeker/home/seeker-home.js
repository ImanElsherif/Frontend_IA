import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const JobList_seek = () => {
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
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
    axios.get('http://localhost:5024/api/jobs')
      .then(response => {
        setJobs({
          loading: false,
          data: response.data,
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
      [jobId]: true  // Show input for this specific job
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
    formData.append('employerId', jobs.data.find(job => job.jobId === jobId).employerId); // Ensure this is correct
    formData.append('status', 'Pending');
    formData.append('attachment', files[jobId]);
  
    axios.post(`http://localhost:5024/api/proposals`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        // Increment proposal count in frontend
        const updatedJobsData = jobs.data.map(job => {
          if (job.jobId === jobId) {
            return { ...job, numOfProposals: (job.numOfProposals || 0) + 1 };
          }
          return job;
        });
        setJobs(prevJobs => ({ ...prevJobs, data: updatedJobsData }));
  
        // Increment proposal count in backend
        axios.patch(`http://localhost:5024/api/jobs/${jobId}/increment-proposals`)
          .then(() => {
            alert('Proposal added successfully!');
            fetchJobs();  // Refresh the list
            setShowInput(prev => ({ ...prev, [jobId]: false }));  // Hide the input after submission
          })
          .catch(error => {
            console.error('Failed to increment proposals in backend:', error);
            alert('Failed to add proposal. Please try again.');
          });
      })
      .catch(error => {
        console.error('Failed to create proposal:', error);
        alert('Failed to add proposal. Please try again.');
      });
  };
  
  
  
  return (
    <div className="container">
    <h1>Job List</h1>
    <input
      type="text"
      className="form-control mb-3"
      placeholder="Search jobs by title..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
    <ul className="list-group">
      {jobs.data
        .filter(job => job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) && job.status === 'Accepted')
        .map(job => (
          <li key={job.jobId} className="list-group-item">
            <div className="d-flex flex-column align-items-start">
              <strong>{job.jobTitle}</strong>
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
