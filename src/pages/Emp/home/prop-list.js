import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const ProposalList = () => {
  const [proposals, setProposals] = useState({
    loading: true,
    data: [],
    error: null,
  });

  const [updatedProposals, setUpdatedProposals] = useState([]);
  const currentEmployerId = localStorage.getItem('userId');
  const fetchProposals = () => {
    axios.get(`http://localhost:5024/api/proposals/employer/${currentEmployerId}`) // Adjust the API URL as necessary
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
      fetchProposals(); // Refresh the proposal list
    })
    .catch(error => {
      console.error(`Failed to update proposal status to ${newStatus}:`, error);
      alert(`Failed to update status to ${newStatus}. Please try again.`);
    });
  };

  const getJobName = async (jobId) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/jobs/${jobId}`); // Adjust the API URL as necessary
      return response.data.jobTitle;
    } catch (error) {
      console.error(`Failed to fetch job name for ID ${jobId}:`, error);
      return 'Unknown'; // Return a default name if fetching fails
    }
  };

  const getJobSeekerName = async (jobSeekerId) => {
    try {
      const response = await axios.get(`http://localhost:5024/api/user/${jobSeekerId}`); // Adjust the API URL as necessary
      return response.data.name;
    } catch (error) {
      console.error(`Failed to fetch job seeker name for ID ${jobSeekerId}:`, error);
      return 'Unknown'; // Return a default name if fetching fails
    }
  };

  useEffect(() => {
    if (!proposals.loading && proposals.data.length > 0) {
      Promise.all(proposals.data.map(async proposal => {
        const jobNamePromise = getJobName(proposal.jobId);
        const jobSeekerNamePromise = getJobSeekerName(proposal.jobSeekerId);
        const [jobName, jobSeekerName] = await Promise.all([jobNamePromise, jobSeekerNamePromise]);
        return { ...proposal, jobName, jobSeekerName };
      })).then(updatedProposals => {
        setUpdatedProposals(updatedProposals);
      });
    }
  }, [proposals]);

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updatedProposals.map(proposal => (
            <tr key={proposal.id}>
              <td>{proposal.jobName}</td>
              <td>{proposal.jobSeekerName}</td>
              <td>{proposal.status}</td>
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
    </div>
  );
};
