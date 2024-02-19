const getServiceType = "SELECT * FROM type_service";
const getServiceTypeById = "SELECT * FROM type_service WHERE id = $1";
const addServiceType = "insert into type_service(name) values ($1)";
const removeServiceType = "DELETE FROM type_service WHERE id = $1";
const updateServiceType = "UPDATE type_service SET name = $1 WHERE id = $2";

module.exports = {
    getServiceType,
    getServiceTypeById,
    addServiceType,
    removeServiceType,
    updateServiceType,
};