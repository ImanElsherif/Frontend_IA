import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateUserComponent = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    loading: false,
    data: {
      name: '',
      email: '',
      password: '',  // Assuming you might need to update password, if it's permissible
      userTypeId: '',
      departmentId: '',
      nationalCode: '',
      gender: '',
    },
    error: null,
  });

  useEffect(() => {
    setUser({ ...user, loading: true });
    axios.get(`http://localhost:5024/api/user/${userId}`)
      .then(response => {
        setUser({ loading: false, data: response.data, error: null });
      })
      .catch(error => setUser({ loading: false, data: null, error: error.message }));
  }, [userId]);

  const handleInputChange = (key, value) => {
    setUser(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:5024/api/user/${userId}`, user.data)
      .then(() => {
        navigate('/user-list'); // Navigate to user list or another success page
      })
      .catch(error => setUser({ ...user, error: error.message }));
  };

  if (user.loading) return <div>Loading...</div>;
  if (user.error) return <div>Error: {user.error}</div>;

  return (
    <div className="container h-100">
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-xl-12">
          <div className="card mb-4">
            <div className="card-header">Update User</div>
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={user.data.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={user.data.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="nationalCode" className="form-label">National Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nationalCode"
                    value={user.data.nationalCode}
                    onChange={(e) => handleInputChange('nationalCode', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userTypeId" className="form-label">Role</label>
                  <select
                    className="form-control"
                    id="userTypeId"
                    value={user.data.userTypeId}
                    onChange={(e) => handleInputChange('userTypeId', e.target.value)}
                  >
                    {/* Assuming you have the roles from somewhere, you would map them here like this: */}
                    {/* {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))} */}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="departmentId" className="form-label">Department</label>
                  <select
                    className="form-control"
                    id="departmentId"
                    value={user.data.departmentId}
                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                  >
                    {/* Assuming you have the departments from somewhere, you would map them here */}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select
                    className="form-control"
                    id="gender"
                    value={user.data.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Update User</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserComponent;
