import con from '../../utils/db.js';  

export const getNotifications = (req, res) => {
    const query = 'SELECT * FROM notifications ORDER BY created_at DESC';
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

export const DeleteNotifications = (req, res) => {
    const query = 'Delete From notifications';
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'All notifications cleared.' });
    });
};
