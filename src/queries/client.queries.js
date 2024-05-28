const getClients = "SELECT * FROM client";
const getClientById = "SELECT * FROM client WHERE client_id = $1";
const addClient = "insert into client(type_id, client_fio, client_phone, client_address_registration, password) values ($1, $2, $3, $4, $5)";
const removeClient = "DELETE FROM client WHERE client_id = $1";
const updateClient = "UPDATE client SET client_phone = $1 WHERE client_id = $2";



//const createClient = "INSERT INTO clients (client_name, client_phone, client_address_registration, password, contract_id)VALUES ($1, $2, $3, $4, $5) RETURNING *";

const getClientByName = "SELECT * FROM clients WHERE client_name = $1"

module.exports = {
    getClients,
    getClientById,
    addClient,
    removeClient,
    updateClient,
    getClientByName,
};