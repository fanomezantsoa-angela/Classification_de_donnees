import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import Home from "./Pages/Home";

import PrivateRoute from "./Routes/PrivateRoutes";

import MainPage from "./Pages/MainPage";
function App() {
  return (
    <div className="flex">
      <Router>
       
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<MainPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
