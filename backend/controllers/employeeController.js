const Employee = require("../models/Employee");
const { generateEmployeeQR } = require("../services/qrService");
const {
  generateNextEmployeeId,
  sanitizeUser,
  DEFAULT_COMPANY,
  DEFAULT_ADDRESS,
} = require("../utils/employeeHelpers");
const { getOrCreateCompany, toPublicCompany } = require("./companyController");

const EMPLOYEE_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "designation",
  "department",
  "reportingHead",
  "officeAddress",
  "bloodGroup",
  "dateOfBirth",
  "dateOfJoining",
  "emergencyNo",
  "linkedin",
  "instagram",
  "facebook",
  "photo",
  "status",
  "approvalStatus",
];

const PUBLIC_ID_FIELDS = [
  "employeeId",
  "name",
  "email",
  "phone",
  "company",
  "designation",
  "department",
  "reportingHead",
  "officeAddress",
  "bloodGroup",
  "dateOfBirth",
  "dateOfJoining",
  "emergencyNo",
  "linkedin",
  "instagram",
  "facebook",
  "photo",
  "status",
  "approvalStatus",
];

const pickFields = (source, fields) => {
  const data = {};
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      data[field] = source[field];
    }
  });
  return data;
};

const toPublicIdCard = (employee) => {
  const card = {};
  PUBLIC_ID_FIELDS.forEach((field) => {
    card[field] = employee[field];
  });
  return card;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateEmployeePayload = (payload, { partial = false } = {}) => {
  const errors = [];
  const data = pickFields(payload, EMPLOYEE_FIELDS);

  const requiredFields = [
    "name",
    "email",
    "phone",
    "company",
    "designation",
    "department",
    "reportingHead",
    "officeAddress",
    "linkedin",
  ];

  if (!partial) {
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        errors.push(`${field} is required`);
      }
    });
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("email must be a valid email address");
  }

  if (data.linkedin !== undefined && data.linkedin !== null && String(data.linkedin).trim() === "") {
    errors.push("linkedin is required");
  }

  if (data.status && !["ACTIVE", "INACTIVE"].includes(data.status)) {
    errors.push("status must be ACTIVE or INACTIVE");
  }

  if (data.approvalStatus && !["PENDING", "APPROVED", "REJECTED"].includes(data.approvalStatus)) {
    errors.push("approvalStatus must be PENDING, APPROVED, or REJECTED");
  }

  if (data.photo === undefined) {
    data.photo = "";
  }

  if (data.bloodGroup === undefined && !partial) {
    data.bloodGroup = "";
  }

  if (data.dateOfJoining === undefined && !partial) {
    data.dateOfJoining = "";
  }

  if (data.emergencyNo === undefined && !partial) {
    data.emergencyNo = data.phone || "";
  }

  if (data.dateOfBirth === undefined && !partial) {
    data.dateOfBirth = "";
  }

  if (data.instagram === undefined && !partial) {
    data.instagram = "";
  }

  if (data.facebook === undefined && !partial) {
    data.facebook = "";
  }

  if (data.status === undefined && !partial) {
    data.status = "ACTIVE";
  }

  if (data.approvalStatus === undefined && !partial) {
    data.approvalStatus = "APPROVED";
  }

  if (!data.company && !partial) {
    data.company = DEFAULT_COMPANY;
  }

  if (!data.officeAddress && !partial) {
    data.officeAddress = DEFAULT_ADDRESS;
  }

  return { data, errors };
};

const handleDuplicateKey = (error, res) => {
  if (error && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `Duplicate ${field}. Please use a different value.`,
    });
  }
  return null;
};

/**
 * Minimal CSV parser that supports quoted fields and commas inside quotes.
 */
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell.trim());
    cell = "";
  };

  const pushRow = () => {
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushCell();
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      pushCell();
      pushRow();
      continue;
    }

    cell += char;
  }

  pushCell();
  pushRow();

  if (!rows.length) {
    return { headers: [], records: [] };
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase().replace(/\s+/g, ""));
  const records = rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    return record;
  });

  return { headers, records };
};

const mapCsvRecord = (record) => {
  const get = (...keys) => {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== "") {
        return record[key];
      }
    }
    return "";
  };

  return {
    name: get("name", "fullname"),
    email: get("email", "emailid"),
    phone: get("phone", "mobileno", "mobile"),
    company: get("company") || DEFAULT_COMPANY,
    designation: get("designation", "role", "title"),
    department: get("department", "dept"),
    reportingHead: get("reportinghead", "manager", "reporting"),
    officeAddress: get("officeaddress", "address") || DEFAULT_ADDRESS,
    bloodGroup: get("bloodgroup", "blood"),
    dateOfBirth: get("dateofbirth", "dob"),
    dateOfJoining: get("dateofjoining", "doj", "joiningdate"),
    emergencyNo: get("emergencyno", "emergency", "emergencycontact"),
    linkedin: get("linkedin", "linkedinid", "linkedinurl"),
    instagram: get("instagram", "instagramid"),
    facebook: get("facebook", "facebookid"),
    photo: get("photo", "photourl"),
    status: (get("status") || "ACTIVE").toUpperCase(),
    approvalStatus: "APPROVED",
  };
};

const createEmployee = async (req, res) => {
  try {
    const { data, errors } = validateEmployeePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: "Invalid employee data", errors });
    }

    const employeeId = await generateNextEmployeeId();
    const employee = await Employee.create({
      ...data,
      employeeId,
      role: "EMPLOYEE",
      approvalStatus: data.approvalStatus || "APPROVED",
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee: sanitizeUser(employee),
    });
  } catch (error) {
    if (handleDuplicateKey(error, res)) return;
    return res.status(500).json({ message: "Failed to create employee", error: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    return res.json({ employees });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { data, errors } = validateEmployeePayload(req.body, { partial: true });
    if (errors.length) {
      return res.status(400).json({ message: "Invalid employee data", errors });
    }

    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    if (handleDuplicateKey(error, res)) return;
    return res.status(500).json({ message: "Failed to update employee", error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: req.params.employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json({ message: "Employee deleted successfully", employeeId: employee.employeeId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
};

const getEmployeeQR = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const qr = await generateEmployeeQR(employee.employeeId);
    return res.json({
      employeeId: employee.employeeId,
      name: employee.name,
      photo: employee.photo || "",
      designation: employee.designation,
      department: employee.department,
      company: employee.company,
      ...qr,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "QR generation failed",
    });
  }
};

/**
 * Public endpoint used by the digital ID page after a QR scan.
 * Only approved active employees get a full card payload.
 */
const getPublicEmployeeId = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId }).select(
      PUBLIC_ID_FIELDS.join(" ")
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        message: "This employee profile is pending admin approval",
        approvalStatus: employee.approvalStatus,
      });
    }

    const qr = await generateEmployeeQR(employee.employeeId);
    const company = await getOrCreateCompany();

    return res.json({
      employee: toPublicIdCard(employee),
      company: toPublicCompany(company),
      qrCode: qr.qrCode,
      digitalIdUrl: qr.digitalIdUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch digital ID", error: error.message });
  }
};

const approveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        $set: {
          approvalStatus: "APPROVED",
          status: "ACTIVE",
        },
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({
      message: `${employee.name} has been approved`,
      employee,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve employee", error: error.message });
  }
};

const rejectEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        $set: {
          approvalStatus: "REJECTED",
          status: "INACTIVE",
        },
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({
      message: `${employee.name}'s profile was rejected`,
      employee,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject employee", error: error.message });
  }
};

const uploadEmployeesCsv = async (req, res) => {
  try {
    const csvText = req.body.csv || (req.file && req.file.buffer.toString("utf8"));
    if (!csvText || !String(csvText).trim()) {
      return res.status(400).json({
        message: "CSV content is required. Send a csv string or upload a .csv file.",
      });
    }

    const { records } = parseCsv(String(csvText));
    if (!records.length) {
      return res.status(400).json({ message: "CSV has no data rows" });
    }

    const created = [];
    const skipped = [];

    for (const record of records) {
      const mapped = mapCsvRecord(record);
      const { data, errors } = validateEmployeePayload(mapped);

      if (errors.length) {
        skipped.push({ email: mapped.email || mapped.name || "unknown", reason: errors.join(", ") });
        continue;
      }

      const existing = await Employee.findOne({ email: data.email.toLowerCase() });
      if (existing) {
        skipped.push({ email: data.email, reason: "Email already exists" });
        continue;
      }

      const employeeId = await generateNextEmployeeId();
      const employee = await Employee.create({
        ...data,
        employeeId,
        role: "EMPLOYEE",
        approvalStatus: "APPROVED",
        status: data.status || "ACTIVE",
      });
      created.push(sanitizeUser(employee));
    }

    return res.status(201).json({
      message: `Imported ${created.length} employee(s). Skipped ${skipped.length}.`,
      created,
      skipped,
    });
  } catch (error) {
    return res.status(500).json({ message: "CSV upload failed", error: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeQR,
  getPublicEmployeeId,
  approveEmployee,
  rejectEmployee,
  uploadEmployeesCsv,
};
