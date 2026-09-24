import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import Alert from "../components/Alert.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import { companyApi, getErrorMessage } from "../services/api.js";

const EMPTY = {
  name: "",
  logo: "",
  about: "",
  website: "",
  corporateOfficeAddress: "",
  otherLocationsText: "",
  contactNumber: "",
  contactEmail: "",
  ceoName: "",
  founderName: "",
  badgesText: "",
  mission: "",
  vision: "",
  companyDeckUrl: "",
};

function toForm(company) {
  return {
    name: company?.name || "",
    logo: company?.logo || "",
    about: company?.about || "",
    website: company?.website || "",
    corporateOfficeAddress: company?.corporateOfficeAddress || "",
    otherLocationsText: (company?.otherLocations || []).join("\n"),
    contactNumber: company?.contactNumber || "",
    contactEmail: company?.contactEmail || "",
    ceoName: company?.ceoName || "",
    founderName: company?.founderName || "",
    badgesText: (company?.badgesAndCertificates || []).join("\n"),
    mission: company?.mission || "",
    vision: company?.vision || "",
    companyDeckUrl: company?.companyDeckUrl || "",
  };
}

function CompanySettings() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await companyApi.get();
        setForm(toForm(response.data.company));
      } catch (err) {
        setError(getErrorMessage(err, "Could not load company details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeckFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, companyDeckUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const response = await companyApi.update({
        name: form.name,
        logo: form.logo,
        about: form.about,
        website: form.website,
        corporateOfficeAddress: form.corporateOfficeAddress,
        otherLocations: form.otherLocationsText,
        contactNumber: form.contactNumber,
        contactEmail: form.contactEmail,
        ceoName: form.ceoName,
        founderName: form.founderName,
        badgesAndCertificates: form.badgesText,
        mission: form.mission,
        vision: form.vision,
        companyDeckUrl: form.companyDeckUrl,
      });
      setForm(toForm(response.data.company));
      setSuccess("Company details saved. They appear on every public employee ID page.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save company details"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Company profile"
      subtitle="These details are shown with every employee digital ID after a QR scan."
    >
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

      {loading ? (
        <p className="text-sm text-slate-600">Loading company profile...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.logo ? (
              <img
                src={form.logo}
                alt="Company logo"
                className="h-16 w-16 rounded-xl border border-slate-200 object-contain bg-white p-1"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 p-2">
                <CompanyLogo className="h-12 w-12" />
              </div>
            )}
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Company logo URL
                <input
                  type="url"
                  name="logo"
                  value={form.logo.startsWith("data:") ? "" : form.logo}
                  onChange={updateField}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Or upload logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  className="mt-1 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
                />
              </label>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["name", "Company name", "text"],
              ["website", "Company website", "url"],
              ["contactNumber", "Company contact number", "text"],
              ["contactEmail", "Company email", "email"],
              ["ceoName", "CEO name", "text"],
              ["founderName", "Founder name", "text"],
            ].map(([name, label, type]) => (
              <label key={name} className="block text-sm font-medium text-slate-700">
                {label}
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={updateField}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
                />
              </label>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700">
            About company
            <textarea
              name="about"
              rows="3"
              value={form.about}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Corporate office address
            <textarea
              name="corporateOfficeAddress"
              rows="2"
              value={form.corporateOfficeAddress}
              onChange={updateField}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Other locations (one per line)
              <textarea
                name="otherLocationsText"
                rows="3"
                value={form.otherLocationsText}
                onChange={updateField}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Badges & certificates (one per line)
              <textarea
                name="badgesText"
                rows="3"
                value={form.badgesText}
                onChange={updateField}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Mission
              <textarea
                name="mission"
                rows="3"
                value={form.mission}
                onChange={updateField}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Vision
              <textarea
                name="vision"
                rows="3"
                value={form.vision}
                onChange={updateField}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Company deck URL
              <input
                type="url"
                name="companyDeckUrl"
                value={form.companyDeckUrl.startsWith("data:") ? "" : form.companyDeckUrl}
                onChange={updateField}
                placeholder="https://.../company-deck.pdf"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Or upload deck (PDF / file)
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,application/pdf"
                onChange={handleDeckFile}
                className="mt-1 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
              />
              {form.companyDeckUrl.startsWith("data:") ? (
                <p className="mt-1 text-xs text-slate-500">Deck file attached</p>
              ) : null}
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-primary py-3">
            {saving ? "Saving..." : "Save company details"}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}

export default CompanySettings;
