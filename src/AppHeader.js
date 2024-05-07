import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../../services/auth";

export const AppHeader = () => {
  const { token, user } = getAuthToken();
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      // Check if the user is on the login page
      if (location.pathname === "/login" && action === "POP" && token) {
        // Logout the user if they are on the login page and have a token
        removeAuthToken();
      }
    });

    return () => {
      unlisten(); // Cleanup the listener when the component unmounts
    };
  }, [history, token]);

  const handleLogout = () => {
    removeAuthToken();
    history.push("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-3 h-10">
        {/* Your navbar content */}
        
        <ul className="navbar-nav ml-auto">
          {!token && (
            <>
              {/* Your login and register links */}
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
