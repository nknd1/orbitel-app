const pool = require('../../db');
const queries = require('../queries/client.queries');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

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
/*
const addClient = (req, res) => {
        const {type_id, client_name, client_phone, client_addres_registration, contract_id} = req.body;
        pool.query(queries.addClient, [type_id, client_name, client_phone, client_addres_registration, contract_id], (error, results) => {
            if (error) throw error;
            res.status(201).send("Клиент успешно добавлен.")
        });
    };

 */
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
const SECRET_KEY = '123'
const REFRESH_SECRET_KEY = '456';
const loginClient = async (req, res) => {
    const { client_phone, password } = req.body;

    try {
        // Поиск пользователя в базе данных по номеру телефона
        const result = await pool.query('SELECT * FROM client WHERE client_phone = $1', [client_phone]);
        if (result.rows.length === 0) {
            console.log('User not found:', client_phone);
            return res.status(400).json({ error: 'Invalid client_phone or password' });
        }

        const user = result.rows[0];

        // Сравнение пароля
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for account:', client_phone);
            return res.status(400).json({ error: 'Invalid client_phone or password' });
        }

        // Генерация JWT токена
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


/*
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



 */
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
    console.log(req.user); // Вывод информации о пользователе для отладки
    const { client_id } = req.user;
    console.log('cID: ', client_id);

    try {
        const result = await pool.query('SELECT * FROM contracts WHERE contract_client_id = $1', [client_id]);
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
        // Проверка, существует ли договор
        const contractResult = await pool.query('SELECT * FROM contracts WHERE contract_id = $1 AND contract_client_id = $2', [contract_id, client_id]);
        if (contractResult.rows.length === 0) {
          return res.status(404).json({ error: 'Contract not found' });
        }
    
        // Проверка, существует ли тариф
        const tariffResult = await pool.query('SELECT * FROM tariffs WHERE tariff_id = $1', [tariff_id]);
        if (tariffResult.rows.length === 0) {
          return res.status(404).json({ error: 'Tariff not found' });
        }
    
        // Проверка, не подключен ли тариф уже к договору
        const existingConnectionResult = await pool.query(
          'SELECT * FROM tariff_connect WHERE contract_id = $1 AND tariff_id = $2',
          [contract_id, tariff_id]
        );
    
        if (existingConnectionResult.rows.length > 0) {
          return res.status(400).json({ error: 'Tariff already connected to this contract' });
        }
    
        // Добавление связи между тарифом и договором
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


// Обработчик пополнения баланса в договоре
const upBalanceInContract = async (req, res) => {
    const { client_id } = req.user;
    const { balance } = req.body;

    // Проверка и преобразование balance в число
    const balanceNumber = parseFloat(balance);

    if (!balance || isNaN(balanceNumber) || balanceNumber <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // Получить текущий баланс
        const contractResult = await pool.query('SELECT balance FROM contracts WHERE contract_client_id = $1', [client_id]);

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        const currentBalance = parseFloat(contractResult.rows[0].balance);
        const newBalance = currentBalance + balanceNumber;

        // Обновить баланс
        const updateResult = await pool.query(
            'UPDATE contracts SET balance = $1 WHERE contract_client_id = $2 RETURNING *',
            [newBalance, client_id]
        );

        res.json({ newBalance: updateResult.rows[0].balance });
    } catch (error) {
        console.error('Database query error:', error); // Логирование ошибки
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getContractDetails = async (req, res) => {
    const { client_id } = req.user;

    try {
        const result = await pool.query(
            `SELECT c.contract_id, c.balance, t.tariff_name AS tariff_name,t.price_per_month AS tariff_price, t.speed AS speed
            FROM contracts c
            JOIN tariff_connect tc ON c.contract_id = tc.contract_id
            JOIN tariffs t ON tc.tariff_id = t.tariff_id
            WHERE c.contract_client_id = $1`,
            [client_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        const contractDetails = result.rows[0];

        const serviceResult = await pool.query(
            `SELECT s.service_id, s.service_name, s.feature, s.price
            FROM services s
            JOIN service_connect sc ON s.service_id = sc.service_id
            WHERE sc.tariff_id = (
                SELECT tc.tariff_id
                FROM tariff_connect tc
                WHERE tc.contract_id = $1)`,
            [contractDetails.contract_id]
        );
        const services = serviceResult.rows;
    
        res.status(200).json({contractDetails, services});
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const removeServiceFromContract = async (req, res) => {
    const { client_id } = req.user;
    const { contract_id, service_id } = req.params;

    try {
        // Проверьте, что контракт принадлежит текущему пользователю
        const contractResult = await pool.query(
            `SELECT contract_id FROM contracts WHERE contract_id = $1 AND contract_client_id = $2`,
            [contract_id, client_id]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or does not belong to the user' });
        }

        // Удалите услугу из тарифа
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

module.exports = {
    getClients,
    getClientById,
    addClient,
    removeClient,
    updateClient,
    loginClient,
    getClientInfo,
    getContractInfo,
    upBalanceInContract,
    connectTariffToContract,
    getContractDetails,
    removeServiceFromContract,
};

