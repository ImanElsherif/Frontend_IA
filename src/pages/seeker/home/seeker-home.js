import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./seeker-home.css";
import '@fortawesome/fontawesome-free/css/all.css';


export const JobList_seek = () => {
  const [files, setFiles] = useState({});
  const [showInput, setShowInput] = useState({});
  const [jobNames, setJobNames] = useState({});
  const [userProposals, setUserProposals] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
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
    fetchUserProposals();
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

  const fetchUserProposals = () => {
    // Fetch proposals submitted by the current user
    const userId = localStorage.getItem('userId');
    axios.get(`http://localhost:5024/api/proposals/user/${userId}`)
      .then(response => {
        // Organize user proposals by jobId
        const userProposalsByJob = {};
        response.data.forEach(proposal => {
          userProposalsByJob[proposal.jobId] = proposal.status;
        });
        setUserProposals(userProposalsByJob);
      })
      .catch(error => {
        console.error('Failed to fetch user proposals:', error);
      });
  };

  useEffect(() => {
    const updateJobNames = async () => {
      const employers = {};
      await Promise.all(jobs.data.map(async job => {
        try {
          const response = await axios.get(`http://localhost:5024/api/user/${job.employerId}`);
          employers[job.employerId] = response.data.name;
        } catch (error) {
          console.error(`Failed to fetch employer info for job ${job.jobId}:`, error);
          employers[job.employerId] = 'Unknown';
        }
      }));
      setJobNames(employers);
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
      setMessage({ text: "Please select a file to attach with the proposal.", type: 'error' });
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
      setUserProposals(prevProposals => ({ ...prevProposals, [jobId]: 'Pending' })); // Update userProposals here
      setMessage({ text: 'Proposal added successfully!', type: 'success' });
    })
    .catch(error => {
      console.error('Failed to create proposal:', error);
      setMessage({ text: 'Failed to add proposal. Please try again.', type: 'error' });
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
      setMessage({ text: 'Job saved successfully!', type: 'success' });
    })
    .catch(error => {
      console.error('Failed to save job:', error);
      setMessage({ text: 'Job saved successfully!', type: 'success' });
    });
  };

  return (
    <div className="container">
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message.text}
        </div>
      )}
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
    <div className="row">
      <div className="col-md-8">
        <h5><strong>Job Title: {job.jobName}</strong></h5>
        <p><strong>Company Name::</strong> {jobNames[job.employerId]}</p>
        <p><strong>Description:</strong> {job.jobDescription}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Budget:</strong> ${job.jobBudget}</p>
        <p><strong>Date Posted:</strong> {new Date(job.postCreationDate).toLocaleDateString()}</p>
        <p><strong>Type:</strong> {job.jobType}</p>
        {(!showInput[job.jobId] && userProposals[job.jobId]) && ( // Only show if there is no Add Proposal button
          <p><strong>Your Proposal Status:</strong> 
            <button
              className={`btn btn-sm ${userProposals[job.jobId] === 'Accepted' ? 'btn-success' : userProposals[job.jobId] === 'Pending' ? 'btn-warning' : 'btn-danger'} ms-2`}
            >
              {userProposals[job.jobId] || 'No Proposal'}
            </button>
          </p>
        )}
      </div>
      <div className="col-md-4">
        {/* Save Job button */}
        <div className="text-end">
          <button
            className={`btn btn-sm ${job.isSaved ? 'btn-success' : 'btn-outline-secondary'} ms-2`}
            onClick={() => handleSaveJob(job.jobId)}
          >
            <i className="fas fa-heart"></i> Save
          </button>
        </div>
        {/* Add Proposal button and file input */}
        <div className="text-end mt-3">
          {!showInput[job.jobId] && !userProposals[job.jobId] ? (
            <button className="btn btn-primary" onClick={() => handleShowInput(job.jobId)}>
              Add Proposal
            </button>
          ) : (
            <>
              {!userProposals[job.jobId] && ( // Only show if there is no proposal
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
            </>
          )}
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
