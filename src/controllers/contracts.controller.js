const pool = require('../../db');
const queries = require('../queries/contracts.queries');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");


const getContracts = (req, res) => {
   pool.query(queries.getContracts, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getContractsById = (req,res) => {
    const contract_id = parseInt(req.params.contract_id);
    pool.query(queries.getContractsById, [contract_id], (error, results) =>{
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const bcrypt = require('bcrypt');
const saltRounds = 10; // Количество раундов для генерации соли

const addContract = (req, res) => {
    const { connect_address, contract_number, personal_account, contract_client_id, password, ip_address, subnet_mask, dns1, dns2, gateway} = req.body;

    // Хешируем пароль
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Ошибка хеширования пароля");
        }

        pool.query(queries.addContract, [connect_address, contract_number, personal_account, contract_client_id, hashedPassword, ip_address, subnet_mask, dns1, dns2, gateway], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Ошибка при добавлении договора");
            }

            res.status(201).send("Договор успешно создан.");
        });
    });
};


const removeContract = (req, res) =>{
    const contract_id = parseInt(req.params.contract_id);
    pool.query(queries.getContractsById, [contract_id], (error, results)=>{
        const noContractFound = !results.rows.length;
        if(noContractFound){
            res.status(404).send("Договор не найден, не удалось удалить.")
        }
        pool.query(queries.removeContract, [contract_id], (error, results)=>{
            if(error) throw (error);
            res.status(200).send("Договор успешно удален.")

        })
    });
};

const updateContract = (req, res) =>{
    const contract_id = parseInt(req.params.contract_id);
    const {connect_address} = req.body;
    pool.query(queries.getContractsById, [contract_id], (error, results)=>{
        const noContractFound = !results.rows.length;
        if(noContractFound){
            res.status(401).send("Договор не найден.")
        }

        pool.query(queries.updateContract, [connect_address, contract_id], (error, results)=>{
            if(error) throw error;
            res.status(200).send("Договор изменен.");
        });
    });
};

const getContractInfo = (req, res) => {
    const contract_id = parseInt(req.params.contract_id);
    pool.query(queries.getContractTariffInfo, [contract_id], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    }
)
}

const getDeposits = async (req, res) => {
    try {
        const results = await pool.query(queries.getContractDeposit);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error executing getDeposits query:', error.stack);
        res.status(500).json({ error: 'Ошибка сервера при получении данных о депозитах' });
    }
};

const getWriteoffs = async (req, res) => {
    try {
        const results = await pool.query(queries.getContractWriteoffs);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error executing getWriteoffs query:', error.stack);
        res.status(500).json({ error: 'Ошибка сервера при получении данных о списаниях' });
    }
};




const addServiceToTariff = async (req, res) => {
    const { service_id, tariff_id } = req.body;

    if (!service_id || !tariff_id) {
      return res.status(400).json({ error: 'service_id and tariff_id are required' });
    }

        try{

        await pool.query('INSERT INTO service_connect (service_id, tariff_id) VALUES ($1, $2)', [service_id, tariff_id]);
        res.status(201).json({ message: 'Service added successfully' });
    } catch (error) {
        
        console.error('Error during service addition:', error);
        res.status(500).json({ error: 'Server error during service addition' });
    }
};





const deductBalance = async () => {
    const amountToDeduct = 5; // Сумма для списания

    try {
        await pool.query('BEGIN'); // Начало транзакции

        // Получение всех счетов, у которых баланс больше 0
        const res = await pool.query('SELECT contract_id, balance FROM contracts WHERE balance > $1', [amountToDeduct]);

        // Обновление баланса для каждого счета
        for (const row of res.rows) {
            const newBalance = row.balance - amountToDeduct;
            await pool.query('UPDATE contracts SET balance = $1 WHERE contract_id = $2', [newBalance, row.contract_id]);
        }

        await pool.query('COMMIT'); // Завершение транзакции
        console.log('Balances updated successfully');
    } catch (error) {
        await pool.query('ROLLBACK'); // Откат транзакции в случае ошибки
        console.error('Error deducting balance:', error.stack);
    }
};

const topUpBalance = async (contract_id, balance) => {
    try {
        await pool.query('BEGIN'); // Начало транзакции

        // Получение текущего баланса
        const res = await pool.query('SELECT balance FROM contracts WHERE contract_id = $1', [contract_id]);
        if (res.rows.length === 0) {
            throw new Error('Договор не найден');
        }

        const currentBalance = parseFloat(res.rows[0].balance); // Преобразование в число
        const newBalance = currentBalance + parseFloat(balance); // Преобразование и сложение

        // Обновление баланса
        await pool.query('UPDATE contracts SET balance = $1 WHERE contract_id = $2', [newBalance, contract_id]);

        await pool.query('COMMIT'); // Завершение транзакции
        console.log('Balance updated successfully');
        return newBalance;
    } catch (error) {
        await pool.query('ROLLBACK'); // Откат транзакции в случае ошибки
        console.error('Error topping up balance:', error.stack);
        throw error;
    }
};

const topUpContractBalance = async (req, res) => {
    const { contract_id, balance } = req.body;

    if (!contract_id || !balance || isNaN(balance) || balance <= 0) {
        return res.status(400).json({ error: 'Invalid contract_id or balance' });
    }

    try {
        const newBalance = await topUpBalance(contract_id, balance);
        res.status(200).json({ message: 'Balance topped up successfully', newBalance });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при пополнении баланса' });
    }
};


/*
const tokenData = {
    contract_number,
    balance: updateBalance,
    accountNumber: updatedAccountNumber,
};
 */ // Замените на ваш секретный ключ
const SECRET_KEY = '123'


/*
// Вход пользователя
const login = async (req, res) => {
    const { personal_account, password } = req.body;

    try {
        // Поиск пользователя в базе данных по account_number
        const result = await pool.query('SELECT * FROM contracts WHERE personal_account = $1', [personal_account]);
        if (result.rows.length === 0) {
            console.log('User not found:', personal_account);
            return res.status(400).json({ error: 'Invalid account number or password' });
        }

        const user = result.rows[0];

        // Сравнение пароля
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for account:', personal_account);
            return res.status(400).json({ error: 'Invalid account number or password' });
        }

        // Генерация JWT токена
        const token = jwt.sign({ personal_account: user.personal_account, contract_id: user.contract_id }, SECRET_KEY, { expiresIn: '1h' });

        console.log("Generated token for user:", user.personal_account);
        console.log(token)
        res.status(200).json({ token });
    } catch (error) {
        console.error('Server error during user login:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе пользователя' });
    }
};


 */

const getContractAndClientInfo = async (req, res) => {
    const { personal_account } = req.user;

    try {
        const result = await pool.query(
            /*
            `SELECT c.personal_account, c.balance, cl.fio
             FROM contracts c
             JOIN client cl ON c.client_id = cl.id
             WHERE c.personal_account = $1`,
            [personal_account]

             */
            'SELECT * FROM contracts WHERE personal_account = $1',[personal_account]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при получении информации о договоре и клиенте' });
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        console.log("Полученный Refresh Token:", refreshToken);

        const decoded = jwt.verify(refreshToken, 'your_refresh_secret_key');

        const token = jwt.sign({ contract_number: decoded.contract_number }, 'your_secret_key', { expiresIn: '1h' });

        console.log("Обновленный токен:", token);
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(401).send("Неверный или истекший Refresh Token");
    }
};

const logoutContract = async(req, res) =>{
    const tokenToInvalidate = req.headers.authorization.split(' ')[1];

    try {
        await addToRevokedTokenList(tokenToInvalidate);
        res.status(200).send("Вы успешно вышли из системы");
    } catch (e) {
        console.error(e);
        res.status(500).send("Ошибка при выходе из системы");
    }
};

const addToRevokedTokenList = async (token) =>{
    await RevokedToken.create({token})
};




module.exports = {
    getContracts,
    getContractsById,
    addContract,
    removeContract,
    updateContract,
    getContractInfo,
    getDeposits,
    getWriteoffs,
    deductBalance,
    topUpBalance,
    topUpContractBalance,
    getContractAndClientInfo,
    addServiceToTariff,
};