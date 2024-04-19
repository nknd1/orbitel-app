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
                res.status(404).send("Клиент не найден")
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
                res.status(404).send("Клиент не найден.")
            }

            pool.query(queries.updateClient, [client_phone, client_id], (error, results) => {
                if (error) throw error;
                res.status(200).send("Клиент изменен.");
            });
        });
}

const registerClient = async (req, res) => {
    const { type_id, client_fio, client_phone, client_address_registration, series_passport, number_passport, issue_by, issue_date, expiration_date, inn, kpp, ogrn, okpo, okved, director} = req.body;

    try {

        await pool.query(
            "INSERT INTO client (type_id, client_fio, client_phone, client_address_registration, series_passport, number_passport, issue_by, issue_date, expiration_date, inn, kpp, ogrn, okpo, okved, director ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
            [type_id, client_fio, client_phone, client_address_registration, series_passport, number_passport, issue_by, issue_date, expiration_date, inn, kpp, ogrn, okpo, okved, director ]
        );

        res.status(201).json({ message: 'Заявка на подключение подана.' });
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
    const { client_name, client_phone } = req.body;

    try {
        const client = await pool.query('SELECT * FROM client WHERE client_name = $1', [client_name]);

        if (client.rows.length === 0) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const hashedPassword = client.rows[0].password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'неверные данные' });
        }

        if (client.rows[0].client_phone !== client_phone) {
            return res.status(401).json({ message: 'неверные данные' });
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

