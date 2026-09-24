import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import Alert from "../components/Alert.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import CsvUpload from "../components/CsvUpload.jsx";
import EmployeeTable from "../components/EmployeeTable.jsx";
import QRCodeDisplay from "../components/QRCodeDisplay.jsx";
import { employeeApi, getErrorMessage } from "../services/api.js";

function Admin() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [qr, setQr] = useState(null);
  const [qrEmployee, setQrEmployee] = useState(null);
  const [qrLoadingId, setQrLoadingId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.list();
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load employees. Is the backend running?"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const sortedEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = employees.filter((employee) => {
      if (employee.role === "ADMIN") return false;
      const haystack = `${employee.name} ${employee.employeeId} ${employee.department} ${employee.designation}`.toLowerCase();
      const matchesQuery = haystack.includes(needle);
      const matchesStatus = statusFilter === "ALL" || employee.status === statusFilter;
      const matchesApproval =
        approvalFilter === "ALL" || employee.approvalStatus === approvalFilter;
      return matchesQuery && matchesStatus && matchesApproval;
    });

    const byText = (field) => (a, b) =>
      String(a[field] || "").localeCompare(String(b[field] || ""), undefined, { sensitivity: "base" });

    list.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name-asc") return byText("name")(a, b);
      if (sortBy === "name-desc") return byText("name")(b, a);
      if (sortBy === "id-asc") return byText("employeeId")(a, b);
      if (sortBy === "department") return byText("department")(a, b) || byText("name")(a, b);
      if (sortBy === "designation") return byText("designation")(a, b) || byText("name")(a, b);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [employees, query, statusFilter, approvalFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEmployees = sortedEmployees.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, approvalFilter, sortBy, pageSize]);

  const counts = {
    total: employees.filter((employee) => employee.role !== "ADMIN").length,
    active: employees.filter((employee) => employee.role !== "ADMIN" && employee.status === "ACTIVE").length,
    pending: employees.filter((employee) => employee.approvalStatus === "PENDING").length,
  };

  const handleGenerateQr = async (employee) => {
    setError("");
    setSuccess("");
    setQrLoadingId(employee.employeeId);
    try {
      const [qrResponse, employeeResponse] = await Promise.all([
        employeeApi.getQr(employee.employeeId),
        employeeApi.get(employee.employeeId),
      ]);
      setQr(qrResponse.data);
      setQrEmployee(employeeResponse.data.employee || employee);
    } catch (err) {
      setError(getErrorMessage(err, "QR generation failed"));
    } finally {
      setQrLoadingId("");
    }
  };

  const confirmToggleStatus = async () => {
    if (!pendingStatus) return;
    const nextStatus = pendingStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBusyId(pendingStatus.employeeId);
    try {
      const response = await employeeApi.update(pendingStatus.employeeId, { status: nextStatus });
      const updated = response.data.employee;
      setEmployees((current) =>
        current.map((item) => (item.employeeId === updated.employeeId ? updated : item))
      );
      setSuccess(
        nextStatus === "INACTIVE"
          ? `${updated.name} has been deactivated.`
          : `${updated.name} has been activated.`
      );
      setPendingStatus(null);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update employee status"));
    } finally {
      setBusyId("");
    }
  };

  const handleApprove = async (employee) => {
    setBusyId(employee.employeeId);
    setError("");
    try {
      const response = await employeeApi.approve(employee.employeeId);
      const updated = response.data.employee;
      setEmployees((current) =>
        current.map((item) => (item.employeeId === updated.employeeId ? updated : item))
      );
      setSuccess(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not approve employee"));
    } finally {
      setBusyId("");
    }
  };

  const handleReject = async (employee) => {
    setBusyId(employee.employeeId);
    setError("");
    try {
      const response = await employeeApi.reject(employee.employeeId);
      const updated = response.data.employee;
      setEmployees((current) =>
        current.map((item) => (item.employeeId === updated.employeeId ? updated : item))
      );
      setSuccess(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reject employee"));
    } finally {
      setBusyId("");
    }
  };

  const pendingIsActive = pendingStatus?.status === "ACTIVE";

  return (
    <AdminLayout
      title="Employee Directory"
      subtitle="Approve profiles, upload CSV, generate QR codes, and manage digital IDs."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total employees" value={counts.total} />
        <StatCard label="Active" value={counts.active} tone="active" />
        <StatCard label="Pending approval" value={counts.pending} tone="pending" />
      </div>

      <div className="mb-6">
        <CsvUpload
          onImported={(created) => {
            if (created.length) {
              setEmployees((current) => [...created, ...current]);
              setSuccess(`Imported ${created.length} employee(s) from CSV.`);
            }
          }}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, ID, department..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2 lg:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none ring-blue-600 focus:ring-2"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="id-asc">Employee ID</option>
              <option value="department">Department</option>
              <option value="designation">Designation</option>
            </select>
          </label>
          <div className="flex rounded-xl border border-slate-300 bg-white p-1">
            {["ALL", "ACTIVE", "INACTIVE"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  statusFilter === option
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option === "ALL" ? "All" : option === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-slate-300 bg-white p-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setApprovalFilter(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  approvalFilter === option
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option === "ALL" ? "All approvals" : option}
              </button>
            ))}
          </div>
        </div>
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

      {qrLoadingId ? (
        <div className="mb-4">
          <Alert type="info">Generating QR for {qrLoadingId}...</Alert>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600">
          Loading employees...
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={pageEmployees}
            busyId={busyId}
            onView={(employee) => navigate(`/id/${employee.employeeId}`)}
            onGenerateQr={handleGenerateQr}
            onToggleStatus={setPendingStatus}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={sortedEmployees.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <QRCodeDisplay
        qr={qr}
        employee={qrEmployee}
        onClose={() => {
          setQr(null);
          setQrEmployee(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={pendingIsActive ? "Deactivate employee?" : "Activate employee?"}
        message={
          pendingIsActive
            ? `${pendingStatus?.name}'s digital ID will show as INACTIVE until you activate it again.`
            : `${pendingStatus?.name}'s digital ID will become valid again.`
        }
        confirmLabel={pendingIsActive ? "Deactivate" : "Activate"}
        tone={pendingIsActive ? "danger" : "success"}
        busy={Boolean(busyId)}
        onCancel={() => setPendingStatus(null)}
        onConfirm={confirmToggleStatus}
      />
    </AdminLayout>
  );
}

function Pagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }) {
  if (!total) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{from}</span>–
        <span className="font-semibold text-slate-900">{to}</span> of{" "}
        <span className="font-semibold text-slate-900">{total}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 outline-none ring-blue-600 focus:ring-2"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-1 text-xs font-semibold text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }) {
  const tones = {
    default: "text-slate-900",
    active: "text-emerald-700",
    pending: "text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default Admin;
