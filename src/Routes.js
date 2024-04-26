import { Navigate, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Login } from "./pages/auth/login/login";
import { Register } from "./pages/auth/register/register";
import { AdminHome } from "./pages/admin/home/admin-home";
import { UserList } from "./pages/admin/home/user-list";
import UpdateUserComponent from "./pages/admin/home/update-user"; 
import { ProfessorHome } from "./pages/Professor/home/professor-home";
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
        path: "/admin-home", // home page
        element: <AdminHome />,
      },
      { path: "/user-list",element: <UserList /> },
      { path: "/update-user/:userId", element: <UpdateUserComponent /> },
      // Professor Routes
      {
        path: "/professor-home",
        element: <ProfessorHome />,
      },

      {
        path: "*",
        element: <Navigate to={"/"} />,
      },
    ],
  },
]);
