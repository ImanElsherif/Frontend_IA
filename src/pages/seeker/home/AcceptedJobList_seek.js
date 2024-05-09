import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./seeker-home.css";
import '@fortawesome/fontawesome-free/css/all.css';

export const AcceptedJobList_seek = () => {
  const [jobs, setJobs] = useState({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  const fetchAcceptedJobs = () => {
    const userId = localStorage.getItem('userId');
    axios.get(`http://localhost:5024/api/proposals/seeker/${userId}`)
      .then(async response => {
        const jobsData = await Promise.all(response.data.map(async proposal => {
          const jobResponse = await axios.get(`http://localhost:5024/api/jobs/${proposal.jobId}`);
          return {
            ...jobResponse.data,
            proposalId: proposal.proposalId // Add proposalId to identify the proposal later if needed
          };
        }));
        setJobs({
          loading: false,
          data: jobsData,
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

  const handleJoinJob = (jobId) => {
    // Implement join job functionality here
    console.log(`Joining job with ID ${jobId}`);
  };

  if (jobs.loading) {
    return <div>Loading...</div>;
  }

  if (jobs.error) {
    return <div>Error: {jobs.error}</div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="job-list-container mt-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <h1>Accepted Job List</h1>
            <ul className="list-group">
              {jobs.data.map(job => (
                <li key={job.jobId} className="list-group-item">
                  <div className="row">
                    <div className="col-md-8">
                      <h5><strong>Job Title: {job.jobTitle}</strong></h5>
                      <p><strong>Description:</strong> {job.jobDescription}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Budget:</strong> ${job.jobBudget}</p>
                      <p><strong>Date Posted:</strong> {new Date(job.postCreationDate).toLocaleDateString()}</p>
                      <p><strong>Type:</strong> {job.jobType}</p>
                    </div>
                    <div className="col-md-4">
                      <div className="text-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleJoinJob(job.jobId)}
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
