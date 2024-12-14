import express from "express";
import cors from 'cors'
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import { DeleteNotifications, getNotifications } from './Routes/projects/NotificationController.js';
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { getAllProjects , addProject, getAllProjectParts, getProjectPartsByProjectId, getProjectById, deleteProjectPart, addProjectPart, getProjectIds, getProjectPartById, updateProjectPartById, updateProject, deleteProject} from "./Routes/projects/projectController.js";
import { addCustomer,  deleteCustomerById, editCustomer, getAllCustomers, getCustomerById } from "./Routes/customer/customer.js";
import { addDepartment, deleteDepartment, getAllDepartments, getAllEmployees, updateDepartment } from "./Routes/departments/departments.js";
import { deleteAttendance, getAttendanceByDate, getAttendanceByEmpIdAndDate, getAttendanceByMonth, submitAttendance, updateAttendance } from "./Routes/attendance/attendance.js";
import { addSubmission, getEmployeeProjectParts, updateProjectPartStatusById } from "./Routes/EmployeePanel/AssignedWork.js";
import { getEmployeeAttendance, markAttendanceAsPresent } from "./Routes/EmployeePanel/EmpAttendance.js";
import { checkPaymentStatus, getEmployeePayments, getEmployeeSalaries, getPayments, paySalary } from "./Routes/Salaries/salaries.js";
import { getWorkSubmissions, updateSubmissionStatus } from "./Routes/SubmittedWork/SubmittedWork.js";
import { getApprovedProjectParts, getEmployeeContribution } from "./Routes/EmployeePanel/Dashboard.js";

const app = express() 



app.use(cors({
  origin: 'https://automate-ems.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight request
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allows credentials to be sent with the request
}));
app.options('*', cors());
  
app.use(express.json())
// app.use(bodyParser.json());
app.use(cookieParser())
app.use('/auth', adminRouter)
app.use('/employee', EmployeeRouter)
app.use(express.static('Public'))

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(token) {
        Jwt.verify(token, "jwt_secret_key", (err ,decoded) => {
            if(err) return res.json({Status: false, Error: "Wrong Token"})
            req.id = decoded.id;
            req.role = decoded.role;
            next()
        })
    } else {
        return res.json({Status: false, Error: "Not autheticated"})
    }
}
// -----------------------------------------------------------------------------------
app.get('/project_parts', getAllProjectParts);  // Fetch all project parts
app.get('/project_parts/:projectId', getProjectPartsByProjectId);
app.get('/api/projects/:id', getProjectById);

app.get('/notifications', getNotifications);
app.delete('/delete_notifications/', DeleteNotifications)

app.get('/projects',getAllProjects)
app.post('/projects/add',addProject)
app.put('/update_project/:id',updateProject)
app.delete('/api/project_parts/:partId',deleteProjectPart)
app.post('/add_projectpart/:id',addProjectPart)
app.get('/get_projectpart/:partId',getProjectPartById)
app.put('/update_projectpart/:partId',updateProjectPartById)
app.get('/get_project_ids',getProjectIds)

// Customer APIS
app.get('/get_allCustomers',getAllCustomers)
app.post('/add_customer',addCustomer)
app.delete('/delete_customer/:customerId',deleteCustomerById)
app.put('/edit_customer/:customerId',editCustomer)
app.get('/get_customerById/:id',getCustomerById)

// Departments APIS
app.get('/get_all_employees',getAllEmployees)
app.get('/get_all_departments',getAllDepartments)
app.post('/add_department',addDepartment)
app.delete('/delete_department/:departmentId', deleteDepartment);
app.put('/update_department/:id',updateDepartment)
app.delete('/projects/:projectId', deleteProject);

// Attendance
app.post('/submit_attendance',submitAttendance)
app.get('/get_attendanceByDate',getAttendanceByDate)
app.get('/get_attendanceByMonth',getAttendanceByMonth)
app.put('/update_attendance',updateAttendance)
app.delete('/delete_attendance',deleteAttendance)
// app.put('/update_attendance',updateAttendance)

// Employee Panel
app.get('/employee_detail/:employeeId/assigned_work', getEmployeeProjectParts);
app.post('/submit_work',addSubmission)
app.put('/update_projectPart_status/:partId', updateProjectPartStatusById);
app.get('/get_empAttendance/:id', getAttendanceByEmpIdAndDate);
app.get('/get_empAttendance_count/:employeeId', getEmployeeAttendance); // New route for employee attendance
app.post('/mark_present/:employeeId',markAttendanceAsPresent)

//  Salaries
app.get('/get_employee_salaries',getEmployeeSalaries)
app.post('/pay_salary', paySalary); // Endpoint to submit salary data
app.get('/get_payments', getPayments); // Endpoint to get all payment records
app.get('/check_payment_status',checkPaymentStatus)
app.get('/get_empPayments',getEmployeePayments)

// Submitted Work
app.get('/get_submittedWork',getWorkSubmissions)
app.put('/update_submission_status',updateSubmissionStatus)

// Employee Dashboard
app.get('/get_empContributions',getEmployeeContribution)
app.get('/approved_parts',getApprovedProjectParts)




app.get('/verify',verifyUser, (req, res)=> {
    return res.json({Status: true, role: req.role, id: req.id})
} )


  const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
