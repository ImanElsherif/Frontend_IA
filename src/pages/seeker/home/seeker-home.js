import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const JobList_seek = () => {
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
        {jobs.data.filter(job => job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
          <li key={job.id} className="list-group-item d-flex justify-content-between align-items-center">
            {job.jobTitle}
          </li>
        ))}
      </ul>
    </div>
  );
};
