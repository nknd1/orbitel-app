const pool = require('../../db');
const queries = require('../queries/services.queries');

const getServices = (req, res) =>{
    pool.query(queries.getServices, (error, results)=>{
        if (error) throw error;
        res.status(200).json(results.rows);
        console.log(req.headers.cookie);
    });
};

const getServiceById = (req, res) =>{
    const service_id = parseInt(req.params.service_id);
    pool.query(queries.getServiceById, [service_id], (error, results) =>{
        if(error) throw error;
        res.status(200).json(results.rows);
    });
}

const addService = (req, res) =>{
    const {service_name,feature, type_id} = req.body;
    pool.query(queries.addService, [service_name, feature, type_id], (error, results)=>{
        if (error) throw error;
        res.status(201).send("Услуга успешно добавлена.")
    });
};

const removeService = (req, res) => {
    const service_id = parseInt(req.params.service_id);
    pool.query(queries.getServiceById, [service_id], (error, results)=>{
        const noServiceFound = !results.rows.length;
        if(noServiceFound){
            res.send("Услуга не найдена.")
        }
        pool.query(queries.removeService, [service_id], (error, results)=>{
            if(error) throw (error);
            res.status(200).send("Услуга успешно удалена")
        })
    });
};
const updateService = (req, res) =>{
    const service_id = parseInt(req.params.service_id);
    pool.query(queries.getServiceById, [service_id], (error, results)=>{
        const noServiceFound = !results.rows.length;
        if(noServiceFound){
            res.send("Услуга не найдена.")
        }

        pool.query(queries.updateService, [service_name, feature], (error, results)=>{
            if(error) throw error;
            res.status(200).send("Услуга изменена.");
        });
    });
};

module.exports = {
    getServices,
    getServiceById,
    addService,
    removeService,
    updateService,
};