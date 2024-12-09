import con from '../../utils/db.js';  // Import the MySQL connection



export const submitAttendance = (req, res) => {
    const attendanceData = req.body;

    // Check if the request body is valid and not empty
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ error: 'No attendance data received.' });
    }

    // Loop through the attendance data to validate each record
    for (let i = 0; i < attendanceData.length; i++) {
        const { employeeId, date, status } = attendanceData[i];

        // Check if employeeId, date, and status are provided
        if (!employeeId || !date || !status) {
            return res.status(400).json({ error: 'Employee ID, Date, and Status are required.' });
        }

        // Insert each record into the database
        const query = 'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)';
        con.query(query, [employeeId, date, status], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
        });
    }

    // If all records are successfully processed
    res.status(201).json({ message: 'Attendance submitted successfully' });
};



export const getAttendanceByDate = (req, res) => {
    const { date } = req.query; // Extract the full date (YYYY-MM-DD) from the query parameter

    // Check if date is provided
    if (!date) {
        return res.status(400).json({ error: 'Date parameter (YYYY-MM-DD) is required' });
    }

    // SQL query to join employee and attendance tables, and filter by the provided date
    const query = `
        SELECT a.id AS attendance_id, e.name, a.status
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE DATE(a.date) = ?;
    `; // Query to get attendance ID, employee name, and attendance status for the specific date

    // Execute the query
    con.query(query, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message }); // If there is an error, return it
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for the specified date' });
        }

        return res.status(200).json(results); // Send the attendance data as a JSON response
    });
};







export const getAttendanceByMonth = (req, res) => {
    const { month } = req.query; // Extract the 'month' parameter from the query string
    console.log(month)

    // Check if month is provided
    if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
    }

    // Assuming you are using a MySQL database and have a connection (con)
    const query = `
        SELECT * FROM attendance
        WHERE DATE_FORMAT(date, '%Y-%m') = ?;
    `; // Query to get records for the specific month (e.g., '2024-11')

    // Execute the query
    con.query(query, [month], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message }); // If there is an error, return it
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for the specified month' });
        }

        return res.status(200).json(results); // Send the attendance data as a JSON response
    });
};

export const updateAttendance = (req, res) => {
    const { date, attendance } = req.body;

    // Check if date and attendance data are provided
    if (!date || !attendance || !Array.isArray(attendance)) {
        return res.status(400).json({ error: 'Date and valid attendance data are required' });
    }

    // Create an array of update queries for each employee's attendance record
    const updateQueries = attendance.map(({ name, status }) => {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE attendance 
                SET status = ? 
                WHERE employee_id = (
                    SELECT id FROM employee WHERE name = ?
                ) AND DATE(date) = ?;
            `;

            // Execute the SQL query with status, employee name, and date
            con.query(query, [status, name, date], (err, result) => {
                if (err) {
                    return reject(err); // Reject the promise on error
                }
                resolve(result); // Resolve the promise on success
            });
        });
    });

    // Execute all update queries asynchronously
    Promise.all(updateQueries)
        .then(() => {
            res.status(200).json({ message: 'Attendance updated successfully!' });
        })
        .catch((err) => {
            console.error('Error updating attendance:', err);
            res.status(500).json({ error: 'Failed to update attendance' });
        });
};

export const deleteAttendance = (req, res) => {
    const { date } = req.body;  // Extract the date from the request body

    // Validate the date is provided
    if (!date) {
        return res.status(400).json({ error: 'Date is required.' });
    }

    // Query to delete the attendance records for the specified date
    const query = 'DELETE FROM attendance WHERE date = ?';

    con.query(query, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Check if any records were deleted
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No attendance records found for the selected date.' });
        }

        // If successful, send a response indicating the records were deleted
        res.status(200).json({ message: 'Attendance records deleted successfully.' });
    });
};

// src/controllers/attendanceController.js


// Function to get attendance for a specific employee by employee ID, month, and year
export const getAttendanceByEmpIdAndDate = (req, res) => {
    const { id } = req.params;  // Employee ID from URL params
    const { month, year } = req.query;  // Month and Year from query parameters

    // Validate the inputs
    if (!id) {
        return res.status(400).json({ error: 'Employee ID is required' });
    }

    if (!month || !year) {
        return res.status(400).json({ error: 'Month and Year are required' });
    }

    // SQL query to fetch attendance for the given employee ID, month, and year
    const query = `
        SELECT e.id AS employee_id, e.name, a.status, a.date
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE a.employee_id = ? AND MONTH(a.date) = ? AND YEAR(a.date) = ?
    `;

    // Execute the query
    con.query(query, [id, month, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: `No attendance records found for employee ID ${id} in ${month}/${year}` });
        }

        // Send the attendance data as a JSON response
        return res.status(200).json(results);
    });
};




