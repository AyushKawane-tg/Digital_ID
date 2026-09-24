import { useState } from "react";
import EmployeePhoto from "./EmployeePhoto.jsx";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "teleGlobals International Pvt. Ltd.",
  designation: "",
  department: "",
  reportingHead: "",
  officeAddress: "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014",
  bloodGroup: "",
  dateOfBirth: "",
  dateOfJoining: "",
  emergencyNo: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  photo: "",
  status: "ACTIVE",
};

function EmployeeForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoName, setPhotoName] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, photo: String(reader.result || "") }));
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      emergencyNo: form.emergencyNo || form.phone,
      approvalStatus: "APPROVED",
    });
  };

  const fields = [
    ["name", "Full Name", "text", true],
    ["email", "Official Email Address", "email", true],
    ["phone", "Contact Number", "text", true],
    ["company", "Company", "text", true],
    ["designation", "Designation / Job Title", "text", true],
    ["department", "Department / Business Unit", "text", true],
    ["reportingHead", "Reporting Head", "text", true],
    ["linkedin", "LinkedIn ID", "url", true],
    ["instagram", "Instagram ID (optional)", "text", false],
    ["facebook", "Facebook (optional)", "text", false],
    ["bloodGroup", "Blood Group (optional)", "text", false],
    ["dateOfBirth", "Date of Birth (DD/MM/YYYY)", "text", false],
    ["dateOfJoining", "Date Of Joining (DD/MM/YYYY)", "text", false],
    ["emergencyNo", "Emergency Contact", "text", false],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600">
          Employee details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([name, label, type, required]) => (
            <label key={name} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                required={required}
                type={type}
                name={name}
                value={form[name]}
                onChange={updateField}
                placeholder={name === "linkedin" ? "https://linkedin.com/in/..." : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2"
              />
            </label>
          ))}
        </div>
      </section>

      <label className="block text-sm font-medium text-slate-700">
        Office Location
        <textarea
          required
          name="officeAddress"
          rows="3"
          value={form.officeAddress}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2"
        />
      </label>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600">
          Employee picture
        </h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <EmployeePhoto name={form.name || "New Employee"} photo={form.photo} size="md" />
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Photo URL (optional)
              <input
                type="url"
                name="photo"
                value={form.photo.startsWith("data:") ? "" : form.photo}
                onChange={(event) => {
                  setPhotoName("");
                  updateField(event);
                }}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Or upload a photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFile}
                className="mt-1 w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
              />
              {photoName ? <p className="mt-1 text-xs text-slate-500">{photoName} selected</p> : null}
            </label>
          </div>
        </div>
      </section>

      <label className="block text-sm font-medium text-slate-700">
        Status
        <select
          name="status"
          value={form.status}
          onChange={updateField}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </label>

      <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
        {submitting ? "Creating employee..." : "Create Employee"}
      </button>
    </form>
  );
}

export default EmployeeForm;
