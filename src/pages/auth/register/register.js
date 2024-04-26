import "./register.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [register, setRegister] = useState({
    loading: true,
    result: {},
    err: [],  // Initialize as an empty array
  });

  const form = useRef({
    email: "",
    password: "",
    name: "",
    skills: "",
    profile_pic: "",
    age: "",
    description_bio: ""
  });

  const submit = (e) => {
    e.preventDefault();
  
    // Prepare the payload with the correct field names and structure as required by the backend
    const payload = {
      Name: form.current.name.value,
      Email: form.current.email.value,
      Password: form.current.password.value,
      UserTypeId: 2, // Assuming '5' is a string as per the backend example provided
      Skills: form.current.skills.value,
      ProfilePic: form.current.profile_pic.value,
      Age: form.current.age.value,
      DescriptionBio: form.current.description_bio.value
    };
  
    // Log the payload to the console to confirm the structure
    console.log("Sending Request with payload:", payload);
  
    // Set loading to true before sending the request
    setRegister({ ...register, loading: true });
  
    // Make the API call
    axios.post("http://localhost:5024/api/auth/register", payload)
      .then((response) => {
        console.log("Response:", response.data);
        setRegister({ ...register, loading: false, result: response.data });
      })
      .catch((errors) => {
        console.error("Error:", errors);
        if (errors.response) {
          console.error("Error data:", errors.response.data);
          console.error("Error status:", errors.response.status);
          console.error("Error headers:", errors.response.headers);
        }
  
        const errorMessages = errors.response?.data || [{ msg: 'An unexpected error occurred' }];
        setRegister({ ...register, loading: false, err: Array.isArray(errorMessages) ? errorMessages : [errorMessages] });
      });
  };
  
  useEffect(() => {
    setRegister({ ...register, loading: true });
    axios
      .get("http://localhost:5024/api/auth/register")
      .then((data) => {
        setRegister({ ...register, result: data.data, loading: false, err: null });
      })
      .catch((err) => {
        // You can create a more specific error message or use a generic one
        const errorMsg = [{ msg: `Something went wrong: ${err.message || err}` }];
        setRegister({ ...register, loading: false, err: errorMsg });
      });
      
  }, []);
  
  const loadingSpinner = () => {
    return (
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  };
  
  const error = () => {
    if (register.err.length === 0) return null;
  
    return (
      <div className="container">
        <div className="row">
          {register.err.map((err, index) => (
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
      {register.err !== null && error()}
      {register.loading ? (
        loadingSpinner()
      ) : (
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-xl-12">
              <div className="card mb-4">
                <div className="card-header">Register as Job Seeker</div>
                <div className="card-body">
                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="name">Name</label>
                      <input className="form-control" type="text" id="name" ref={(val) => form.current.name = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="email">Email address</label>
                      <input className="form-control" type="email" id="email" ref={(val) => form.current.email = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="password">Password</label>
                      <input className="form-control" type="password" id="password" ref={(val) => form.current.password = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="skills">Skills</label>
                      <input className="form-control" type="text" id="skills" ref={(val) => form.current.skills = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="profile_pic">Profile Picture URL</label>
                      <input className="form-control" type="text" id="profile_pic" ref={(val) => form.current.profile_pic = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="age">Age</label>
                      <input className="form-control" type="number" id="age" ref={(val) => form.current.age = val} />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="description_bio">Bio</label>
                      <textarea className="form-control" id="description_bio" ref={(val) => form.current.description_bio = val}></textarea>
                    </div>
                    <button className="btn btn-primary" type="submit">Register</button>
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

