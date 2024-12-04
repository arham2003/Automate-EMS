import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const Dashboard = () => {
  const anvigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleLogout = () => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`).then((result) => {
      if (result.data.Status) {
        localStorage.removeItem("valid");
        anvigate("/");
      }
    });
  };
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark bg-gradient">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to="/dashboard"
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
                Gray Coders
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-0 align-middle"
                >
                  <i class="bi bi-houses ms-2 fs-4"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/employee"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-people ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">
                    Manage Employees
                  </span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/customer"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i class="bi bi-person-workspace ms-2 fs-4"></i>
                  <span className="ms-2 d-none d-sm-inline">
                    Manage Customers
                  </span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/departments"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i class="bi bi-building-add ms-2 fs-4"></i>
                  <span className="ms-2 d-none d-sm-inline">Departments </span>
                </Link>
              </li>
              {/*  */}
              <li className="w-100">
                <Link
                  to="/dashboard/projects"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i class="bi bi-file-bar-graph ms-2 fs-4"></i>
                  <span className="ms-2 d-none d-sm-inline">Projects </span>
                </Link>
              </li>

              <li className="w-100">
                <Link
                  to="/dashboard/attendance"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-columns ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Attendance </span>
                </Link>
              </li>
              {/* <li className="w-100">
                <Link
                  to="/dashboard/update_attendance"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-columns ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Update Attendance </span>
                </Link>
              </li> */}

              <li className="w-100">
                <Link
                  to="/dashboard/salaries"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i class="bi bi-coin fs-4 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Salaries</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/profile"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i class="bi bi-file-earmark-pdf fs-4 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Submitted Work</span>
                </Link>
              </li>
              <li className="w-100" onClick={handleLogout}>
                <Link className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col p-0 m-0 ">
          <div className="p-2 d-flex justify-content-center shadow text-bg-secondary bg-gradient">
            <h4 className="">
              <i class="bi bi-building-gear"> </i>
              Employee Management System
            </h4>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
