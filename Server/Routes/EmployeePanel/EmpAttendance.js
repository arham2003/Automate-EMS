import con from '../../utils/db.js';  // Import the MySQL connection

export const getEmployeeAttendance = (req, res) => {
    const employeeId = req.params.employeeId;  // Get the employeeId from the URL

    const sql = `
        SELECT 
           
            COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS total_absent,
            COUNT(CASE WHEN status = 'Present' THEN 1 END) AS total_present,
            COUNT(CASE WHEN status = 'Leave' THEN 1 END) AS total_leave,
            COUNT(CASE WHEN status = 'Late' THEN 1 END) AS total_late
        FROM attendance
        WHERE employee_id = ?  -- Use prepared statement for security
        GROUP BY employee_id;
    `;

    con.query(sql, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        if (result.length === 0) {
            return res.status(404).json({ Status: false, Message: "No attendance records found for this employee" });
        }
        return res.status(200).json({ Status: true, Result: result });
    });
};


export const markAttendanceAsPresent = (req, res) => {
    const employeeId = req.params.employeeId;  // Get employeeId from the URL parameters
    const { date } = req.query;  // Get the date from the query string

    // Ensure employeeId and date are provided
    if (!employeeId || !date) {
        return res.status(400).json({ Status: false, Message: "Employee ID and Date are required" });
    }

    // Validate the date format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date); // Regular expression for YYYY-MM-DD format
    if (!isValidDate) {
        return res.status(400).json({ Status: false, Message: "Invalid date format. Please use YYYY-MM-DD" });
    }

    // Convert the date to an ISO string (to ensure it works with MySQL)
    const finalDate = new Date(date + "T00:00:00.000Z");  // Adds the time portion for UTC compatibility

    // Ensure the date is valid
    if (isNaN(finalDate)) {
        return res.status(400).json({ Status: false, Message: "Invalid date format" });
    }

    // Query to insert or update attendance status to 'Present'
    const sql = `
        INSERT INTO attendance (employee_id, date, status)
        VALUES (?, ?, 'Present')
        ON DUPLICATE KEY UPDATE status = 'Present';
    `;

    con.query(sql, [employeeId, finalDate.toISOString()], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }

        return res.status(200).json({
            Status: true,
            Message: "Attendance marked as Present",
            Result: result
        });
    });
};

