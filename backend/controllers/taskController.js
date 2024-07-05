const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')
const { saveToHistory } = require('./callback');




const createTask = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);

        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { idEmploye, messageTache, deadline, statut, priorite } = req.body;
        
        if (!['To-Do', 'In-Progress', 'Done'].includes(statut)) {
            return res.status(400).json({ message: "Invalid  status" });
        }
        if (!['urgence', 'importance', 'routine'].includes(priorite)) {
            return res.status(400).json({ message: "Invalid priorite" });
        }

        
        const query = 'INSERT INTO tache (idEmploye, messageTache, deadline, statut, priorite) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [idEmploye, messageTache, deadline, statut, priorite], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const userId = authResult.decode.id;
            console.log('Connected user:', userId);
            const userRole = authResult.decode.role;
            saveToHistory('task created', userId, userRole);
            res.status(201).json({ message: 'Tâche créée avec succès', id: result.insertId });
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const query = 'SELECT * FROM tache';
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getTaskById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const query = 'SELECT * FROM tache WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ message: 'Tâche non trouvée' });
            res.status(200).json(result[0]);
        });
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const updateTask = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const { messageTache, deadline, statut, priorite } = req.body;

        if (!['To-Do', 'In-Progress', 'Done'].includes(statut)) {
            return res.status(400).json({ message: "Invalid  status" });
        }
    if (!['urgence', 'importance', 'routine'].includes(priorite)) {
        return res.status(400).json({ message: "Invalid priorite" });
      }
        const checkQuery = 'SELECT * FROM tache WHERE id = ?';
        db.query(checkQuery, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ message: 'Task not found' });

            const updateQuery = 'UPDATE tache SET messageTache = ?, deadline = ?, statut = ?, priorite = ? WHERE id = ?';
            db.query(updateQuery, [messageTache, deadline, statut, priorite, id], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: 'Task updated successfully' });

                const userId = authResult.decode.id;
                console.log('Connected user:', userId);
                const userRole = authResult.decode.role;
                saveToHistory('task updated', userId, userRole);
            });
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const query = 'DELETE FROM tache WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Tâche supprimée avec succès' });
        });

        const userId = authResult.decode.id;
        console.log('Connected user:', userId);
        const userRole = authResult.decode.role;
        saveToHistory('task deleted', userId, userRole);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
