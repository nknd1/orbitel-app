const pool = require('../../db');
const queries = require('../queries/type_service.queries');

const getServiceType = async (req, res) =>{
    try{
        const { rows } = await pool.query(queries.getServiceType)
        res.json(rows);
    } catch (error) {
        res.status(500).json({error: error.message});
    }

};

const getServiceTypeById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const {rows} = await pool.query(queries.getServiceTypeById, [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({message: 'Service type not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
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
            res.status(404).send("тип услуги не найден.")
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
            res.status(404).send("тип услуги не найден.")
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