import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const ProposalList = () => {
  const [proposals, setProposals] = useState({
    loading: true,
    data: [],
    error: null,
  });

  const [updatedProposals, setUpdatedProposals] = useState([]);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const currentEmployerId = localStorage.getItem('userId');

  const fetchProposals = () => {
    axios.get(`http://localhost:5024/api/proposals/employer/${currentEmployerId}`)
      .then(response => {
        setProposals({
          loading: false,
          data: response.data,
          error: null,
        });
      })
      .catch(error => {
        setProposals({
          loading: false,
          data: [],
          error: error.message,
        });
      });
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const updateProposalStatus = (proposalId, newStatus) => {
    axios.put(`http://localhost:5024/api/proposals/${proposalId}/status`, JSON.stringify(newStatus), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Status updated to ${newStatus}:`, response.data);
      fetchProposals();
    })
    .catch(error => {
      console.error(`Failed to update proposal status to ${newStatus}:`, error);
      alert(`Failed to update status to ${newStatus}. Please try again.`);
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

  const getJobSeekerName = async (jobSeekerId) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/user/${jobSeekerId}`);
      return response.data.name; // Assuming the response contains the job seeker's name
    } catch (error) {
      console.error(`Failed to fetch job seeker name for ID ${jobSeekerId}:`, error);
      return 'Unknown';
    }
  };

  const getJobSeekerDetails = async (jobSeekerId) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/user/seeker/${jobSeekerId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch job seeker details for ID ${jobSeekerId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (!proposals.loading && proposals.data.length > 0) {
      Promise.all(proposals.data.map(async proposal => {
        const jobNamePromise = getJobName(proposal.jobId);
        const jobSeekerPromise = getJobSeekerDetails(proposal.jobSeekerId);
        const [jobName, jobSeeker] = await Promise.all([jobNamePromise, jobSeekerPromise]);
        return { ...proposal, jobName, jobSeeker };
      })).then(updatedProposals => {
        setUpdatedProposals(updatedProposals);
      });
    }
  }, [proposals]);
  

  const handleJobSeekerClick = (jobSeeker) => {
    setSelectedJobSeeker(jobSeeker);
  };

  const closeModal = () => {
    setSelectedJobSeeker(null);
  };

  if (proposals.loading) {
    return <div>Loading...</div>;
  }

  if (proposals.error) {
    return <div>Error: {proposals.error}</div>;
  }

  return (
    <div className="container">
      <h1>Proposal List</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Job Name</th>
            <th>Job Seeker Name</th>
            <th>Status</th>
            <th>Attachment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updatedProposals.map(proposal => (
            <tr key={proposal.id}>
              <td>{proposal.jobName}</td>
              <td>
                <button className="btn btn-link" onClick={() => handleJobSeekerClick(proposal.jobSeeker)}>
                  {proposal.jobSeeker ? proposal.jobSeeker.name : 'Unknown'}
                </button>
              </td>
              <td>{proposal.status}</td>
              <td>
                {proposal.attachment && (
                  <a href={`http://localhost:5024/api/proposals/attachment/${proposal.proposalId}`} target="_blank" rel="noopener noreferrer">View Attachment</a>
                )}
              </td>
              <td>
                {proposal.status === 'Pending' && (
                  <>
                    <button className="btn btn-success me-2" onClick={() => updateProposalStatus(proposal.proposalId, 'Accepted')}>
                      Accept Proposal
                    </button>
                    <button className="btn btn-danger" onClick={() => updateProposalStatus(proposal.proposalId, 'Refused')}>
                      Refuse Proposal
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {/* Modal to display job seeker information */}
      {selectedJobSeeker && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ display: 'flex', alignItems: 'center' }}>
                {selectedJobSeeker.profilePic ? (
                  <img 
                    src={`data:image/jpeg;base64,${selectedJobSeeker.profilePic}`} 
                    alt="Profile" 
                    onError={(e) => console.error("Error loading image:", e)}
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  'N/A'
                )}
                <h5 className="modal-title" style={{ marginLeft: '10px' }}>{selectedJobSeeker.name}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Email: {selectedJobSeeker.email}</p>
                <p>Age: {selectedJobSeeker.age || 'N/A'}</p>
                <p>Skills: {selectedJobSeeker.skills || 'N/A'}</p>
                <p>Description Bio: {selectedJobSeeker.descriptionBio || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
  
};
