const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    try {
        if (!token) {
            throw new Error("Отсутствует токен аутентификации");
        }

        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                throw new Error("Неверный токен аутентификации");
            }

            req.contract_number = decoded.contract_number;
            next();
        });
    } catch (error) {
        console.error(error);
        res.status(401).send(error.message);
    }
};

const protectedRoute = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Получение токена из заголовка Authorization
        const decoded = jwt.verify(token, 'your_secret_key'); // Проверка и декодирование токена

        const contract_number = Number(decoded.contract_number);

        // Здесь вы можете выполнить запрос к базе данных для получения информации о договоре и тарифе
        // Например:
        const contractInfo = await pool.query(queries.getContractInfo, [contract_number]);


        res.status(200).json({ contract: contractInfo.rows});
    } catch (error) {
        console.error(error);
        res.status(401).send("Ошибка при доступе к информации о договоре");
    }
};

module.exports = { verifyToken, protectedRoute };
