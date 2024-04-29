import "./admin-home.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AdminHome = () => {
  const navigate = useNavigate();

  const [register, setRegister] = useState({
    loading: false,
    err: [],
    successMsg: "",
  });

  const form = useRef({
    email: "",
    password: "",
    name: "",
    company_name: "",
    company_description: "",
    contact_info: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    const email = form.current.email.value;
    const password = form.current.password.value;
    const companyDescription = form.current.company_description.value;
    const contactInfo = form.current.contact_info.value;

    if (password.length < 6) {
      setRegister({
        ...register,
        err: [{ msg: "Password must be at least 6 characters long." }],
        successMsg: "",
      });
      return;
    }

    // Check if company name, description, and contact info are empty
    if (!form.current.name.value.trim()) {
      setRegister({
        ...register,
        err: [{ msg: "Company name is required." }],
        successMsg: "",
      });
      return;
    }
    if (!companyDescription.trim()) {
      setRegister({
        ...register,
        err: [{ msg: "Company description is required." }],
        successMsg: "",
      });
      return;
    }
    if (!contactInfo.trim()) {
      setRegister({
        ...register,
        err: [{ msg: "Contact info is required." }],
        successMsg: "",
      });
      return;
    }

    setRegister({ ...register, loading: true, err: [], successMsg: "" });

    const formData = {
      Name: form.current.name.value,
      Email: email,
      Password: password,
      UserTypeId: "5",
      CompanyDescription: companyDescription,
      ContactInfo: contactInfo,
    };

    try {
      const response = await axios.post(
        "http://localhost:5024/api/auth/register",
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
        successMsg: "Registration successful. You can now log in.",
        err: [],
      });
    } catch (errors) {
      if (errors.response && errors.response.status === 400) {
        setRegister({
          ...register,
          loading: false,
          err: [{ msg: "Email already exists. Please use a different email." }],
          successMsg: "",
        });
      } else {
        const errorMsg = errors.response?.data || [
          { msg: "An unexpected error occurred" },
        ];
        setRegister({
          ...register,
          loading: false,
          err: Array.isArray(errorMsg) ? errorMsg : [errorMsg],
          successMsg: "",
        });
      }
    }
  };

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
      <div className="container h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header">Register new Employer</div>
              <div className="card-body">
                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="small mb-1" htmlFor="name">Company Name</label>
                    <input
                      className="form-control"
                      type="text"
                      id="name"
                      ref={(val) => form.current.name = val}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small mb-1" htmlFor="email">Email address</label>
                    <input
                      className="form-control"
                      type="email"
                      id="email"
                      ref={(val) => form.current.email = val}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small mb-1" htmlFor="password">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      id="password"
                      ref={(val) => form.current.password = val}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="small mb-1" htmlFor="company_description">Company Description</label>
                    <textarea
                      className="form-control"
                      id="company_description"
                      ref={(val) => form.current.company_description = val}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="small mb-1" htmlFor="contact_info">Contact Info</label>
                    <input
                      className="form-control"
                      type="text"
                      id="contact_info"
                      ref={(val) => form.current.contact_info = val}
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">Register</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
