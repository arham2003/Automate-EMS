import con from '../../utils/db.js';  // Import the MySQL connection



// Define the function to get employee names and salaries
export const getEmployeeSalaries = (req, res) => {
    const query = 'SELECT name, salary FROM employee'; // SQL query to get name and salary
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results); // Send the results as JSON
    });
};

export const paySalary = (req, res) => {
    const { empName, salary, bonus, salaryDate, status } = req.body;

    if (!empName || !salary || !salaryDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL query to insert into the payments table
    const query = `
        INSERT INTO payments (empid, salary, bonus, payment_date, status)
        SELECT e.id, ?, ?, ?, ? 
        FROM employee e 
        WHERE e.name = ?
    `;

    con.query(query, [salary, bonus, salaryDate, status, empName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Salary data submitted successfully!' });
    });
};


export const getPayments = (req, res) => {
    const query = 'SELECT payment_id, empid, salary, bonus, payment_date, status FROM payments';
    
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results); // Send the results as JSON
    });
};

export const checkPaymentStatus = (req, res) => {
    const { empName, salaryDate } = req.query;
  
    // SQL query to check if the payment is already made for the employee and month
    const query = `
      SELECT status 
      FROM payments
      JOIN employee ON payments.empid = employee.id  -- Updated column name
      WHERE employee.name = ? AND payments.payment_date = ?;
    `;
  
    con.query(query, [empName, salaryDate], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (results.length > 0 && results[0].status === 'Paid') {
        return res.status(200).json({ paid: true });
      }
  
      return res.status(200).json({ paid: false });
    });
  };

  export const getEmployeePayments = (req, res) => {
    const { month, year } = req.query;  // Extract month and year from query parameters

    // SQL query to get employee payments for the selected month and year
    const query = `
        SELECT 
            payments.payment_id,
            employee.name AS employee_name,
            payments.salary,
            payments.bonus,
            payments.payment_date,
            payments.status
        FROM 
            payments
        JOIN 
            employee 
        ON 
            payments.empid = employee.id
        WHERE 
            DATE_FORMAT(STR_TO_DATE(CONCAT('01/', payments.payment_date), '%d/%m/%Y'), '%M') = ? 
        AND 
            DATE_FORMAT(STR_TO_DATE(CONCAT('01/', payments.payment_date), '%d/%m/%Y'), '%Y') = ?;
    `;

    con.query(query, [month, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results); // Send the results as JSON
    });
};


  