const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const Company = require("../models/Company");
const { employees, adminUser, companyProfile } = require("./data");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const seedEmployees = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is missing. Copy backend/.env.example to backend/.env first.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    await Employee.deleteMany({});
    await Company.deleteMany({});

    const passwordHash = await bcrypt.hash("password123", 10);
    const adminHash = await bcrypt.hash(adminUser.password, 10);

    const docs = employees.map((employee) => ({
      ...employee,
      password: passwordHash,
      role: "EMPLOYEE",
      approvalStatus: "APPROVED",
    }));

    docs.unshift({
      ...adminUser,
      password: adminHash,
    });

    await Employee.insertMany(docs);
    await Company.create(companyProfile);

    console.log(`Seeded ${docs.length} accounts into ${mongoose.connection.name}`);
    console.log("Seeded company profile");
    console.log(`  Admin login: ${adminUser.email} / ${adminUser.password}`);
    console.log("  Employee demo password for all seeded staff: password123");
    docs.forEach((employee) => {
      console.log(`  ${employee.employeeId}  ${employee.name}  (${employee.role}, ${employee.status})`);
    });
  } catch (error) {
    console.error("Seed failed:", error.message);
    console.error("Make sure MongoDB is running, then try again.");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedEmployees();
