import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import AuthSplitLayout from "../components/AuthSplitLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, loading, getErrorMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/profile"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const employee = await login(email, password);
      navigate(employee.role === "ADMIN" ? "/admin" : "/profile");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your teleGlobals Digital Employee ID account."
    >
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Work email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@teleglobals.com"
            className="tg-input mt-1.5"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="tg-input mt-1.5"
          />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-[15px]">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New employee?{" "}
        <Link to="/register" className="font-semibold text-[#0088cc] hover:underline">
          Create your profile
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">
        Demo admin · admin@teleglobals.com / admin123
      </p>
    </AuthSplitLayout>
  );
}

export default Login;
