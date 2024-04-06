const pool = require('../../db');
const queries = require('../queries/tariffs.queries');

const getTariffs = async (req, res) => {
    pool.query(queries.getTariffs, (error, results) =>{
        if(error){
            throw error
        }
        res.status(200).json(results.rows);
    })

};

const getTariffById = (req,res) => {
    const tariff_id = parseInt(req.params.tariff_id);
    pool.query(queries.getTariffById, [tariff_id], (error, results) =>{
        if(error){
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

const addTariff = (req, res) =>{
    const {tariff_name, price_per_month,speed} = req.body;
    // проверить если адрес подключения такой же как и у другого человека
    /*pool.query(queries.checkConnectionAddressExists, [connection_address], (error, results)=>{
        if(results.rows.length){
            res.send("адрес подключения уже есть в базе данных");
        }
    })*/
    pool.query(queries.addTariff,[tariff_name, price_per_month,speed], (error, results)=>{
        if (error) {
            throw error;
        }
        res.status(201).send("Тариф успешно создан.");
    });
};

const removeTariff = (req, res) =>{
    const tariff_id = parseInt(req.params.tariff_id);
    pool.query(queries.getTariffById, [tariff_id], (error, results)=>{
        const noTariffFound = !results.rows.length;
        if(noTariffFound){
            res.status(404).send("Тариф не найден, не удалось удалить.")
        }
        pool.query(queries.removeTariff, [tariff_id], (error, results)=>{
            if(error) {
                throw (error);
            }
            res.status(200).send("Тариф успешно удален.")
        })
    });
};

const updateTariff = (req, res) =>{
    const tariff_id = parseInt(req.params.tariff_id);
    const {tariff_name,price_per_month,speed} = req.body;
    pool.query(queries.getTariffById, [contract_id], (error, results)=>{
        const noTariffFound = !results.rows.length;
        if(noTariffFound){
            res.status(404).send("Тариф не найден.")
        }

        pool.query(queries.updateContract, [tariff_name, price_per_month,speed], (error, results)=>{
            if(error) {
                throw error;
            }
            res.status(200).send("Тариф изменен.");
        });
    });
};

module.exports = {
    getTariffs,
    getTariffById,
    addTariff,
    removeTariff,
    updateTariff,
};