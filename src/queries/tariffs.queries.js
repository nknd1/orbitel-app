const getTariffs = "SELECT * FROM tariffs";
const getTariffById = "SELECT * FROM tariffs WHERE tariff_id = $1";
// const checkConnectionAddress = "select connect_address from contracts c WHERE c.connect_address = $1";
const addTariff = "INSERT INTO tariffs(tariff_name,price_per_month,speed) VALUES ($1, $2, $3)";
const removeTariff = "DELETE FROM tariffs WHERE tariff_id = $1";
const updateTariff = "UPDATE tariffs SET tariff_name, price_per_month, = $1 WHERE contract_id = $2";
module.exports = {
    getTariffs,
    getTariffById,
    addTariff,
    removeTariff,
    updateTariff,
};