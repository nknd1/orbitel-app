const pool = require('../../db');
const queries = require('../queries/tariffs.queries');


/*
class TariffsController {
    async getAll (req, res) {
        try{
            await pool.query(queries.getTariffs, (err, result) => {
                result.status(200).json(result);
            })
        } catch (e) {
            throw new Error(e);
        }
    };

    async getTariffById (req, res) {
        try {
            const tariff_id = parseInt(req.params.tariff_id);
            pool.query(queries.getTariffById, [tariff_id], (err, result) => {
                result.status(200).json(result);
            })
        } catch (e) {
            throw new Error(e);
        }
    };

    async getTariffByName (req, res) {
        try {
            await pool.query()
        } catch (error) {
            throw new Error(error);
        }
    }

}

 */

const getTariffConnect = async (req, res) => {
    const tariff_id = req.params.tariff_id;
    try {
        const tariffResult = await pool.query('SELECT * FROM tariffs WHERE tariff_id = $1', [tariff_id]);
        const servicesResult = await pool.query(`
             SELECT services.* FROM services
            JOIN service_connect ON services.service_id = service_connect.service_id
            WHERE service_connect.tariff_id = $1;
        `, [tariff_id]);

        if (tariffResult.rows.length === 0) {
            return res.status(404).json({ error: 'Tariff not found' });
        }

        const tariff = tariffResult.rows[0];
        const services = servicesResult.rows;

        res.json({ tariff, services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


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
    getTariffConnect,
   
};