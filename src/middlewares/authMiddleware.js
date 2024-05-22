const jwt = require('jsonwebtoken');
const SECRET_KEY = '123' // Замените на ваш секретный ключ

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            console.log('Token:', token);
            console.log('Secret Key:', SECRET_KEY);
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};
module.exports = authenticateToken;
