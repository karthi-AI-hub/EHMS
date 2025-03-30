import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebars/Sidebar";

const DoctorLayout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;