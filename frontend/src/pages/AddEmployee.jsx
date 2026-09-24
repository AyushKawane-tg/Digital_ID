import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import Alert from "../components/Alert.jsx";
import EmployeeForm from "../components/EmployeeForm.jsx";
import { employeeApi, getErrorMessage } from "../services/api.js";

function AddEmployee() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const handleSubmit = async (payload) => {
    setError("");
    setCreated(null);
    setSubmitting(true);
    try {
      const response = await employeeApi.create(payload);
      setCreated(response.data.employee);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create employee"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Add Employee"
      subtitle="Save a profile to MongoDB. A unique employee ID is generated automatically."
      action={
        <Link
          to="/admin"
          className="btn-secondary"
        >
          ← Back to dashboard
        </Link>
      }
    >
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {created ? (
        <div className="mb-4">
          <Alert type="success">
            Employee created successfully. Generated ID: <strong>{created.employeeId}</strong>
          </Alert>
          <div className="mt-3 flex gap-3 text-sm">
            <Link to="/admin" className="font-semibold text-blue-700 hover:underline">
              View in dashboard
            </Link>
            <Link to={`/id/${created.employeeId}`} className="font-semibold text-blue-700 hover:underline">
              Open digital ID
            </Link>
          </div>
        </div>
      ) : null}

      <EmployeeForm onSubmit={handleSubmit} submitting={submitting} />
    </AdminLayout>
  );
}

export default AddEmployee;
