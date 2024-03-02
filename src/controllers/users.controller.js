const pool = require('../../db');
const queries = require('../queries/users.queries');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUsers = async (req, res) => {
    try {
        const { rows } = await pool.query(queries.getUsers);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getUserById = async (req, res) => {
    const user_id = parseInt(req.params.user_id);
    try {
        const { rows } = await pool.query(queries.getUserById, [user_id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const registerUser = async (req, res) => {
    const { login, password, role_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(queries.createUser, [login, hashedPassword, role_id]);
        res.status(201).json({ message: 'Пользователь зарегистрирован успешно.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await pool.query(queries.getUserByLogin, [login]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль.' });
        }

        const hashedPassword = user.rows[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль.' });
        }

        const token = jwt.sign({ login: user.rows[0].login, role: user.rows[0].role_id }, 'secret_key', { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUsers, getUserById, registerUser, loginUser };
