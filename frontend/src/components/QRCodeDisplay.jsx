import { useState } from "react";
import MiniIdCard from "./MiniIdCard.jsx";
import { logo } from "./CompanyLogo.jsx";
import { demoAvatar } from "./EmployeePhoto.jsx";
import { downloadDataUrl, downloadMiniIdCard } from "../utils/idCard.js";

function QRCodeDisplay({ qr, employee, onClose }) {
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!qr) return null;

  const cardEmployee = {
    company: qr.company || "teleGlobals International Pvt. Ltd.",
    officeAddress:
      employee?.officeAddress ||
      "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014",
    status: employee?.status || "ACTIVE",
    bloodGroup: employee?.bloodGroup || "",
    dateOfJoining: employee?.dateOfJoining || "",
    emergencyNo: employee?.emergencyNo || employee?.phone || "",
    phone: employee?.phone || "",
    ...employee,
    name: employee?.name || qr.name,
    designation: employee?.designation || qr.designation || "",
    department: employee?.department || qr.department || "",
    photo: employee?.photo || qr.photo || "",
    employeeId: employee?.employeeId || qr.employeeId,
  };

  const downloadQr = () => {
    setDownloadError("");
    downloadDataUrl(qr.qrCode, `${cardEmployee.employeeId}-qr.png`);
  };

  const downloadIdCard = async () => {
    setDownloadError("");
    setDownloading(true);
    try {
      await downloadMiniIdCard({
        employee: {
          ...cardEmployee,
          demoPhoto: demoAvatar,
        },
        qrCode: qr.qrCode,
        logoSrc: logo,
      });
    } catch (error) {
      setDownloadError(error.message || "Could not download the ID card");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Employee ID QR</h2>
            <p className="text-sm text-slate-600">Same digital ID shown when the QR is scanned</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2.5 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        <MiniIdCard employee={cardEmployee} qrCode={qr.qrCode} />

        {downloadError ? <p className="mt-3 text-sm text-red-600">{downloadError}</p> : null}

        <p className="mt-3 break-all rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
          {qr.digitalIdUrl}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" onClick={downloadQr} className="btn-primary">
            Download QR
          </button>
          <button type="button" onClick={downloadIdCard} disabled={downloading} className="btn-primary">
            {downloading ? "Preparing ID..." : "Download ID (front + back)"}
          </button>
          <a href={qr.digitalIdUrl} target="_blank" rel="noreferrer" className="btn-secondary text-center">
            Open ID
          </a>
        </div>
      </div>
    </div>
  );
}

export default QRCodeDisplay;
