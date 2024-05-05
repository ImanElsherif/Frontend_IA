import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const JobList = () => {
  const [jobs, setJobs] = useState({
    loading: true,
    data: [],
    error: null,
  });

  const [employerNames, setEmployerNames] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchEmployerNames = async () => {
      const employers = {};
      await Promise.all(jobs.data.map(async job => {
        try {
          const response = await axios.get(`http://localhost:5024/api/user/employer/${job.employerId}`);
          employers[job.employerId] = response.data.companyName;
        } catch (error) {
          console.error(`Failed to fetch employer info for job ${job.jobId}:`, error);
          employers[job.employerId] = 'Unknown';
        }
      }));
      setEmployerNames(employers);
    };

    if (!jobs.loading && jobs.data.length > 0) {
      fetchEmployerNames();
    }
  }, [jobs]);

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

  const updateJobStatus = (jobId, newStatus) => {
    axios.put(`http://localhost:5024/api/jobs/${jobId}/status`, JSON.stringify(newStatus), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Status updated to ${newStatus}:`, response.data);
      fetchJobs();
    })
    .catch(error => {
      console.error(`Failed to update job status to ${newStatus}:`, error);
      alert(`Failed to update status to ${newStatus}. Please try again.`);
    });
  };

  if (jobs.loading) {
    return <div>Loading...</div>;
  }

  if (jobs.error) {
    return <div>Error: {jobs.error}</div>;
  }

  return (
    <div className="container">
      <h1>Job List</h1>
      <div className="job-list-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <ul className="list-group">
          {jobs.data.map(job => (
            <li key={job.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="col-md-8">
                <h5><strong>Job Title: {job.jobTitle}</strong></h5>
                <p><strong>Company Name:</strong> {employerNames[job.employerId]}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Budget:</strong> ${job.jobBudget}</p>
                <p><strong>Date Posted:</strong> {new Date(job.postCreationDate).toLocaleDateString()}</p>
                <p><strong>Type:</strong> {job.jobType}</p>
                <p><strong>Description:</strong> {job.jobDescription}</p>
              </div>
              <div>
                {job.status === 'Pending' && (
                  <>
                    <button className="btn btn-success me-2" onClick={() => updateJobStatus(job.jobId, 'Accepted')}>
                      Accept Job
                    </button>
                    <button className="btn btn-danger" onClick={() => updateJobStatus(job.jobId, 'Refused')}>
                      Refuse Job
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
