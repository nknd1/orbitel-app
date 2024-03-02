const pool = require('../../db');
const queries = require('../queries/client.queries');


const getClients = (req, res) => {
        pool.query(queries.getClients, (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
            console.log(req.headers.cookie);
        });
    };
const getClientById = (req, res) => {
        const client_id = parseInt(req.params.client_id);
        pool.query(queries.getClientById, [client_id], (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
        });
    };
const addClient = (req, res) => {
        const {type_id, client_name, client_phone, client_addres_registration, contract_id} = req.body;
        pool.query(queries.addClient, [type_id, client_name, client_phone, client_addres_registration, contract_id], (error, results) => {
            if (error) throw error;
            res.status(201).send("Клиент успешно добавлен.")
        });
    };
const removeClient = (req, res) => {
        const client_id = parseInt(req.params.client_id);
        pool.query(queries.getClientById, [client_id], (error, results) => {
            const noClientFound = !results.rows.length;
            if (noClientFound) {
                res.send("Клиент не найден")
            }
            pool.query(queries.removeClient, [client_id], (error, results) => {
                if (error) throw (error);
                res.status(200).send("Клиент успешно удален")
            })
        });
    };
const updateClient = (req, res) => {
        const client_id = parseInt(req.params.client_id);
        const {client_phone} = req.body;
        pool.query(queries.getClientById, [client_id], (error, results) => {
            const noClientFound = !results.rows.length;
            if (noClientFound) {
                res.send("Клиент не найден.")
            }

            pool.query(queries.updateClient, [client_phone, client_id], (error, results) => {
                if (error) throw error;
                res.status(200).send("Клиент изменен.");
            });
        });
}

const registerClient = async (req, res) => {
    const { type_id, client_name, client_phone, client_addres_registration, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Хеширование пароля

        await pool.query(
            "INSERT INTO client (type_id, client_name, client_phone, client_addres_registration, password) VALUES ($1, $2, $3, $4, $5)",
            [type_id, client_name, client_phone, client_addres_registration, hashedPassword]
        );

        res.status(201).json({ message: 'Клиент успешно зарегистрирован.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = 'secret_key';
const generateAccessToken = (client_id) => {
    return jwt.sign({ client_id: client_id }, secretKey, { expiresIn: '1h' });
};

const loginClient = async (req, res) => {
    const { client_name, client_phone, password } = req.body;

    try {
        const client = await pool.query('SELECT * FROM client WHERE client_name = $1', [client_name]);

        if (client.rows.length === 0) {
            return res.status(401).json({ message: 'Неверное имя клиента' });
        }

        const hashedPassword = client.rows[0].password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        if (client.rows[0].client_phone !== client_phone) {
            return res.status(401).json({ message: 'Неверный номер телефона' });
        }

        const accessToken = generateAccessToken(client_name);

        return res.status(200).json({ accessToken: accessToken, message: 'Успешная аутентификация' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Что-то пошло не так' });
    }
};





module.exports = {
    getClients,
    getClientById,
    addClient,
    removeClient,
    updateClient,
    registerClient,
    loginClient,
};

