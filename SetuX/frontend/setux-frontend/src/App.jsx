import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportProblem from "./pages/ReportProblem";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemDetails from "./pages/ProblemDetails";
import UniversityMatches from "./pages/UniversityMatches";
import IndustryMatches from "./pages/IndustryMatches";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-problem" element={<ReportProblem />} />

        {/* Dedicated Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Problem Details & Agent Discovery Views */}
        <Route path="/problem/:id" element={<ProblemDetails />} />
        <Route path="/problem/:id/universities" element={<UniversityMatches />} />
        <Route path="/problem/:id/industries" element={<IndustryMatches />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;