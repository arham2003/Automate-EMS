import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import { connectDB } from "../utils/db.js"; // Import MongoDB connection utility
import "dotenv/config";

const router = express.Router();

// MongoDB setup
let db;
connectDB().then((client) => {
  db = client.db("employeems");
});

// Allowed origins for CORS
const allowedOrigins = ["https://automate-ems.vercel.app"];

// Preflight request handler
router.options("/adminlogin", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://automate-ems.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.sendStatus(200);
});

// Admin login
router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ loginStatus: false, Error: "Email and password are required" });
  }

  try {
    const admin = await db.collection("admins").findOne({ email });
    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign(
        { role: "admin", email: admin.email, id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      return res.json({ loginStatus: true, message: "Login successful" });
    } else {
      return res.status(401).json({ loginStatus: false, Error: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ loginStatus: false, Error: "Database error" });
  }
});

// Verify admin
router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json({ Status: false, Error: "Invalid token" });
      }
      return res.json({ Status: true, role: decoded.role, id: decoded.id });
    });
  } else {
    return res.json({ Status: false, Error: "Not authenticated" });
  }
});

// Fetch departments
router.get("/departments", async (req, res) => {
  try {
    const departments = await db.collection("departments").find().toArray();
    return res.json({ Status: true, Result: departments });
  } catch (error) {
    return res.json({ Status: false, Error: "Query Error: " + error });
  }
});

// Add category
router.post("/add_category", async (req, res) => {
  try {
    const result = await db.collection("categories").insertOne({ name: req.body.category });
    return res.json({ Status: true });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: "Query Error: " + error });
  }
});

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "Public/Images"),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Add employee
router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const employee = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      address: req.body.address,
      salary: parseFloat(req.body.salary),
      image: req.file?.filename || "",
      department_id: req.body.department_id,
      post: req.body.post || "",
    };

    const result = await db.collection("employees").insertOne(employee);
    sendWelcomeEmail(req.body.name, req.body.email, req.body.password);

    return res.json({ Status: true, Message: "Employee added successfully!" });
  } catch (error) {
    return res.json({ Status: false, Error: "Internal server error: " + error });
  }
});

// Fetch all employees
router.get("/employee", async (req, res) => {
  try {
    const employees = await db
      .collection("employees")
      .aggregate([
        {
          $lookup: {
            from: "departments",
            localField: "department_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            email: 1,
            address: 1,
            salary: 1,
            image: 1,
            post: 1,
            category_name: "$department.name",
          },
        },
      ])
      .toArray();

    return res.json({ Status: true, Result: employees });
  } catch (error) {
    return res.json({ Status: false, Error: "Query Error: " + error });
  }
});

// Fetch employee by ID
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await db.collection("employees").findOne({ _id: req.params.id });
    if (employee) {
      return res.json({ Status: true, Result: employee });
    } else {
      return res.json({ Status: false, Error: "Employee not found" });
    }
  } catch (error) {
    return res.json({ Status: false, Error: "Query Error: " + error });
  }
});

// Update employee
router.put("/edit_employee/:id", async (req, res) => {
  try {
    const updatedEmployee = {
      name: req.body.name,
      email: req.body.email,
      salary: parseFloat(req.body.salary),
      address: req.body.address,
      department_id: req.body.department_id,
      post: req.body.post,
    };

    const result = await db.collection("employees").updateOne(
      { _id: req.params.id },
      { $set: updatedEmployee }
    );

    return res.json({ Status: true, Result: result });
  } catch (error) {
    return res.json({ Status: false, Error: "Query Error: " + error });
  }
});

// Delete employee
router.delete("/delete_employee/:id", async (req, res) => {
  try {
    const result = await db.collection("employees").deleteOne({ _id: req.params.id });
    return res.json({ Status: true, Result: result });
  } catch (error) {
    return res.json({ Status: false, Error: "Query Error: " + error });
  }
});

// Logout admin
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
