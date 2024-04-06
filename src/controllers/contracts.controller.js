const pool = require('../../db');
const queries = require('../queries/contracts.queries');
const jwt = require('jsonwebtoken');



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
    const { connect_address, contract_number, personal_account, contract_client_id, password } = req.body;

    // Хешируем пароль
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Ошибка хеширования пароля");
        }

        pool.query(queries.addContract, [connect_address, contract_number, personal_account, contract_client_id, hashedPassword], (error, results) => {
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

/*
const tokenData = {
    contract_number,
    balance: updateBalance,
    accountNumber: updatedAccountNumber,
};
 */
/*
const loginContract = async (req, res) => {
    const {contract_number, password} = req.body;
    try {
        const { rows } = await pool.query(queries.getContractPassword, [contract_number]);

        if (rows.length === 0) {
            return res.status(401).send("Договор с указанным номером не найден");
        }

        const hashedPasswordFromDB = rows[0].password;
        const match = await bcrypt.compare(password, hashedPasswordFromDB);

        if (match) {
            const token = jwt.sign({contract_number}, 'your_secret_key', { expiresIn: '1h' });
            const refreshToken = jwt.sign({contract_number}, 'your_refresh_secret_key', { expiresIn: '7d' }); // Генерация Refresh Token

            console.log("Выдан новый токен и Refresh Token:", token, refreshToken);
            res.status(200).json({ token, refreshToken }); // Возвращение токена и Refresh Token

        } else {
            res.status(401).send("Неверный пароль");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Ошибка при аутентификации");
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

 */


module.exports = {
    getContracts,
    getContractsById,
    addContract,
    removeContract,
    updateContract,

};