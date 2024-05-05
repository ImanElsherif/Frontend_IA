import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import axios from "axios";
import jwt from "jwt-decode";
import { setAuthToken } from "../../../services/auth";

export const Login = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    loading: false,
    err: null,
  });

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const form = useRef({
    email: "",
    password: "",
  });

  useEffect(() => {
    const lockoutInfo = JSON.parse(localStorage.getItem("lockoutInfo"));
    if (lockoutInfo && lockoutInfo.isLockedOut) {
      const timeRemaining = Math.ceil((lockoutInfo.unlockTime - Date.now()) / 1000);
      if (timeRemaining > 0) {
        setLockoutTimeRemaining(timeRemaining);
        activateLockoutTimer(timeRemaining);
      } else {
        resetLockout();
      }
    }
  }, []);

  const submit = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (lockoutTimeRemaining > 0) {
      return;
    }

    setLogin({ ...login, loading: true });
    axios
      .post("http://localhost:5024/api/Auth/login", {
        email: form.current.email.value,
        password: form.current.password.value,
      })
      .then((data) => {
        // Successful login
        resetLockout();
        handleLoginSuccess(data);
      })
      .catch((error) => {
        // Failed login
        handleLoginFailure(error);
      });
  };

  const handleLoginSuccess = (data) => {
    setLogin({ ...login, loading: false });
    const user = jwt(data.data.token);
    console.log("user",user)
    localStorage.setItem("token", data.token); // Store token
    localStorage.setItem("userId", user.nameid);
    setAuthToken(data.data.token);
    navigateBasedOnUserRole(user.role);
  };

  const handleLoginFailure = (error) => {
    if (error.response.status === 401) {
      // Unauthorized: Incorrect email or password
      setLogin({
        ...login,
        loading: false,
        err: [{ msg: "Incorrect email or password. Please try again." }],
      });
      incrementFailedAttempts();
      if (failedAttempts + 1 === 3) {
        // Activate lockout timer
        activateLockoutTimer(10); // 10 seconds lockout period
      }
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
  };

  const incrementFailedAttempts = () => {
    setFailedAttempts(failedAttempts + 1);
  };

  const navigateBasedOnUserRole = (role) => {
    if (role === "Admin") {
      navigate("/admin-home");
    } else if (role === "employer") {
      navigate("/emp-home");
    } else if (role === "job seeker") {
      navigate("/seeker-home");
    }
  };

  const activateLockoutTimer = (lockoutPeriod) => {
    const unlockTime = Date.now() + lockoutPeriod * 1000;
    setLockoutTimeRemaining(lockoutPeriod);
    localStorage.setItem("lockoutInfo", JSON.stringify({ isLockedOut: true, unlockTime }));
    const timer = setInterval(() => {
      setLockoutTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          resetLockout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const resetLockout = () => {
    localStorage.removeItem("lockoutInfo");
    setLockoutTimeRemaining(0);
    setFailedAttempts(0);
  };

  return (
    <>
      {/* Error message display */}
      {login.err !== null && (
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
      )}

      {/* Lockout message and timer */}
      {lockoutTimeRemaining > 0 && (
        <div className="container">
          <div className="row">
            <div className="col-sm-12 alert alert-warning" role="alert">
              You have exceeded the maximum number of login attempts. Please wait for {lockoutTimeRemaining} seconds before trying again.
            </div>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {login.loading === true ? (
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        /* Login form */
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
