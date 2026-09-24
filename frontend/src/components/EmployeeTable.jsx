import EmployeePhoto from "./EmployeePhoto.jsx";

function EmployeeTable({
  employees,
  onView,
  onGenerateQr,
  onToggleStatus,
  onApprove,
  onReject,
  busyId,
}) {
  if (!employees.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-base font-semibold text-slate-900">No employees found</p>
        <p className="mt-1 text-sm text-slate-600">Add an employee, upload a CSV, or clear the filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-[0.16em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const inactive = employee.status !== "ACTIVE";
              const pending = employee.approvalStatus === "PENDING";
              return (
                <tr
                  key={employee.employeeId}
                  className={`border-t border-slate-200 hover:bg-slate-50 ${inactive ? "bg-slate-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <EmployeePhoto name={employee.name} photo={employee.photo} size="xs" />
                      <div>
                        <p className={`font-semibold ${inactive ? "text-slate-500" : "text-slate-900"}`}>
                          {employee.name}
                        </p>
                        <p className="text-xs text-slate-500">{employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${inactive ? "text-slate-400" : "text-slate-700"}`}>
                    <div>{employee.designation}</div>
                    <div className="text-xs text-slate-500">{employee.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        employee.approvalStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : employee.approvalStatus === "PENDING"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {employee.approvalStatus || "APPROVED"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        inactive ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {pending ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === employee.employeeId}
                            onClick={() => onApprove(employee)}
                            className="btn-success px-3 py-1.5 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busyId === employee.employeeId}
                            onClick={() => onReject(employee)}
                            className="btn-danger px-3 py-1.5 text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      <button type="button" onClick={() => onView(employee)} className="btn-secondary px-3 py-1.5 text-xs">
                        View
                      </button>
                      <button type="button" onClick={() => onGenerateQr(employee)} className="btn-primary px-3 py-1.5 text-xs">
                        Generate QR
                      </button>
                      <button
                        type="button"
                        disabled={busyId === employee.employeeId}
                        onClick={() => onToggleStatus(employee)}
                        className={inactive ? "btn-success px-3 py-1.5 text-xs" : "btn-danger px-3 py-1.5 text-xs"}
                      >
                        {busyId === employee.employeeId
                          ? "Updating..."
                          : inactive
                            ? "Activate"
                            : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeTable;
