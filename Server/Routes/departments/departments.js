import con from '../../utils/db.js';  // Import the MySQL connection

export const getAllEmployees = (req, res) => {
    const sql = `
        SELECT 
            id, 
            name, 
            email, 
            password, 
            salary, 
            address, 
            image, 
            department_id
        FROM employee
    `;

    con.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Query Error: " + err });
        }

        // Return only the result array
        return res.status(200).json(result);
    });
};

export const getAllDepartments = (req, res) => {
    const sql = `
        SELECT 
            department_id, 
            department_name, 
            department_head, 
            street, 
            city, 
            state, 
            postal_code, 
            country
        FROM departments
    `;

    con.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Query Error: " + err });
        }

        // Return only the result array
        return res.status(200).json(result);
    });
};

export const addDepartment = (req, res) => {
    const { department_name, department_head, street, city, state, postal_code, country } = req.body;

    // SQL query to insert data into the departments table
    const sql = `
        INSERT INTO departments (department_name, department_head, street, city, state, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    con.query(sql, [department_name, department_head, street, city, state, postal_code, country], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Query Error: " + err });
        }

        // Return success message if insertion is successful
        return res.status(200).json({
            Status: true,
            Message: 'Department added successfully'
        });
    });
};

export const deleteDepartment = (req, res) => {
    const { departmentId } = req.params; // Get department ID from URL parameters

    // Log the department ID to ensure it's passed correctly
    console.log("Deleting department with ID:", departmentId);

    // SQL query to delete the department by ID
    const sql = `DELETE FROM departments WHERE department_id = ?`;

    // Execute the query
    con.query(sql, [departmentId], (err, result) => {
        if (err) {
            // Check for foreign key constraint violation (MySQL error code for this is ER_ROW_IS_REFERENCED_2)
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    Status: false,
                    Error: "Foreign key constraint violation: This department has associated employees. Please remove all employees first."
                });
            }

            // For other errors, return a generic query error
            return res.status(500).json({
                Error: "Query Error: " + err
            });
        }

        console.log(result); // Log the result of the query

        // If no department was found with the given ID
        if (result.affectedRows === 0) {
            return res.status(404).json({
                Status: false,
                Message: 'Department not found'
            });
        }

        // Return success message if deletion is successful
        return res.status(200).json({
            Status: true,
            Message: 'Department deleted successfully'
        });
    });
};


export const updateDepartment = (req, res) => {
    const departmentId = req.params.id; // Get department ID from URL parameters
    const { department_name, department_head, street, city, state, postal_code, country } = req.body; // Get updated department details from the request body

    const sql = `
        UPDATE departments
        SET 
            department_name = ?, 
            department_head = ?, 
            street = ?, 
            city = ?, 
            state = ?, 
            postal_code = ?, 
            country = ?
        WHERE department_id = ?
    `;

    // Execute the query with the values from the request
    con.query(sql, [department_name, department_head, street, city, state, postal_code, country, departmentId], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Query Error: " + err });
        }

        // If no rows were affected, it means the department with that ID was not found
        if (result.affectedRows === 0) {
            return res.status(404).json({ Status: false, Message: 'Department not found' });
        }

        // Return success message if update is successful
        return res.status(200).json({
            Status: true,
            Message: 'Department updated successfully'
        });
    });
};


