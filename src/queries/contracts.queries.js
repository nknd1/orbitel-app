const getContracts = "SELECT * FROM contracts";
const getContractsById = "SELECT * FROM contracts WHERE contract_id = $1";
const checkConnectionAddress = "select connect_address from contracts c WHERE c.connect_address = $1";
const addContract = "INSERT INTO contracts(connect_address,contract_number, personal_account, contract_client_id, password, ip_address, subnet_mask, dns1, dns2, gateway) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";



const removeContract = "DELETE FROM contracts WHERE contract_id = $1";
const updateContract = "UPDATE contracts SET connect_address = $1 WHERE contract_id = $2";

const getContractInfo = "SELECT contract_id, balance, contract_number, personal_account FROM Contracts WHERE contract_number = $1;";
const getContractPassword = "SELECT password FROM contracts WHERE contract_number = $1;"


const getContractTariffInfo = "SELECT c.*, tariffs.*, client.* FROM tariffs JOIN contracts c JOIN tariff_connect tc ON c.contract_id = tc.contract_id ON tc.tariff_id = tariffs.tariff_id JOIN client ON c.contract_client_id = client.client_id WHERE c.contract_id = $1"
//const topUpBalance = "INSERT INTO contracts(balance) VALUES($1)"

module.exports = {
    getContracts,
    getContractsById,
    addContract,
    removeContract,
    updateContract,
    getContractPassword,
    getContractInfo,
    getContractTariffInfo,
};