const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const { signToken } = require("../middleware/auth");
const {
  DEFAULT_COMPANY,
  DEFAULT_ADDRESS,
  generateNextEmployeeId,
  sanitizeUser,
} = require("../utils/employeeHelpers");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      designation,
      department,
      reportingHead,
      company,
      officeAddress,
      bloodGroup,
      dateOfBirth,
      dateOfJoining,
      emergencyNo,
      linkedin,
      instagram,
      facebook,
      photo,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    if (!linkedin || !String(linkedin).trim()) {
      return res.status(400).json({ message: "LinkedIn ID is required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await Employee.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const employeeId = await generateNextEmployeeId();
    const hashed = await bcrypt.hash(String(password), 10);

    const employee = await Employee.create({
      employeeId,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      password: hashed,
      company: company || DEFAULT_COMPANY,
      designation: designation || "Employee",
      department: department || "General",
      reportingHead: reportingHead || "Pending",
      officeAddress: officeAddress || DEFAULT_ADDRESS,
      bloodGroup: bloodGroup || "",
      dateOfBirth: dateOfBirth || "",
      dateOfJoining: dateOfJoining || "",
      emergencyNo: emergencyNo || phone,
      linkedin: String(linkedin).trim(),
      instagram: instagram || "",
      facebook: facebook || "",
      photo: photo || "",
      role: "EMPLOYEE",
      approvalStatus: "PENDING",
      status: "INACTIVE",
    });

    const token = signToken(employee);
    return res.status(201).json({
      message: "Profile created. Waiting for admin approval.",
      token,
      employee: sanitizeUser(employee),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "Duplicate email or employee ID" });
    }
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+password"
    );

    if (!employee || !employee.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matched = await bcrypt.compare(String(password), employee.password);
    if (!matched) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(employee);
    return res.json({
      message: "Logged in successfully",
      token,
      employee: sanitizeUser(employee),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getMe = async (req, res) => {
  return res.json({ employee: sanitizeUser(req.user) });
};

const updateMyProfile = async (req, res) => {
  try {
    const allowed = [
      "name",
      "phone",
      "designation",
      "department",
      "reportingHead",
      "bloodGroup",
      "dateOfBirth",
      "dateOfJoining",
      "emergencyNo",
      "linkedin",
      "instagram",
      "facebook",
      "photo",
      "officeAddress",
    ];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.linkedin !== undefined && !String(updates.linkedin).trim()) {
      return res.status(400).json({ message: "LinkedIn ID is required" });
    }

    if (req.user.approvalStatus === "REJECTED") {
      updates.approvalStatus = "PENDING";
      updates.status = "INACTIVE";
    }

    const employee = await Employee.findByIdAndUpdate(req.user._id, { $set: updates }, {
      new: true,
      runValidators: true,
    });

    return res.json({
      message: "Profile updated",
      employee: sanitizeUser(employee),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update profile", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMyProfile,
};
