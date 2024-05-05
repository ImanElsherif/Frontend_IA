import "./register.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [register, setRegister] = useState({
    loading: true,
    result: {},
    err: [], // Initialize as an empty array
    successMsg: "",
  });

  const form = useRef({
    email: "",
    password: "",
    name: "",
    skills: "",
    profile_pic: "",
    age: "",
    description_bio: "",
  });

  const submit = async (e) => {
    e.preventDefault();
  
    const email = form.current.email.value;
    const password = form.current.password.value;
  
    if (password.length < 6) {
      setRegister({
        ...register,
        err: [{ msg: "Password must be at least 6 characters long." }],
        successMsg: "", // Clear success message
      });
      return;
    }
  
    setRegister({ ...register, loading: true, err: [], successMsg: "" }); // Clear errors and success message before submitting
  
    const formData = new FormData();
    formData.append("Name", form.current.name.value);
    formData.append("Email", email);
    formData.append("Password", password);
    formData.append("UserTypeId", 3);
    formData.append("Skills", form.current.skills.value);
    formData.append("Age", form.current.age.value);
    formData.append("DescriptionBio", form.current.description_bio.value);
    formData.append("ProfilePic", form.current.profile_pic);
  
    try {
      const response = await axios.post(
        "http://localhost:5024/api/auth/register-jobseeker",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setRegister({
        ...register,
        loading: false,
        result: response.data,
        successMsg: "Registration successful. You can now log in.",
        err: [], // Clear any previous errors
      });
    } catch (errors) {
      if (errors.response && errors.response.status === 400) {
        setRegister({
          ...register,
          loading: false,
          err: [{ msg: "Email already exists. Please use a different email." }],
          successMsg: "", // Clear success message
        });
      } else {
        const errorMsg = errors.response?.data || [
          { msg: "An unexpected error occurred" },
        ];
        setRegister({
          ...register,
          loading: false,
          err: Array.isArray(errorMsg) ? errorMsg : [errorMsg],
          successMsg: "", // Clear success message
        });
      }
    }
  };
  

  useEffect(() => {
    setRegister({ ...register, loading: false });
  }, []); // Clear loading on component mount

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

  const successMessage = () => {
    if (register.successMsg === "") return null;

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12 alert alert-success" role="alert">
            {register.successMsg}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {error()}
      {successMessage()}
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
                      <label className="small mb-1" htmlFor="name">
                        Name
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        id="name"
                        ref={(val) => (form.current.name = val)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="email">
                        Email address
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        id="email"
                        ref={(val) => (form.current.email = val)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="password">
                        Password
                      </label>
                      <input
                        className="form-control"
                        type="password"
                        id="password"
                        ref={(val) => (form.current.password = val)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="skills">
                        Skills
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        id="skills"
                        ref={(val) => (form.current.skills = val)}
                        required
                      />
                    </div>
                    <div className="mb-3">
  <label className="small mb-1" htmlFor="profile_pic">
    Profile Picture
  </label>
  <input
    className="form-control"
    type="file"
    id="profile_pic"
    accept="image/*"
    onChange={(e) => {
      form.current.profile_pic = e.target.files[0];
    }}
    required
  />
</div>

                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="age">
                        Age
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        id="age"
                        ref={(val) => (form.current.age = val)} required min="18"
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        className="small mb-1"
                        htmlFor="description_bio"
                      >
                        Bio
                      </label>
                      <textarea
                        className="form-control"
                        id="description_bio"
                        ref={(val) => (form.current.description_bio = val)} required
                      ></textarea>
                    </div>
                    <button className="btn btn-primary" type="submit">
                      Register
                    </button>
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
