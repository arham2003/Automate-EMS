import con from '../../utils/db.js';  // Import the MySQL connection

// Function to get all projects
export const getAllProjects = (req, res) => {
    const query = 'SELECT * FROM projects';
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.status(200).json(results);
    });
};

export const addProject = (req, res) => {
    console.log(req.body); // Log the body to check the received data
  
    const { projectName, customerId, startDate, expectedDate, budget, status } = req.body;
  
    if (!projectName || !customerId || !startDate || !expectedDate || !budget || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = 'INSERT INTO projects (projectName, customer_id, startDate, expectedDate, budget, status) VALUES (?, ?, ?, ?, ?, ?)';
    
    con.query(query, [projectName, customerId, startDate, expectedDate, budget, status], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Project added successfully',
        projectId: result.insertId
      });
    });
  };

  export const updateProject = (req, res) => {
    console.log(req.body); // Log the body to check the received data
  
    // Destructure the required fields from the request body
    const { id, projectName, startDate, expectedDate, budget, status } = req.body;
  
    // Check if all required fields are present
    if (!id || !projectName || !startDate || !expectedDate || !budget || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // SQL query to update the project details
    const query = `
      UPDATE projects 
      SET projectName = ?, startDate = ?, expectedDate = ?, budget = ?, status = ? 
      WHERE id = ?
    `;
  
    // Run the query with the provided data
    con.query(query, [projectName, startDate, expectedDate, budget, status, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // Check if any row was updated (i.e., project exists)
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Return a success response with the updated projectId
      res.status(200).json({
        message: 'Project updated successfully',
        projectId: id
      });
    });
  };
  
  



//  project details apis

// Function to get all project parts
export const getAllProjectParts = (req, res) => {
    const query = 'SELECT * FROM project_parts';
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};



// Function to get project parts for a specific project
export const getProjectPartsByProjectId = (req, res) => {
    const { projectId } = req.params; // Get projectId from URL params

    // Ensure projectId is provided and is a valid number
    if (!projectId || isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid or missing projectId' });
    }

    const query = 'SELECT * FROM project_parts WHERE project_id = ?';
    con.query(query, [projectId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No parts found for this project' });
        }
        res.status(200).json(results);
    });
};

// Function to get a project part by partId
export const getProjectPartById = (req, res) => {
    const { partId } = req.params; // Get partId from URL params

    // Ensure partId is provided and is a valid number
    if (!partId || isNaN(partId)) {
        return res.status(400).json({ error: 'Invalid or missing partId' });
    }

    const query = 'SELECT * FROM project_parts WHERE part_id = ?';
    con.query(query, [partId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No part found with this ID' });
        }
        res.status(200).json(results[0]); // Return only the first result since partId should be unique
    });
};

// Function to update a project part by partId
// Function to update a project part by partId
export const updateProjectPartById = (req, res) => {
    const { partId } = req.params;
    const { phaseName, employeeId, startDate, endDate, status, contributionPercentage, projectId } = req.body;

    // Ensure partId is provided and is a valid number
    if (!partId || isNaN(partId)) {
        return res.status(400).json({ error: 'Invalid or missing partId' });
    }

    // Ensure required fields are provided in the request body
    if (!phaseName || !employeeId || !startDate || !endDate || !status || !contributionPercentage || !projectId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if projectId exists in the database
    const checkQuery = 'SELECT project_id FROM project_parts WHERE part_id = ?';
    
    con.query(checkQuery, [partId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No part found with this ID' });
        }

        // Ensure projectId is correct (optional check)
        if (results[0].project_id !== projectId) {
            return res.status(400).json({ error: 'Project ID cannot be changed' });
        }

        // Update query (without project_name)
        const updateQuery = `
            UPDATE project_parts
            SET
                part_name = ?, 
                employee_id = ?, 
                start_date = ?, 
                end_date = ?, 
                status = ?, 
                contribution_percentage = ?
            WHERE part_id = ?`;

        con.query(updateQuery, [phaseName, employeeId, startDate, endDate, status, contributionPercentage, partId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'No part found with this ID to update' });
            }

            res.status(200).json({ message: 'Project part updated successfully' });
        });
    });
};





// export const getProjectById = (req, res) => {
//     const { id } = req.params;

//     const query = 'SELECT * FROM projects WHERE id = ?';
//     con.query(query, [id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         if (result.length === 0) {
//             return res.status(404).json({ error: 'Project not found' });
//         }
//         res.status(200).json(result[0]); // Return the project details
//     });
// };

export const getProjectById = (req, res) => {
    const { id } = req.params;

    // SQL query to get project details along with the customer name
    const sql = `
        SELECT 
            p.*,        -- Get all project details
            cd.full_name AS customerName  -- Get customer full name
        FROM projects p
        JOIN customerdetails cd ON p.customer_id = cd.customer_id
        WHERE p.id = ?
    `;

    con.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Return the project details along with the customer name
        return res.status(200).json({
            Status: true,
            Project: result[0],  // Project details
            CustomerName: result[0].customerName  // Customer name
        });
    });
};


// Delete Project Part
export const deleteProjectPart = (req, res) => {
    const { partId } = req.params; // Extract the partId from the request parameters

    // Ensure 'id' is the actual column name in your table, otherwise replace it with the correct one.
    const query = 'DELETE FROM project_parts WHERE part_id = ?'; // Use 'part_id' as column name

    con.query(query, [partId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project part not found' });
        }
        res.status(200).json({ Status: true, message: 'Project part deleted successfully' });
    });
};
export const addProjectPart = (req, res) => {
    const { part, employee, startDate, endDate, status, contribution } = req.body;
    const projectId = req.params.id;  // Extract projectId from the URL

    // Convert data types
    const contributionPercentage = parseFloat(contribution);  // Ensure contribution is a decimal
    const employeeId = parseInt(employee);  // Ensure employee is an integer

    // Check if all required fields are provided and have valid types
    if (!projectId || !part || !employee || !startDate || !endDate || !status || isNaN(contributionPercentage)) {
        return res.status(400).json({ error: 'All fields are required and contribution should be a valid number' });
    }

    // Check if the project exists in the projects table
    const checkProjectQuery = 'SELECT * FROM projects WHERE id = ?';
    con.query(checkProjectQuery, [projectId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If no project is found with the provided projectId, return an error
        if (result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // If the project exists, insert the new part into the project_parts table
        const query = `INSERT INTO project_parts (project_id, part_name, employee_id, start_date, end_date, status, contribution_percentage)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        con.query(query, [projectId, part, employeeId, startDate, endDate, status, contributionPercentage], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                message: 'Project part added successfully',
                partId: result.insertId // Return the id of the newly inserted part (auto-generated)
            });
        });
    });
};




export const getProjectIds = (req, res) => {
    const query = 'SELECT id, projectName FROM projects'; // Ensure 'id' and 'projectName' are the correct column names

    // Run the query to fetch the project ids and names
    con.query(query, (err, result) => {
        // Log any error that occurs
        if (err) {
            console.error('Error executing query:', err); // Log the error
            return res.status(500).json({ error: err.message });
        }

        // Log the result to see its structure
        console.log('Query result:', result);

        // Check if any rows are returned from the query
        if (!result || result.length === 0) {
            console.log('No projects found');
            return res.status(404).json({ error: 'No projects found' });
        }

        // Send the response with both project id and name
        res.status(200).json(result); // Send the whole result as response, which includes both 'id' and 'projectName'
    });
};


// Delete Project and its related project parts
export const deleteProject = (req, res) => {
    const { projectId } = req.params;
  
    // Begin a transaction to ensure data integrity
    con.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // First, delete all related project parts
      const deletePartsQuery = 'DELETE FROM project_parts WHERE project_id = ?';
      con.query(deletePartsQuery, [projectId], (err) => {
        if (err) {
          return con.rollback(() => {
            return res.status(500).json({ error: err.message });
          });
        }
  
        // Then, delete the project
        const deleteProjectQuery = 'DELETE FROM projects WHERE id = ?';
        con.query(deleteProjectQuery, [projectId], (err, result) => {
          if (err) {
            return con.rollback(() => {
              return res.status(500).json({ error: err.message });
            });
          }
  
          // If no project was deleted, return an error
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
          }
  
          // Commit the transaction
          con.commit((err) => {
            if (err) {
              return con.rollback(() => {
                return res.status(500).json({ error: err.message });
              });
            }
  
            res.status(200).json({ message: 'Project and related parts deleted successfully' });
          });
        });
      });
    });
  };

