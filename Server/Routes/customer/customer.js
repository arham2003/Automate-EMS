import con from '../../utils/db.js';  // Import the MySQL connection

// API to get customer details
export const getAllCustomers = (req, res) => {
    const sql = `
        SELECT 
            customer_id, 
            full_name, 
            email, 
            phone_number, 
            company_name, 
            street_address, 
            city, 
            state, 
            postal_code, 
            country
        FROM customerDetails
    `;

    con.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        return res.status(200).json({ Status: true, Result: result });
    });
};
export const getCustomerById = (req, res) => {
    const projectId = req.params.id; // Assuming you're passing the project ID as a URL parameter
    const sql = `
        SELECT 
            cd.full_name
        FROM projects p
        JOIN customerdetails cd ON p.customer_id = cd.customer_id
        WHERE p.id = ?
    `;

    con.query(sql, [projectId], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        if (result.length === 0) {
            return res.status(404).json({ Status: false, Message: "Customer not found for the given project" });
        }
        // Returning the customer full name
        return res.status(200).json({ Status: true, CustomerName: result[0].full_name });
    });
};


// Add the customer 
export const addCustomer = (req, res) => {
    const { full_name, email, phone_number, company_name, street_address, city, state, postal_code, country } = req.body;

    // Validate the required fields
    if (!full_name || !email || !phone_number || !company_name || !street_address || !city || !state || !postal_code || !country) {
        return res.status(400).json({ Status: false, Error: "All fields are required" });
    }

    const sql = `
        INSERT INTO customerDetails 
        (full_name, email, phone_number, company_name, street_address, city, state, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(sql, [full_name, email, phone_number, company_name, street_address, city, state, postal_code, country], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }
        return res.status(201).json({ Status: true, Message: "Customer added successfully", CustomerId: result.insertId });
    });
};

// Delete Customer
export const deleteCustomerById = (req, res) => {
    const { customerId } = req.params;  // Extract customerId from URL parameters

    // SQL query to delete the customer by their ID
    const sql = `DELETE FROM customerDetails WHERE customer_id = ?`;

    con.query(sql, [customerId], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ Status: false, Message: 'Customer not found' });
        }

        return res.status(200).json({ Status: true, Message: 'Customer deleted successfully' });
    });
};

//  Edit Customer
export const editCustomer = (req, res) => {
    const { customerId } = req.params;  // Extract customerId from URL parameters
    const { full_name, email, phone_number, company_name, street_address, city, state, postal_code, country } = req.body;

    // SQL query to update customer information
    const sql = `
        UPDATE customerDetails 
        SET 
            full_name = ?, 
            email = ?, 
            phone_number = ?, 
            company_name = ?, 
            street_address = ?, 
            city = ?, 
            state = ?, 
            postal_code = ?, 
            country = ? 
        WHERE customer_id = ?
    `;

    // Execute query
    con.query(sql, [full_name, email, phone_number, company_name, street_address, city, state, postal_code, country, customerId], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: false, Error: "Query Error: " + err });
        }

        // If no rows were updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ Status: false, Message: 'Customer not found' });
        }

        return res.status(200).json({ Status: true, Message: 'Customer updated successfully' });
    });
};
