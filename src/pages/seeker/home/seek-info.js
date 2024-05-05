import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobSeekerInfo = () => {
  const [jobSeeker, setJobSeeker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
console.log("id",userId)
    const fetchJobSeeker = async () => {
      try {
        const response = await axios.get(`http://localhost:5024/api/user/seeker/${userId}`);
        setJobSeeker(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchJobSeeker();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {jobSeeker.profilePic && (
          <div style={{ marginRight: '20px' }}>
            <img src={`data:image/jpeg;base64,${jobSeeker.profilePic}`} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
          </div>
        )}
        <div>
          <h5 style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{jobSeeker.name}</h5>
          <p><strong>Email:</strong> {jobSeeker.email}</p>
          <p><strong>Age:</strong> {jobSeeker.age || 'N/A'}</p>
          <p><strong>Skills:</strong> {jobSeeker.skills || 'N/A'}</p>
          <p><strong>Description Bio:</strong> {jobSeeker.descriptionBio || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
  
  
  
};

export default JobSeekerInfo;
