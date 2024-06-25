const pool = require('../../db');
const queries = require('../queries/client.queries');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const SECRET_KEY = '123'
const REFRESH_SECRET_KEY = '456';


const getClients = (req, res) => {
        pool.query(queries.getClients, (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
            console.log(req.headers.cookie);
        });
    };

const getClientById = (req, res) => {g
        const client_id = parseInt(req.params.client_id);
        pool.query(queries.getClientById, [client_id], (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
        });
    };

const addClient = (req, res) => {
    const {type_id, client_fio, client_phone, client_address_registration, password} = req.body;

    // Хешируем пароль
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Ошибка хеширования пароля");
        }

        pool.query(queries.addClient, [type_id, client_fio, client_phone, client_address_registration, hashedPassword], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Ошибка при добавлении нового клиента");
            }

            res.status(201).send("Клиент успешно создан.");
        });
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

const loginClient = async (req, res) => {
    const { client_phone, password } = req.body;

    try {

        const result = await pool.query('SELECT * FROM client WHERE client_phone = $1', [client_phone]);
        if (result.rows.length === 0) {
            console.log('Клиент не найден:', client_phone);
            return res.status(400).json({ error: 'Invalid client_phone or password' });
        }

        const user = result.rows[0];

        // Сравнение пароля
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for account:', client_phone);
            return res.status(400).json({ error: 'Invalid client_phone or password' });
        }


        const token = jwt.sign({ client_phone: user.client_phone, client_id: user.client_id }, SECRET_KEY, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ client_phone: user.client_phone, client_id: user.client_id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

        console.log("Generated tokens for user:", user.client_phone);
        console.log("Access token:", token);
        console.log("Refresh token:", refreshToken);

        // Отправка access и refresh токенов клиенту
        res.status(200).json({ token, refreshToken });
    } catch (error) {
        console.error('Server error during user login:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе пользователя' });
    }
};

const getClientInfo = async (req, res) => {
    console.log(req.user)
    const { client_id } = req.user;

    try {
        const result = await pool.query(

            'SELECT client.client_id, client.client_fio AS client_fio, client.client_phone, client.client_address_registration,  client_type.name AS client_type FROM client JOIN client_type ON client.type_id = client_type.id WHERE client.client_id = $1',[client_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'client not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при получении информации о договоре и клиенте' });
    }
};

const getContractInfo = async (req, res) => {
    console.log(req.user);
    const { client_id } = req.user;
    console.log('cID: ', client_id);

    try {
        const result = await pool.query(`
        SELECT 
        c.contract_id,
        c.contract_number,
        c.connect_address,
        c.balance,
        c.personal_account
    FROM 
        client_contracts cc
    JOIN 
        contracts c ON cc.contract_id = c.contract_id
    WHERE 
        cc.client_id = $1;
    `, [client_id]);
        if (result.rows) {
          res.json(result.rows);
        } else {
          res.status(404).json({ error: 'No contracts found' });
        }
      } catch (error) {
        console.error('Database query error:', error); // Логирование ошибки
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };

const connectTariffToContract = async(req, res) => {
    const { client_id } = req.user;
    const { contract_id, tariff_id} = req.body
    if(!contract_id || isNaN(contract_id) || !tariff_id || isNaN(tariff_id)){
        return res.status(400).json({error: 'Invalid contract or tariff ID'})
    }
    try {
        const contractResult = await pool.query('SELECT * FROM contracts WHERE contract_id = $1 AND contract_client_id = $2', [contract_id, client_id]);
        if (contractResult.rows.length === 0) {
          return res.status(404).json({ error: 'Contract not found' });
        }
        const tariffResult = await pool.query('SELECT * FROM tariffs WHERE tariff_id = $1', [tariff_id]);
        if (tariffResult.rows.length === 0) {
          return res.status(404).json({ error: 'Tariff not found' });
        }
        const existingConnectionResult = await pool.query(
          'SELECT * FROM tariff_connect WHERE contract_id = $1 AND tariff_id = $2',
          [contract_id, tariff_id]
        );
        if (existingConnectionResult.rows.length > 0) {
          return res.status(400).json({ error: 'Tariff already connected to this contract' });
        }
        const insertResult = await pool.query(
          'INSERT INTO tariff_connect (contract_id, tariff_id) VALUES ($1, $2) RETURNING *',
          [contract_id, tariff_id]
        );
        res.json(insertResult.rows[0]);
      } catch (error) {
        console.error('Database query error:', error); // Логирование ошибки
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };

const getContractDetails = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id } = req.query;

    try {

        const contractQuery = `
            SELECT 
                c.contract_id,
                t.tariff_name AS tariff_name,
                t.price_per_month AS tariff_price,
                t.speed AS speed
            FROM 
                contracts c
            JOIN 
                client_contracts cc ON c.contract_id = cc.contract_id
            JOIN 
                tariff_connect tc ON c.contract_id = tc.contract_id
            JOIN 
                tariffs t ON tc.tariff_id = t.tariff_id
            WHERE 
                cc.client_id = $1
                AND c.contract_id = $2
        `;
        const contractParams = [client_id, contract_id]; // Параметры для запроса

        const contractResult = await pool.query(contractQuery, contractParams);


        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }


        const contractDetails = contractResult.rows[0];


        const servicesQuery = `
            SELECT 
                s.service_id,
                s.service_name,
                s.feature,
                s.price
            FROM 
                services s
            JOIN 
                service_connect sc ON s.service_id = sc.service_id
            WHERE 
                sc.tariff_id IN (
                    SELECT tc.tariff_id
                    FROM tariff_connect tc
                    WHERE tc.contract_id = $1
                )
        `;
        const servicesParams = [contract_id]; // Параметры для запроса услуг

        const servicesResult = await pool.query(servicesQuery, servicesParams);
        const services = servicesResult.rows;

        // Отправка успешного ответа с деталями договора и услугами
        res.status(200).json({ contractDetails, services });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const removeServiceFromContract = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id, service_id } = req.params;
    try {
        const contractResult = await pool.query(
            `SELECT contract_id FROM client_contracts WHERE contract_id = $1 AND client_id = $2`,
            [contract_id, client_id]
        );
        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }
        await pool.query(
            `DELETE FROM service_connect WHERE tariff_id = (
                SELECT tariff_id FROM tariff_connect WHERE contract_id = $1
            ) AND service_id = $2`,
            [contract_id, service_id]
        );
        res.status(200).json({ message: 'Service removed successfully' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addServiceToContract = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id, service_id } = req.params;

    try {
        // Проверяем, что контракт принадлежит текущему пользователю через таблицу client_contracts
        const contractResult = await pool.query(
            `SELECT contract_id FROM client_contracts WHERE contract_id = $1 AND client_id = $2`,
            [contract_id, client_id]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }

        // Добавляем услугу к тарифу
        await pool.query(
            `INSERT INTO service_connect (tariff_id, service_id)
             SELECT tariff_id, $2 FROM tariff_connect WHERE contract_id = $1`,
            [contract_id, service_id]
        );

        res.status(200).json({ message: 'Service added successfully' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const changeTariff = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id, tariff_id } = req.params;

    try {

        const contractResult = await pool.query(
            `SELECT contract_id FROM client_contracts WHERE contract_id = $1 AND client_id = $2`,
            [contract_id, client_id]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }


        await pool.query(
            `UPDATE tariff_connect SET tariff_id = $1 WHERE contract_id = $2`,
            [tariff_id, contract_id]
        );

        res.status(200).json({ message: 'Tariff changed successfully' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const topUpBalance = async (req, res) => {
    const { client_id } = req.user;  // Получаем client_id из токена авторизации
    const { contract_id } = req.params; // Получаем contract_id из URL параметра
    const { balance } = req.body; // Получаем сумму пополнения из тела запроса

    if (!balance || isNaN(balance)) {
        return res.status(400).json({ error: 'Invalid balance amount' });
    }

    const parsedContractId = parseInt(contract_id, 10); // Преобразование contract_id в число

    if (isNaN(parsedContractId)) {
        return res.status(400).json({ error: 'Invalid contract ID' });
    }

    try {
        await pool.query('BEGIN'); // Начало транзакции

        // Проверка, принадлежит ли контракт пользователю
        const contractResult = await pool.query(
            `SELECT c.contract_id 
             FROM contracts c
             JOIN client_contracts cc ON c.contract_id = cc.contract_id
             WHERE c.contract_id = $1 AND cc.client_id = $2`,
            [parsedContractId, client_id]
        );

        if (contractResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }

        // Получение текущего баланса
        const balanceResult = await pool.query('SELECT balance FROM contracts WHERE contract_id = $1', [parsedContractId]);
        if (balanceResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Contract not found' });
        }

        const currentBalance = parseFloat(balanceResult.rows[0].balance); // Преобразование в число
        const newBalance = currentBalance + parseFloat(balance); // Преобразование и сложение

        // Обновление баланса
        await pool.query('UPDATE contracts SET balance = $1 WHERE contract_id = $2', [newBalance, parsedContractId]);

        await pool.query('COMMIT'); // Завершение транзакции
        res.status(200).json({ message: 'Balance topped up successfully', newBalance: newBalance });
    } catch (error) {
        await pool.query('ROLLBACK'); // Откат транзакции в случае ошибки
        console.error('Database query error:', error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getOperationHistory = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id } = req.params;

    try {
        // Проверьте, что контракт принадлежит текущему пользователю
        const contractResult = await pool.query(
            `SELECT contract_id FROM client_contracts WHERE contract_id = $1 AND client_id = $2`,
            [contract_id, client_id]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }

        // Получение истории пополнений
        const depositsResult = await pool.query(
            `SELECT deposit_id, date_deposits, time_deposits, amount, contract_id FROM deposits WHERE contract_id = $1 ORDER BY date_deposits DESC, time_deposits DESC`,
            [contract_id]
        );

        // Получение истории списаний
        const writeoffsResult = await pool.query(
            `SELECT writeoff_id, date_writeoffs, time_writeoffs, amount, reason, contract_id FROM writeoffs WHERE contract_id = $1 ORDER BY date_writeoffs DESC, time_writeoffs DESC`,
            [contract_id]
        );

        res.status(200).json({
            deposits: depositsResult.rows,
            writeoffs: writeoffsResult.rows
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = {
    getClients,
    getClientById,
    addClient,
    removeClient,
    updateClient,
    loginClient,
    getClientInfo,
    getContractInfo,
    connectTariffToContract,
    getContractDetails,
    removeServiceFromContract,
    addServiceToContract,
    changeTariff,
    topUpBalance,
    getOperationHistory,
};

