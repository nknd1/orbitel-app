import jwt from "jsonwebtoken";
import pool from "../../db";




const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    console.log('User data from token:', req.user);
    if (!token) {
        return res.status(401).json({ message: 'Отсутствует токен авторизации.' });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Недействительный токен авторизации.' });
        }

        req.user = decoded;
        console.log(decoded);

        next();
    });
};




 
module.exports = {verifyToken}