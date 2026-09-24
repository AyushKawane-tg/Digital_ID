const Employee = require("../models/Employee");

const DEFAULT_COMPANY = "teleGlobals International Pvt. Ltd.";
const DEFAULT_ADDRESS =
  "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014";

const generateNextEmployeeId = async () => {
  const employees = await Employee.find({}, { employeeId: 1 }).lean();
  let maxNumber = 100000;

  employees.forEach((employee) => {
    const match = String(employee.employeeId).match(/^(?:TIPL|EMP)(\d+)$/i);
    if (match) {
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }
  });

  return `TIPL${maxNumber + 1}`;
};

const sanitizeUser = (employee) => {
  const obj = employee.toObject ? employee.toObject() : { ...employee };
  delete obj.password;
  return obj;
};

module.exports = {
  DEFAULT_COMPANY,
  DEFAULT_ADDRESS,
  generateNextEmployeeId,
  sanitizeUser,
};
