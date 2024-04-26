import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const UserList = () => {
const navigate = useNavigate();
  const [users, setUsers] = useState({
    loading: true,
    data: [],
    error: null,
  });

  useEffect(() => {
    axios.get('http://localhost:5024/api/user/getAllUsers') // Adjust the API URL as necessary
      .then(response => {
        setUsers({
          loading: false,
          data: response.data,
          error: null,
        });
      })
      .catch(error => {
        setUsers({
          loading: false,
          data: [],
          error: error.message,
        });
      });
  }, []);

  if (users.loading) {
    return <div>Loading...</div>;
  }

  if (users.error) {
    return <div>Error: {users.error}</div>;
  }
  const deleteUser = (userId) => {
    axios.delete(`http://localhost:5024/api/user/${userId}`)
      .then(response => {
        // Successfully deleted the user
        // Filter out the deleted user from the list
        setUsers(prevState => ({
          ...prevState,
          data: prevState.data.filter(user => user.id !== userId)
        }));
      })
      .catch(error => {
        console.error('Failed to delete user:', error);
        // Optionally handle errors, e.g., show an error message
      });
  };
  const handleUpdate = (userId) => {
    // Navigate to an update page
    navigate(`/update-user/${userId}`);
  };
  return (
    <div className="container">
      <h1>User List</h1>
      <div className="list-group">
        {users.data.map(user => (
          <div key={user.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            {user.email}
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