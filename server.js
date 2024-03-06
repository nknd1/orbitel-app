const contractsRoutes = require('./src/routes/contracts.routes');
const clientRoutes = require('./src/routes/client.routes');
const servicesRoutes = require('./src/routes/services.routes');
const serviceTypeRoutes = require('./src/routes/type_service.routes');
const tariffsRoutes = require('./src/routes/tariffs.routes');
const usersRoutes = require('./src/routes/users.routes');


const cors = require('cors');
const express = require('express');
const {json} = require("body-parser");

const app = express();



app.use(cors({
    origin: '*', // Разрешить доступ со всех источников
    credentials: true, // Разрешить передачу учетных данных (например, куки)
    methods: 'GET, POST, PUT, DELETE', // Разрешенные HTTP методы
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept', // Разрешенные заголовки
}));



require('dotenv').config()


const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});



/*
const https = require('https');
const fs = require('fs');

const host = '31.31.196.157'
const port = ;

https
    .createServer(
        {
            key: fs.readFileSync('./cert/keycert.key'),
            cert: fs.readFileSync('./cert/cert.crt'),
        },
        app
    )
    .listen(port, host, function () {
        console.log(
            `Server listens https://${host}:${port}`
        );
    });

*/
app.use(express.json())
app.use('/api/v1/clients', cors(), clientRoutes);
app.use('/api/v1/contracts', cors(),contractsRoutes);
app.use('/api/v1/services', cors(),servicesRoutes);
app.use('/api/v1/type_service',cors(), serviceTypeRoutes);
app.use('/api/v1/tariffs',cors(), tariffsRoutes);
app.use('/api/v1/users', cors(), usersRoutes);





//app.get("/", (req,res) =>{
//    res.send("hi");
//});
