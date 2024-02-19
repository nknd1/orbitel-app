const getServices = "SELECT * FROM services";
const getServiceById = "SELECT * FROM services WHERE service_id = $1";
const addService = "insert into services(feature, type_id) values ($1, $2)";
const removeService = "DELETE FROM services WHERE service_id = $1";
const updateService = "UPDATE services SET feature = $1 WHERE service_id = $2";

const getServiceType = "SELECT * FROM type_service";
const getServiceTypeById = "SELECT * FROM type_service WHERE id = $1";
const addServiceType = "insert into type_service(name) values ($1)";
const removeServiceType = "DELETE FROM type_service WHERE id = $1";
const updateServiceType = "UPDATE type_service SET name = $1 WHERE id = $2";

module.exports = {
    getServices,
    getServiceById,
    addService,
    removeService,
    updateService,
    getServiceType,
    getServiceTypeById,
    addServiceType,
    removeServiceType,
    updateServiceType,
};