const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const getJwtSecret = () => process.env.JWT_SECRET || "teleglobals";

const signToken = (employee) => {
  return jwt.sign(
    {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      role: employee.role,
      email: employee.email,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
};

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Please log in to continue" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const employee = await Employee.findById(decoded.id);

    if (!employee) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.user = employee;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = {
  signToken,
  authenticate,
  requireAdmin,
};
