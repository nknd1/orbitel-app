const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE user_id = $1";
const createUser = "INSERT INTO users (login, password, role_id) VALUES ($1, $2, $3) RETURNING *"
// queries.js
const getUserByLogin = "SELECT * FROM users WHERE login = $1";

module.exports = {
    getUsers,
    getUserById,
    createUser,
    getUserByLogin,
}