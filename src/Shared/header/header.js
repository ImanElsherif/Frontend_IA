import "./header.css";
import image from "../../assets/images/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../../services/auth";
import React, { useEffect } from "react";

export const AppHeader = () => {
  const { token, user } = getAuthToken();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Push a new history state when user logs in
    if (token && location.pathname === "/login") {
      navigate("/");
    }
  }, [token, location, navigate]);
  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
  };

  if (location.pathname === "/login" || location.pathname === "/register") {
    return (
      <>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-3 h-10">
          
          {/* <Link to={'/'} className="navbar-brand">
            <img src={image} alt="error" style={{ width: 30, height: 30, marginRight: 10 }} />
            Navbar
          </Link> */}
          <ul className="navbar-nav ml-auto">
            {location.pathname === "/login" && (
              <li className="nav-item">
                <Link to={"/register"} className="nav-link">
                  Register
                </Link>
              </li>
            )}
            {location.pathname === "/register" && (
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  Login
                </Link>
              </li>
              
            )}
          </ul>
        </nav>
      </>
    );
  }

  // Redirect to home page if the user is logged in and tries to access login or register page
  if (token && (location.pathname === "/login" || location.pathname === "/register")) {
    navigate("/");
  }

  return (
    <>
    
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-3 h-10">
        {<h1 className="logo">Job Connect</h1>

/* <Link to={'/'} className="navbar-brand">
        
          <img src={image} alt="error" style={{ w
            idth: 30, height: 30, marginRight: 10 }} />
          Navbar
        </Link> */}
        
        <ul className="navbar-nav mr-auto">
          {user && user.role === "Admin" && (
            <>
              <li className="navbar-brand">
                Admin
              </li>
              <li className="nav-item">
                <Link to={"/admin-home"} className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/user-list"} className="nav-link">
                  Users
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/job-list"} className="nav-link">
                  Jobs
                </Link>
              </li>
            </>
          )}
          {user && user.role === "employer" && (
            <>
              <li className="navbar-brand">
                Employer
              </li>
              <li className="nav-item">
                <Link to={"/emp-home"} className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/prop-list"} className="nav-link">
                  Proposals
                </Link>
              </li>
            </>
          )}
          {user && user.role === "job seeker" && (
            <>
              <li className="navbar-brand">
                Job seeker
              </li>
              <li className="nav-item">
                <Link to={"/seeker-info"} className="nav-link">
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/seeker-home"} className="nav-link">
                  Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/saved-jobs"} className="nav-link">
                  Saved Jobs
                </Link>
              </li>
            </>
          )}
        </ul>
        <ul className="navbar-nav ml-auto">
          {!token && (
            <>
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  login
                </Link>
              </li>
            </>
          )}
          {token && (
            <li
              style={{ cursor: "pointer" }}
              onClick={handleLogout}
              className="nav-item"
            >
              <a className="nav-link">Logout</a>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};
