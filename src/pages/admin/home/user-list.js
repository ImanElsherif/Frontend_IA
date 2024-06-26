import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthToken } from "../../../services/auth";

export const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { token, user } = getAuthToken();
      try {
        const response = await axios.get('http://localhost:5024/api/user/employers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers({
          loading: false,
          data: response.data,
          error: null,
        });
      } catch (error) {
        console.error('Failed to fetch user list:', error);
        // Retry fetching data after a short delay (e.g., 3 seconds)
      
        setUsers({
          ...users,
          loading: false,
          error: 'Failed to fetch user list. ',
        });
      }
    };

    fetchData();
  }, []);

  if (users.loading) {
    return <div>Loading...</div>;
  }

  if (users.error) {
    return <div>Error: {users.error}</div>;
  }

  const deleteUser = (userId) => {
    const { token, user } = getAuthToken();
    axios.delete(`http://localhost:5024/api/user/employer/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setUsers(prevState => ({
          ...prevState,
          data: prevState.data.filter(user => user.id !== userId)
        }));
      })
      .catch(error => {
        console.error('Failed to delete user:', error);
      });
  };

  const handleUpdate = (userId) => {
    navigate(`/update-user/${userId}`);
  };

  return (
    <div className="container">
      <h1>Company List</h1>
      <div className="list-group" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {users.data.map(user => (
          <div key={user.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div className="col-md-8">
              <p><strong>Company Name:</strong> {user.companyName}</p>
              <p><strong>Company Email:</strong> {user.email}</p>
              <p><strong>Company Description:</strong> {user.companyDescription}</p>
              <p><strong>Contact Info:</strong> {user.contactInfo}</p>
              
            </div>
            <div>
              <button className="btn btn-warning me-2" onClick={() => handleUpdate(user.id)}>Update</button>
              <button className="btn btn-danger" onClick={() => deleteUser(user.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
