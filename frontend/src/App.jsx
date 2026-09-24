import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AddEmployee from "./pages/AddEmployee.jsx";
import Admin from "./pages/Admin.jsx";
import CompanySettings from "./pages/CompanySettings.jsx";
import EmployeeId from "./pages/EmployeeId.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";

function HomeRedirect() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin" : "/profile"} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/id/:employeeId" element={<EmployeeId />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/new"
        element={
          <ProtectedRoute adminOnly>
            <AddEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company"
        element={
          <ProtectedRoute adminOnly>
            <CompanySettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
