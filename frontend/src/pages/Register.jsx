import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import AuthSplitLayout from "../components/AuthSplitLayout.jsx";
import EmployeePhoto from "../components/EmployeePhoto.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  password: "",
  designation: "",
  department: "",
  reportingHead: "",
  bloodGroup: "",
  dateOfBirth: "",
  dateOfJoining: "",
  emergencyNo: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  photo: "",
};

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isAdmin, loading, getErrorMessage } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/profile"} replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, photo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err, "Could not create profile"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Create your profile"
      subtitle="Upload your photo and details. An admin will approve your digital ID."
    >
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <EmployeePhoto name={form.name || "Photo"} photo={form.photo} size="md" />
          <label className="block flex-1 text-sm font-medium text-slate-700">
            Profile photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="mt-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#0088cc] file:px-3 file:py-1 file:text-white"
            />
          </label>
        </div>

        <div className="grid max-h-[42vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 sm:max-h-none">
          {[
            ["name", "Full name", "text", true],
            ["email", "Official email", "email", true],
            ["phone", "Contact number", "text", true],
            ["password", "Password", "password", true],
            ["designation", "Designation / job title", "text", false],
            ["department", "Department / business unit", "text", false],
            ["reportingHead", "Reporting head", "text", false],
            ["linkedin", "LinkedIn ID", "url", true],
            ["instagram", "Instagram ID (optional)", "text", false],
            ["facebook", "Facebook (optional)", "text", false],
            ["bloodGroup", "Blood group (optional)", "text", false],
            ["dateOfBirth", "Date of birth", "text", false],
            ["dateOfJoining", "Date of joining", "text", false],
            ["emergencyNo", "Emergency contact", "text", false],
          ].map(([name, label, type, required]) => (
            <label key={name} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                required={required}
                type={type}
                name={name}
                value={form[name]}
                onChange={updateField}
                placeholder={name === "linkedin" ? "https://linkedin.com/in/..." : undefined}
                className="tg-input mt-1.5"
              />
            </label>
          ))}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-[15px]">
          {submitting ? "Creating profile..." : "Submit for approval"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#0088cc] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default Register;
