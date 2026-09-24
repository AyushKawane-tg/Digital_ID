import EmployeeCard from "./EmployeeCard.jsx";

function MiniIdCard({ employee, qrCode }) {
  if (!employee) return null;

  return (
    <div className="flex justify-center py-2">
      <EmployeeCard employee={employee} qrCode={qrCode} />
    </div>
  );
}

export default MiniIdCard;
