const pool = require('../../db');
const queries = require('../queries/type_service.queries');

const getServiceType = (req, res) =>{
    pool.query(queries.getServiceType, (error, results)=>{
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getServiceTypeById = (req, res) =>{
    const id = parseInt(req.params.id);
    pool.query(queries.getServiceTypeById, [service_id], (error, results) =>{
        if(error) throw error;
        res.status(200).json(results.rows);
    });
}

const addServiceType = (req, res) =>{
    const {name} = req.body;
    pool.query(queries.addServiceType, [name], (error, results)=>{
        if (error) throw error;
        res.status(201).send("тип услуги добавлен.")
    });
};

const removeServiceType = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getServiceTypeById, [id], (error, results)=>{
        const noServiceFound = !results.rows.length;
        if(noServiceFound){
            res.send("тип услуги не найден.")
        }
        pool.query(queries.removeServiceType, [id], (error, results)=>{
            if(error) throw (error);
            res.status(200).send("тип услуги удален")
        })
    });
};
const updateServiceType = (req, res) =>{
    const id = parseInt(req.params.id);
    const {name} = req.body;
    pool.query(queries.getServiceTypeById, [id], (error, results)=>{
        const noServiceFound = !results.rows.length;
        if(noServiceFound){
            res.send("тип услуги не найден.")
        }

        pool.query(queries.updateServiceType, [name], (error, results)=>{
            if(error) throw error;
            res.status(200).send("тип услуги изменен.");
        });
    });
};

module.exports = {
    getServiceType,
    getServiceTypeById,
    addServiceType,
    removeServiceType,
    updateServiceType,
};