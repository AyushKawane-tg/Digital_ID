import { useRef, useState } from "react";
import { employeeApi, getErrorMessage } from "../services/api.js";
import Alert from "./Alert.jsx";

const SAMPLE_CSV = `name,email,phone,designation,department,reportingHead,linkedin,bloodGroup,dateOfBirth,dateOfJoining,emergencyNo,instagram,facebook,status
Neha Kulkarni,neha.kulkarni@teleglobals.com,+91 9988776655,QA Engineer,Engineering,Rahul Sharma,https://linkedin.com/in/neha-kulkarni,A+ve,10/02/1996,01/04/2025,+91 9988776611,,,ACTIVE`;

function CsvUpload({ onImported }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setBusy(true);

    try {
      const csv = await file.text();
      const response = await employeeApi.uploadCsv(csv);
      setResult(response.data);
      onImported?.(response.data.created || []);
    } catch (err) {
      setError(getErrorMessage(err, "CSV upload failed"));
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Upload CSV</h2>
          <p className="mt-1 text-sm text-slate-600">
            Bulk-create employees. Required columns: name, email, phone, designation, department,
            reportingHead, linkedin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadSample} className="btn-secondary text-xs">
            Sample CSV
          </button>
          <label className="btn-primary cursor-pointer text-xs">
            {busy ? "Uploading..." : "Choose CSV file"}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={busy}
              onChange={handleFile}
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {result ? (
        <div className="mt-4">
          <Alert type="success">{result.message}</Alert>
          {result.skipped?.length ? (
            <ul className="mt-2 max-h-28 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              {result.skipped.map((item) => (
                <li key={`${item.email}-${item.reason}`}>
                  {item.email}: {item.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default CsvUpload;
