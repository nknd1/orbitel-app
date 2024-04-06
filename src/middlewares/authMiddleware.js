import jwt from "jsonwebtoken";



const verifyToken = (req, res, next) => {
    const authHeader = req.headers[`authorization`];
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

// Защищенный маршрут для получения информации о пользователе
// Код ChatGPT
/*
app.get('/user-info', verifyToken, async (req, res) => {
    try {
        console.log('req.user:', req.user);
        const { user_id, login, role_id} = req.user;


        console.log('user_id:', user_id);
        console.log('role_id:', role_id);

        // Проверяем, что user_id и role_id являются числами

        const bigRole = BigInt(role_id);


        res.status(200).json({ user_id, login, role: bigRole});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


 */
module.exports = {verifyToken}