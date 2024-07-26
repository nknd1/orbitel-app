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

const addContract = (req, res) => {
    const { connect_address, contract_number, personal_account, contract_client_id, password, ip_address, subnet_mask, dns1, dns2, gateway} = req.body;

    // Хешируем пароль
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Ошибка хеширования пароля");
        }

        pool.query(queries.addContract, 
            [connect_address, 
            contract_number, 
            personal_account, 
            contract_client_id, 
            hashedPassword, ip_address, 
            subnet_mask, 
            dns1, 
            dns2, 
            gateway],(error, results) => {
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





module.exports = {
    getContracts,
    getContractsById,
    addContract,
    removeContract,
    updateContract,
};