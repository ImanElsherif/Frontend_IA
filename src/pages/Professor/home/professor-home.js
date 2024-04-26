import { useNavigate } from "react-router-dom";
import "./professor-home.css";
import { useRef, useState } from "react";
import axios from "axios";
import jwt from "jwt-decode";
import { getAuthToken } from "../../../services/auth";

export const ProfessorHome = () => {

  return (
    <>
      <h1>Professor Home Page</h1>
    </>
  );
};
