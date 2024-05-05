import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateUserComponent = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    companyName: '',
    email: '',
    password: '',
    companyDescription: '', // Add companyDescription field to userData state
    contactInfo: '', // Add contactInfo field to userData state
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5024/api/user/employer/${userId}`)
      .then(response => {
        const { companyName, email, companyDescription, contactInfo } = response.data;
        setUserData({ companyName, email, companyDescription, contactInfo });
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [userId]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:5024/api/user/${userId}`, userData);
      navigate('/user-list');
    } catch (error) {
      setError(error.message);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
                    id="companyName"
                    name="companyName"
                    value={userData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="companyDescription" className="form-label">Company Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="companyDescription"
                    name="companyDescription"
                    value={userData.companyDescription}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="contactInfo" className="form-label">Contact Info</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contactInfo"
                    name="contactInfo"
                    value={userData.contactInfo}
                    onChange={handleInputChange}
                  />
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
