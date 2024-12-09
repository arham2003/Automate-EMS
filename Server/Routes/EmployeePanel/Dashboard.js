import con from '../../utils/db.js';  // Import the MySQL connection


export const getEmployeeContribution = (req, res) => {
    const { year, month } = req.query; // Extract year and month from query parameters

    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required.' });
    }

    const query = `
        SELECT
          pp.employee_id,
          SUM(pp.contribution_percentage) AS total_contribution
        FROM
          project_parts pp
        JOIN
          submitted_work sw ON pp.part_id = sw.part_id
        WHERE
          pp.status = 'Approved'
          AND MONTH(sw.submission_datetime) = ?
          AND YEAR(sw.submission_datetime) = ?
        GROUP BY
          pp.employee_id;
    `;

    con.query(query, [month, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If no results, return a message indicating no data found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No contributions found for the specified date.' });
        }

        res.status(200).json(results); // Send the results as JSON
    });
};

export const getApprovedProjectParts = (req, res) => {
    const { year, month } = req.query; // Extract year and month from query parameters

    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required.' });
    }

    const query = `
        SELECT
            pp.part_id,
            pp.project_id,
            pp.part_name,
            pp.status,
            sw.submission_datetime,
            pp.contribution_percentage
        FROM
            project_parts pp
        JOIN
            submitted_work sw ON pp.part_id = sw.part_id
        WHERE
            pp.status = 'Approved'
            AND MONTH(sw.submission_datetime) = ?
            AND YEAR(sw.submission_datetime) = ?
    `;

    con.query(query, [month, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If no results, return a message indicating no data found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No approved project parts found for the specified date.' });
        }

        res.status(200).json(results); // Send the results as JSON
    });
};
