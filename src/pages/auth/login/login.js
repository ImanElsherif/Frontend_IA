import { useNavigate } from "react-router-dom";
import "./login.css";
import { useRef, useState } from "react";
import axios from "axios";
import jwt from "jwt-decode";
import { setAuthToken } from "../../../services/auth";

export const Login = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    loading: false,
    err: null,
  });

  const form = useRef({
    email: "",
    password: "",
  });

  const submit = (e) => {
    e.preventDefault();
    setLogin({ ...login, loading: true });
    axios
      .post("http://localhost:5024/api/Auth/login", {
        email: form.current.email.value,
        password: form.current.password.value,
      })
      .then((data) => {
        console.log(data);
        setLogin({ ...login, loading: false });
        const user = jwt(data.data.token);
        console.log('user', user);
        localStorage.setItem('token', data.token); // Store token
        localStorage.setItem('userId', user.nameid); 
        const userId = localStorage.getItem('userId');
        console.log("Retrieved userID:", userId);// Assuming the decoded token has userId
        setAuthToken(data.data.token);
        if (user.role === "Admin") {
          navigate("/admin-home");
        } else if (user.role === "employer") {
          navigate("/emp-home");
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          // Unauthorized: Incorrect email or password
          setLogin({
            ...login,
            loading: false,
            err: [{ msg: "Incorrect email or password. Please try again." }],
          });
        } else if (error.response.status === 404) {
          // Not Found: Email not registered
          setLogin({
            ...login,
            loading: false,
            err: [{ msg: "Email not registered. Please sign up." }],
          });
        } else {
          // Other errors
          setLogin({
            ...login,
            loading: false,
            err: [{ msg: "An unexpected error occurred. Please try again later." }],
          });
        }
      });
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
    return (
      <div className="container">
        <div className="row">
          {login.err.map((err, index) => {
            return (
              <div key={index} className="col-sm-12 alert alert-danger" role="alert">
                {err.msg}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {login.err !== null && error()}
      {login.loading === true ? (
        loadingSpinner()
      ) : (
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-xl-12">
              <div className="card mb-4">
                <div className="card-header">Login</div>
                <div className="card-body">
                  <form onSubmit={(e) => submit(e)}>
                    <div className="mb-3">
                      <label className="small mb-1" htmlFor="email">
                        Email address
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        id="email"
                        ref={(val) => {
                          form.current.email = val;
                        }}
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
                        ref={(val) => {
                          form.current.password = val;
                        }}
                      />
                    </div>
                    <button className="btn btn-primary form-control" type="submit">
                      Login
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
