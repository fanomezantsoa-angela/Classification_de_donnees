import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import Cookies from "js-cookie";

const PrivateRoute = () => {
  return Cookies.get("token") ? <Outlet /> : Navigate("/login");
};

export default PrivateRoute;
