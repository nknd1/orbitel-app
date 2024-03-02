const pool = require('../../db');
const queries = require('../queries/contracts.queries');

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

const addContract = (req, res) =>{
    const {connect_address, contract_number, personal_account, contract_client_id} = req.body;
    // проверить если адрес подключения такой же как и у другого человека

    pool.query(queries.addContract,[connect_address, contract_number, personal_account, contract_client_id], (error, results)=>{
        if (error) throw error;
        res.status(201).send("Договор успешно создан.");
    });
};

const removeContract = (req, res) =>{
    const contract_id = parseInt(req.params.contract_id);
    pool.query(queries.getContractsById, [contract_id], (error, results)=>{
        const noContractFound = !results.rows.length;
        if(noContractFound){
            res.send("Договор не найден, не удалось удалить.")
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
            res.send("Договор не найден.")
        }

        pool.query(queries.updateContract, [connect_address, contract_id], (error, results)=>{
            if(error) throw error;
            res.status(200).send("Договор изменен.");
        });
    });
};

module.exports = {
    getContracts,
    getContractsById,
    addContract,
    removeContract,
    updateContract,
};