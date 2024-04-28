import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./seeker-home.css";
import '@fortawesome/fontawesome-free/css/all.css';


export const JobList_seek = () => {
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const [jobNames, setJobNames] = useState({});
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    location: '',
    minDate: '',
    maxDate: '',
    minBudget: '',
    maxBudget: '',
  });

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
  
  const filteredJobs = jobs.data.filter(job => {
    const titleMatch = job.jobName.toLowerCase().includes(searchCriteria.title.toLowerCase());
    const locationMatch = job.location.toLowerCase().includes(searchCriteria.location.toLowerCase());
    const minDateMatch = searchCriteria.minDate ? new Date(job.postCreationDate) >= new Date(searchCriteria.minDate) : true;
    const maxDateMatch = searchCriteria.maxDate ? new Date(job.postCreationDate) <= new Date(searchCriteria.maxDate) : true;
    const minBudgetMatch = searchCriteria.minBudget ? job.jobBudget >= parseFloat(searchCriteria.minBudget) : true;
    const maxBudgetMatch = searchCriteria.maxBudget ? job.jobBudget <= parseFloat(searchCriteria.maxBudget) : true;
    return titleMatch && locationMatch && minDateMatch && maxDateMatch && minBudgetMatch && maxBudgetMatch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSaveJob = (jobId) => {
    // Send a request to save the job for the current user
    axios.post(`http://localhost:5024/api/SavedJobs`, {
      jobId,
      userId,
    })
    .then(() => {
      const updatedJobsData = jobs.data.map(job => {
        if (job.jobId === jobId) {
          return { ...job, isSaved: true }; // Set isSaved flag to true
        }
        return job;
      });
      setJobs(prevJobs => ({ ...prevJobs, data: updatedJobsData }));
      alert('Job saved successfully!');
    })
    .catch(error => {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    });
  };

  return (
    <div className="container">
      <div className="row">
        {/* Search Form */}
        <div className="col-md-3">
          
          <form className="search-container">
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="title" className="form-label">Job Title</label>
                <input type="text" id="title" name="title" className="form-control" placeholder="Enter job title" value={searchCriteria.title} onChange={handleInputChange} />
              </div>
              <div className="col-12">
                <label htmlFor="location" className="form-label">Location</label>
                <input type="text" id="location" name="location" className="form-control" placeholder="Enter location" value={searchCriteria.location} onChange={handleInputChange} />
              </div>
              <div className="col-12">
                <label htmlFor="minDate" className="form-label">Min Date</label>
                <input type="date" id="minDate" name="minDate" className="form-control" value={searchCriteria.minDate} onChange={handleInputChange} />
              </div>
              <div className="col-12">
                <label htmlFor="maxDate" className="form-label">Max Date</label>
                <input type="date" id="maxDate" name="maxDate" className="form-control" value={searchCriteria.maxDate} onChange={handleInputChange} />
              </div>
              <div className="col-12">
                <label htmlFor="minBudget" className="form-label">Min Budget ($)</label>
                <input type="number" id="minBudget" name="minBudget" className="form-control" placeholder="Min budget" value={searchCriteria.minBudget} onChange={handleInputChange} />
              </div>
              <div className="col-12">
                <label htmlFor="maxBudget" className="form-label">Max Budget ($)</label>
                <input type="number" id="maxBudget" name="maxBudget" className="form-control" placeholder="Max budget" value={searchCriteria.maxBudget} onChange={handleInputChange} />
              </div>
            </div>
          </form>
        </div>
  
        {/* Job List */}
        <div className="col-md-9">
          <div className="job-list-container mt-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <h1>Job List</h1>
            <ul className="list-group">
              {filteredJobs.map(job => (
                <li key={job.jobId} className="list-group-item">
                  <div className="d-flex flex-row align-items-center justify-content-between">
                    <div>
                      <strong>{job.jobName}</strong>
                    </div>
                    {/* Save Job button */}
                    <div>
                      <button
                        className={`btn btn-sm ${job.isSaved ? 'btn-success' : 'btn-outline-secondary'} ms-2`}
                        onClick={() => handleSaveJob(job.jobId)}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  {/* Add Proposal button and file input */}
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
      </div>
    </div>
  );
  
  
};
