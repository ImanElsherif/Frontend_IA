import { Navigate, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Login } from "./pages/auth/login/login";
import { Register } from "./pages/auth/register/register";
import { AdminHome } from "./pages/admin/home/admin-home";
import { UserList } from "./pages/admin/home/user-list";
import { JobList } from "./pages/admin/home/job-list";
import { ProposalList } from "./pages/Emp/home/prop-list";
import UpdateUserComponent from "./pages/admin/home/update-user"; 
import { AddJob } from "./pages/Emp/home/emp-home";
import { JobList_seek } from "./pages/seeker/home/seeker-home";
import SavedJobsList from "./pages/seeker/home/saved-jobs"; 
import JobSeekerInfo from "./pages/seeker/home/seek-info"; 
import { Home } from "./pages/home/home";


export const routes = createBrowserRouter([
  {
    path: "", //localhost:3000
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },

      // Auth Routes
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },

      // Admin Routes
      {
        path: "/admin-home",element: <AdminHome />,},
      { path: "/user-list",element: <UserList /> },
      { path: "/update-user/:userId", element: <UpdateUserComponent /> },
      { path: "/job-list",element: <JobList /> },
      
      
      // Emp Routes
      {path: "/emp-home",element: <AddJob />,},
      {path: "/prop-list",element: <ProposalList />,},

      // Seeker Routes
      {path: "/seeker-home",element: <JobList_seek />,},
      {path: "/saved-jobs",element: <SavedJobsList />,},
      {path: "/seeker-info",element: <JobSeekerInfo />,},
      
      {path: "*",element: <Navigate to={"/"} />,},
    ],
  },
]);
