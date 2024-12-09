
import con from '../../utils/db.js';  // Import the MySQL connection

export const getWorkSubmissions = (req, res) => {
    // Extract year and month from query parameters (e.g., ?year=2024&month=11)
    const { year, month } = req.query;

    // Validate that both year and month are provided
    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required.' });
    }

    const query = `
        SELECT 
            e.name AS employee_name,
            pp.part_name AS part_name,
            pr.projectName AS project_name,
            pp.status AS part_status,
            sw.submission_datetime AS submission_datetime,
            pp.part_id AS part_id,
            d.department_name AS department_name, 
            sw.submission_url AS submission_url
        FROM 
            employee e
        JOIN 
            submitted_work sw ON e.id = sw.emp_id
        JOIN 
            project_parts pp ON sw.part_id = pp.part_id
        JOIN 
            projects pr ON pp.project_id = pr.id
        JOIN 
            departments d ON e.department_id = d.department_id
        WHERE 
            DATE_FORMAT(sw.submission_datetime, '%Y-%m') = ?
    `;

    // Format the date as 'YYYY-MM' to match the database format
    const formattedDate = `${year}-${month.padStart(2, '0')}`; // Ensures month is two digits

    // Execute the query
    con.query(query, [formattedDate], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results); // Send the results as JSON
    });
};

export const updateSubmissionStatus = (req, res) => {
    const { part_id, status } = req.body; // Get part_id and status from the request body
    const query = 'UPDATE project_parts SET status = ? WHERE part_id = ?';

    con.query(query, [status, part_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Status updated successfully' });
    });
};
