import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AddJob = () => {
  const navigate = useNavigate();

  const [jobState, setJobState] = useState({
    loading: false,
    result: {},
    err: [],
  });

  const form = useRef({
    jobTitle: "",
    jobDescription: "",
    jobType: "",
    jobBudget: "",
    numProposals: "",
    location: "",
    status: "",
  });

  const submit = (e) => {
    e.preventDefault();
     // Create a new Date object and adjust it to your desired timezone if needed
  let date = new Date();
  let localTime = date.getTime();
  let localOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  let utc = localTime + localOffset;
  // Optionally adjust to a specific timezone (+/- hours)
  let offset = 0;  // Change this to your desired offset from UTC
  let postCreationDate = new Date(utc + (3600000*offset)).toISOString();
    const userId = localStorage.getItem('userId');
    const payload = {
      EmployerId: userId,
      JobTitle: form.current.jobTitle.value,
      JobDescription: form.current.jobDescription.value,
      JobType: form.current.jobType.value,
      JobBudget: parseFloat(form.current.jobBudget.value),
      Location: form.current.location.value,
      NumProposals: form.current.numProposals.value,
      Status: "Pending",
      PostCreationDate: postCreationDate
    };

    console.log("Sending Request with payload:", payload);

    setJobState({ ...jobState, loading: true });

    axios.post("http://localhost:5024/api/jobs", payload)
  .then((response) => {
    console.log("Response:", response.data);
    setJobState(prevState => ({
      ...prevState,
      loading: false,  // Ensure loading is set to false upon success
      result: response.data
    }));
  })
  .catch((errors) => {
    console.error("Error:", errors);
    const errorMessages = errors.response?.data || [{ msg: 'An unexpected error occurred' }];
    setJobState(prevState => ({
      ...prevState,
      loading: false,  // Ensure loading is set to false upon error
      err: Array.isArray(errorMessages) ? errorMessages : [errorMessages]
    }));
  });

  };

  const loadingSpinner = () => (
    <div className="container h-100">
      <div className="row h-100 justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );

  const error = () => {
    if (jobState.err.length === 0) return null;
    return (
      <div className="container">
        <div className="row">
          {jobState.err.map((err, index) => (
            <div key={index} className="col-sm-12 alert alert-danger" role="alert">
              {err.msg}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {jobState.err !== null && error()}
      {jobState.loading ? (
        loadingSpinner()
      ) : (
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-xl-12">
              <div className="card mb-4">
                <div className="card-header">Post a New Job</div>
                <div className="card-body">
                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="jobTitle">Job Title</label>
                      <input className="form-control" type="text" id="jobTitle" ref={(val) => form.current.jobTitle = val} required />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="jobDescription">Job Description</label>
                      <textarea className="form-control" id="jobDescription" ref={(val) => form.current.jobDescription = val}></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="jobType">Job Type</label>
                      <select className="form-control" id="jobType" ref={(val) => form.current.jobType = val} required>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="jobBudget">Job Budget ($)</label>
                      <input className="form-control" type="number" id="jobBudget" ref={(val) => form.current.jobBudget = val} required />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="location">Location</label>
                      <input className="form-control" type="text" id="location" ref={(val) => form.current.location = val} />
                    </div>
                    <button className="btn btn-primary" type="submit">Post Job</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
