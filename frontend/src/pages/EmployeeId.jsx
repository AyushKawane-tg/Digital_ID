import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import EmployeeCard from "../components/EmployeeCard.jsx";
import EmployeePhoto from "../components/EmployeePhoto.jsx";
import { employeeApi, getErrorMessage } from "../services/api.js";

function DetailItem({ label, value, href }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 block break-all text-sm font-medium text-[#0088cc] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-0.5 break-words text-sm font-medium text-slate-900">{value}</p>
      )}
    </div>
  );
}

function socialHref(value, platform) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (platform === "linkedin") return `https://linkedin.com/in/${value.replace(/^@/, "")}`;
  if (platform === "instagram") return `https://instagram.com/${value.replace(/^@/, "")}`;
  if (platform === "facebook") return `https://facebook.com/${value.replace(/^@/, "")}`;
  return value;
}

function EmployeeId() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIdCard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await employeeApi.getPublicId(employeeId);
        setEmployee(response.data.employee);
        setCompany(response.data.company || null);
        setQrCode(response.data.qrCode || "");
      } catch (err) {
        setError(getErrorMessage(err, "Digital ID could not be loaded"));
      } finally {
        setLoading(false);
      }
    };

    loadIdCard();
  }, [employeeId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f1f8] via-[#f4f7fb] to-[#eef3f8] px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {loading ? (
          <p className="text-center text-sm text-slate-600">Loading digital ID...</p>
        ) : error ? (
          <div className="mx-auto max-w-lg">
            <Alert>{error}</Alert>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline">
              Go to login
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
            <div className="flex flex-col items-center">
              {employee.status !== "ACTIVE" ? (
                <p className="mb-4 rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                  This employee ID is inactive
                </p>
              ) : null}
              <EmployeeCard employee={employee} qrCode={qrCode} />
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-start gap-4">
                  <EmployeePhoto name={employee.name} photo={employee.photo} size="md" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0088cc]">
                      Employee details
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-[#061833]">{employee.name}</h1>
                    <p className="text-sm text-slate-600">{employee.designation}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                      {employee.employeeId}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Full name" value={employee.name} />
                  <DetailItem label="Designation / job title" value={employee.designation} />
                  <DetailItem label="Department / business unit" value={employee.department} />
                  <DetailItem label="Employee ID" value={employee.employeeId} />
                  <DetailItem label="Official email" value={employee.email} href={`mailto:${employee.email}`} />
                  <DetailItem label="Contact number" value={employee.phone} href={`tel:${employee.phone}`} />
                  <DetailItem label="Emergency contact" value={employee.emergencyNo} />
                  <DetailItem label="Office location" value={employee.officeAddress} />
                  <DetailItem
                    label="LinkedIn ID"
                    value={employee.linkedin}
                    href={socialHref(employee.linkedin, "linkedin")}
                  />
                  <DetailItem
                    label="Instagram ID"
                    value={employee.instagram}
                    href={socialHref(employee.instagram, "instagram")}
                  />
                  <DetailItem
                    label="Facebook"
                    value={employee.facebook}
                    href={socialHref(employee.facebook, "facebook")}
                  />
                  <DetailItem label="Blood group" value={employee.bloodGroup} />
                  <DetailItem label="Date of birth" value={employee.dateOfBirth} />
                  <DetailItem label="Date of joining" value={employee.dateOfJoining} />
                </div>
              </section>

              {company ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-start gap-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-14 w-14 rounded-xl border border-slate-200 object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 p-2">
                        <CompanyLogo className="h-10 w-10" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0088cc]">
                        Company details
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[#061833]">{company.name}</h2>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 text-sm text-[#0088cc] hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {company.about ? (
                    <div className="mb-4 rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        About company
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-800">{company.about}</p>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem label="Corporate office" value={company.corporateOfficeAddress} />
                    <DetailItem
                      label="Other locations"
                      value={(company.otherLocations || []).join(" · ")}
                    />
                    <DetailItem
                      label="Company contact"
                      value={company.contactNumber}
                      href={company.contactNumber ? `tel:${company.contactNumber}` : ""}
                    />
                    <DetailItem
                      label="Company email"
                      value={company.contactEmail}
                      href={company.contactEmail ? `mailto:${company.contactEmail}` : ""}
                    />
                    <DetailItem label="CEO" value={company.ceoName} />
                    <DetailItem label="Founder" value={company.founderName} />
                    <DetailItem
                      label="Badges & certificates"
                      value={(company.badgesAndCertificates || []).join(" · ")}
                    />
                  </div>

                  {(company.mission || company.vision) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {company.mission ? (
                        <div className="rounded-xl bg-[#061833] px-3 py-3 text-white">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">
                            Mission
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white/95">{company.mission}</p>
                        </div>
                      ) : null}
                      {company.vision ? (
                        <div className="rounded-xl bg-[#0088cc] px-3 py-3 text-white">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-100">
                            Vision
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white/95">{company.vision}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {company.companyDeckUrl ? (
                    <div className="mt-5">
                      <a
                        href={company.companyDeckUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="btn-primary inline-flex items-center justify-center"
                      >
                        Download company deck
                      </a>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeId;
