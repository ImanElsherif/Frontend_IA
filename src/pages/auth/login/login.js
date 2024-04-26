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
        setAuthToken(data.data.token);
        if (user.role === "Admin") {
          navigate("/admin-home");
        } else if (user.role === "Professor") {
          navigate("/professor-home");
        }
      })
      .catch((errors) => {
        if (typeof errors.response.data.message === "string") {
          setLogin({ ...login, loading: false, err: [{ msg: errors.response.data.message }] });
        } else {
          setLogin({ ...login, loading: false, err: errors.response.data.message });
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
                        type="text"
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
