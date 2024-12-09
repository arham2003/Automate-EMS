import con from '../../utils/db.js';  // Import the MySQL connection


export const getEmployeeProjectParts = (req, res) => {
    const employeeId = req.params.employeeId;  // Get the employeeId from the URL
    const sql = `
        SELECT 
            pp.part_id, 
            pp.project_id, 
            pp.part_name, 
            pp.start_date, 
            pp.end_date, 
            pp.status, 
            pp.contribution_percentage, 
            e.name AS employee_name, 
            p.projectName AS project_name
        FROM 
            project_parts pp
        JOIN 
            employee e ON pp.employee_id = e.id
        JOIN 
            projects p ON pp.project_id = p.id
        WHERE 
            pp.employee_id = ?;  -- Use prepared statement for security
    `;

    con.query(sql, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        return res.status(200).json({ Status: true, Result: result });
    });
};

export const addSubmission = (req, res) => {
    const { emp_id, part_id, submission_url, submission_datetime } = req.body;

    // Validate the required fields
    if (!emp_id || !part_id || !submission_url || !submission_datetime) {
        return res.status(400).json({ Status: false, Error: "All fields are required" });
    }

    // SQL query to insert the data into the submitted_work table
    const sql = `
        INSERT INTO submitted_work 
        (emp_id, part_id, submission_url, submission_datetime)
        VALUES (?, ?, ?, ?)
    `;

    // Execute the SQL query with the provided data
    con.query(sql, [emp_id, part_id, submission_url, submission_datetime], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        return res.status(201).json({ Status: true, Message: "Submission added successfully", SubmissionId: result.insertId });
    });
};

export const updateProjectPartStatusById = (req, res) => {
    const { partId } = req.params;

    // Ensure partId is provided and is a valid number
    if (!partId || isNaN(partId)) {
        return res.status(400).json({ error: 'Invalid or missing partId' });
    }

    // Check if the project part exists in the database
    const checkQuery = 'SELECT part_id FROM project_parts WHERE part_id = ?';
    
    con.query(checkQuery, [partId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If no part found with the given ID
        if (results.length === 0) {
            return res.status(404).json({ error: 'No part found with this ID' });
        }

        // Update the status to "Submitted"
        const updateStatusQuery = `
            UPDATE project_parts
            SET status = 'Submitted'
            WHERE part_id = ?`;

        con.query(updateStatusQuery, [partId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // If no rows were updated, part_id may not exist
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'No part found with this ID to update' });
            }

            // Successful status update
            res.status(200).json({ message: 'Project part status updated to Submitted successfully' });
        });
    });
};
