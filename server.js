const contractsRoutes = require('./src/routes/contracts.routes');
const clientRoutes = require('./src/routes/client.routes');
const servicesRoutes = require('./src/routes/services.routes');
const serviceTypeRoutes = require('./src/routes/type_service.routes');
const tariffsRoutes = require('./src/routes/tariffs.routes');
const cors = require('cors');
const express = require('express');
const {json} = require("body-parser");
const {configDotenv} = require("dotenv");
const {deductBalance} = require("./src/controllers/contracts.controller");
const app = express();


const balanceDeductionInterval = 300000; // 5 минут в миллисекундах

setInterval(deductBalance, balanceDeductionInterval);


app.use(cors({
       origin: '*', // Разрешить доступ со всех источников
        credentials: true, // Разрешить передачу учетных данных (например, куки)
        methods: 'GET, POST, PUT',// Разрешенные HTTP методы
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept', // Разрешенные заголовки
}));

require('dotenv').config()

const HOST = 'localhost'
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}:${HOST}`)
});

/*
const https = require('https');
const fs = require('fs');



https
    .createServer(
        {
            key: fs.readFileSync('./ssl/example.com+4-key.pem'),
            cert: fs.readFileSync('./ssl/example.com+4.pem'),

        },
        app
    )
    .listen(port, host, function () {
        console.log(
            `Server listens https://${HOST}:${PORT}`
        );
    });



 */
app.use(express.json())
app.use('/api/v1/clients', cors(), clientRoutes);
app.use('/api/v1/contracts', cors(),contractsRoutes);
app.use('/api/v1/services', cors(),servicesRoutes);
app.use('/api/v1/type_service',cors(), serviceTypeRoutes);
app.use('/api/v1/tariffs',cors(), tariffsRoutes);





