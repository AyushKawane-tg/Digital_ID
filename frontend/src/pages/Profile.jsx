import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import EmployeeCard from "../components/EmployeeCard.jsx";
import EmployeePhoto from "../components/EmployeePhoto.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { employeeApi } from "../services/api.js";

const FORM_FIELDS = [
  "name",
  "phone",
  "designation",
  "department",
  "reportingHead",
  "bloodGroup",
  "dateOfBirth",
  "dateOfJoining",
  "emergencyNo",
  "linkedin",
  "instagram",
  "facebook",
  "photo",
  "officeAddress",
];

function buildForm(user) {
  const form = {};
  FORM_FIELDS.forEach((field) => {
    form[field] = user?.[field] || "";
  });
  return form;
}

function Profile() {
  const { user, loading, isAuthenticated, isAdmin, logout, updateProfile, getErrorMessage: authError } =
    useAuth();
  const [form, setForm] = useState(null);
  const [mode, setMode] = useState("view");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    if (user) {
      setForm(buildForm(user));
    }
  }, [user]);

  useEffect(() => {
    const loadQr = async () => {
      if (!user?.employeeId) return;
      try {
        const response = await employeeApi.getQr(user.employeeId);
        setQrCode(response.data.qrCode || "");
      } catch {
        setQrCode("");
      }
    };
    loadQr();
  }, [user]);

  const previewEmployee = useMemo(() => {
    if (!user || !form) return null;
    return {
      ...user,
      ...form,
    };
  }, [user, form]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!user || !form || !previewEmployee) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading profile...
      </div>
    );
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

  const resetForm = () => {
    setForm(buildForm(user));
    setMode("view");
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfile(form);
      setSuccess("Profile saved.");
      setMode("view");
    } catch (err) {
      setError(authError(err, "Could not save profile"));
    } finally {
      setSaving(false);
    }
  };

  const approvalTone = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  }[user.approvalStatus];

  const detailRows = [
    ["Employee ID", user.employeeId],
    ["Official email", user.email],
    ["Contact number", form.phone],
    ["Designation", form.designation],
    ["Department", form.department],
    ["Reporting head", form.reportingHead],
    ["LinkedIn", form.linkedin || "—"],
    ["Instagram", form.instagram || "—"],
    ["Facebook", form.facebook || "—"],
    ["Blood group", form.bloodGroup || "—"],
    ["Date of birth", form.dateOfBirth || "—"],
    ["Date of joining", form.dateOfJoining || "—"],
    ["Emergency contact", form.emergencyNo || "—"],
    ["Status", user.status],
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-[#0a2748]/80 bg-[#061833] text-white shadow-lg shadow-slate-900/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5">
              <CompanyLogo className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">My Profile</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-sky-200/80">{user.employeeId}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setMode("view")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  mode === "view" ? "bg-[#0088cc] text-white" : "text-white/90"
                }`}
              >
                View
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  mode === "edit" ? "bg-[#0088cc] text-white" : "text-white/90"
                }`}
              >
                Edit
              </button>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <section>
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${approvalTone}`}>
            Approval status: <strong>{user.approvalStatus}</strong>
            {user.approvalStatus === "PENDING"
              ? " — you can view and edit your profile now; the public QR ID activates after admin approval."
              : null}
            {user.approvalStatus === "REJECTED"
              ? " — update your details and wait for re-review."
              : null}
            {user.approvalStatus === "APPROVED"
              ? " — your digital ID is ready. View or edit anytime."
              : null}
          </div>

          {error ? (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}
          {success ? (
            <div className="mb-4">
              <Alert type="success">{success}</Alert>
            </div>
          ) : null}

          {mode === "view" ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <EmployeePhoto name={form.name} photo={form.photo} size="md" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{form.name}</h2>
                  <p className="text-sm text-slate-600">{form.designation}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 break-all text-sm font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Office location
                </p>
                <p className="mt-0.5 text-sm text-slate-900">{form.officeAddress}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setMode("edit")} className="btn-primary">
                  Edit profile
                </button>
                {user.approvalStatus === "APPROVED" ? (
                  <Link to={`/id/${user.employeeId}`} className="btn-secondary">
                    Open full-screen ID
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <EmployeePhoto name={form.name} photo={form.photo} size="md" />
                <label className="block flex-1 text-sm font-medium text-slate-700">
                  Upload / change photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="mt-1 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["name", "Full name", true],
                  ["phone", "Contact number", true],
                  ["designation", "Designation / job title", true],
                  ["department", "Department / business unit", true],
                  ["reportingHead", "Reporting head", true],
                  ["linkedin", "LinkedIn ID", true],
                  ["instagram", "Instagram ID (optional)", false],
                  ["facebook", "Facebook (optional)", false],
                  ["bloodGroup", "Blood group (optional)", false],
                  ["dateOfBirth", "Date of birth", false],
                  ["dateOfJoining", "Date of joining", false],
                  ["emergencyNo", "Emergency contact", false],
                ].map(([name, label, required]) => (
                  <label key={name} className="block text-sm font-medium text-slate-700">
                    {label}
                    <input
                      required={required}
                      name={name}
                      type={name === "linkedin" ? "url" : "text"}
                      value={form[name]}
                      onChange={updateField}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
                    />
                  </label>
                ))}
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Office location
                <textarea
                  name="officeAddress"
                  rows="3"
                  value={form.officeAddress}
                  onChange={updateField}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="btn-primary py-3">
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary py-3">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="flex flex-col items-center gap-3 lg:items-end">
          <EmployeeCard employee={previewEmployee} qrCode={qrCode} />
          {user.approvalStatus !== "APPROVED" ? (
            <p className="max-w-[340px] text-center text-xs text-slate-500 lg:text-right">
              Preview only until an admin approves your profile.
            </p>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

export default Profile;
