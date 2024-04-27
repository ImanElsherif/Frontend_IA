import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const JobList = () => {
  const [jobs, setJobs] = useState({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    axios.get('http://localhost:5024/api/jobs') // Adjust the API URL as necessary
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
    // Sending just a plain string as the request body
    axios.put(`http://localhost:5024/api/jobs/${jobId}/status`, JSON.stringify(newStatus), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Status updated to ${newStatus}:`, response.data);
      fetchJobs(); // Refresh the job list
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
      <ul className="list-group">
        {jobs.data.map(job => (
          <li key={job.id} className="list-group-item d-flex justify-content-between align-items-center">
            {job.jobTitle}
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
  );
};
