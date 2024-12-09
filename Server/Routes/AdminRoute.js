import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";
import nodemailer from 'nodemailer';
import 'dotenv/config';

const router = express.Router();

const allowedOrigins = [
  "https://automate-ems.vercel.app", // Frontend origin
  "https://employee-ms-with-react-arsf.vercel.app" // Frontend origin for the admin panel
];

// Preflight request handler
router.options('/adminlogin', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://automate-ems.vercel.app'); // Specify your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});


router.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ loginStatus: false, Error: "Email and password are required" });
  }

  const sql = "SELECT * FROM admin WHERE email = ? AND password = ?";
  
  con.query(sql, [email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ loginStatus: false, Error: "Database query error" });
    }

    if (result.length > 0) {
      const admin = result[0];

      // Generate JWT token
      const token = jwt.sign(
        { role: "admin", email: admin.email, id: admin.id },
        "jwt_secret_key",
        { expiresIn: "1d" } // Token valid for 1 day
      );

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Set to true in production (requires HTTPS)
        sameSite: "Strict", // Ensures cookie is sent in first-party context only
      });

      return res.json({ loginStatus: true, message: "Login successful" });
    } else {
      return res.status(401).json({ loginStatus: false, Error: "Invalid email or password" });
    }
  });
});

router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) {
        return res.json({ Status: false, Error: "Wrong Token" });
      }
      return res.json({ Status: true, role: decoded.role, id: decoded.id });
    });
  } else {
    return res.json({ Status: false, Error: "Not authenticated" });
  }
});

router.get('/departments', (req, res) => {
    const sql = "SELECT * FROM departments";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.json({ Status: false, Error: "Query Error" });
        }
        console.log("Departments fetched:", result);
        return res.json({ Status: true, Result: result });
    });
}); 


router.post('/add_category', (req, res) => {
    console.log("Add Category API Hit");  // Log to verify if the API is being called
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if (err) {
            console.error("Error in query:", err); // Log detailed error
            return res.status(500).json({ Status: false, Error: "Query Error" });
        }
        return res.status(200).json({ Status: true });
    });
});

// Image upload setup with optional handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'Public/Images'); // Adjust as per your server's structure
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit for image uploads
    },
  });
  
  // Employee addition route
  router.post('/add_employee', upload.single('image'), async (req, res) => {
    try {
      const sql = `INSERT INTO employee 
        (name, email, password, address, salary, image, department_id, post) 
        VALUES (?)`;
  
      // Hash the password
      const SALT_ROUNDS = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  
      // Handle optional fields
      const categoryId = req.body.department_id || null;
      const post = req.body.post || '';
      const imageFilename = req.file ? req.file.filename : ""; // If no file, set to null
  
      const values = [
        req.body.name,
        req.body.email,
        hashedPassword,
        req.body.address,
        req.body.salary,
        imageFilename,
        categoryId,
        post,
      ];
  
      // Insert data into database
      con.query(sql, [values], (err, result) => {
        if (err) {
          console.error('Database Error:', err);
          return res.json({ Status: false, Error: err });
        }
  
        // Send welcome email if configured
        sendWelcomeEmail(req.body.name, req.body.email, req.body.password);
  
        return res.json({ Status: true, Message: 'Employee added successfully!' });
      });
    } catch (err) {
      console.error('Error adding employee:', err);
      return res.json({ Status: false, Error: 'Internal server error' });
    }
  });
  
  // Helper function to send welcome email
  const sendWelcomeEmail = (name, email, password) => {
    const nodemailer = require('nodemailer');
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // App-specific password
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to the No. 1 Company! 🥳',
      text: `Hi ${name},\n\nYour account has been created successfully.\n\nHere are your login details:\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password for security.\n\nBest regards,\nGray Coders`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  };

// router.get('/employee', (req, res) => {
//     const sql = "SELECT * FROM employee";
//     con.query(sql, (err, result) => {
//         if(err) return res.json({Status: false, Error: "Query Error"})
//         return res.json({Status: true, Result: result})
//     })
// })


router.get('/employee', (req, res) => {
    const sql = `
    SELECT e.id, e.name, e.email, e.address, e.salary, e.image, 
    IFNULL(d.department_name, '') as category_name , e.post
    FROM employee e 
    LEFT JOIN departments d ON e.department_id = d.department_id
    `;
    con.query(sql, (err, result) => {
        if(err) return res.json({ Status: false, Error: "Query Error: " + err });
        return res.json({ Status: true, Result: result });
    });
});


router.get('/employee/:id', (req, res) => {
    const sql = `
    SELECT e.id, e.name, e.email, e.address, e.salary, e.image, e.department_id, 
           IFNULL(d.department_name, '') AS category_name
    FROM employee e
    LEFT JOIN departments d ON e.department_id = d.department_id
    WHERE e.id = ?`;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error: " + err });
        if (result.length > 0) {
            return res.json({ Status: true, Result: result });
        } else {
            return res.json({ Status: false, Error: "Employee not found" });
        }
    });
});

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        SET name = ?, email = ?, salary = ?, address = ?, department_id = ?, post = ? 
        WHERE id = ?`;

    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.department_id,
        req.body.post // Add post to the values
    ];

    con.query(sql, [...values, id], (err, result) => {
        if (err) {
            return res.json({ Status: false, Error: "Query Error" + err });
        }
        return res.json({ Status: true, Result: result });
    });
});

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/top_employee', (req, res) => {
    const sql = "SELECT name, salary FROM employee ORDER BY salary DESC LIMIT 1";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error: " + err });
        return res.json({ Status: true, Result: result });
    });
});


router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter };
