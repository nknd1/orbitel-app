const contractsRoutes = require('./src/routes/contracts.routes');
const clientRoutes = require('./src/routes/client.routes');
const servicesRoutes = require('./src/routes/services.routes');
const serviceTypeRoutes = require('./src/routes/type_service.routes')
const tariffsRoutes = require('./src/routes/tariffs.routes');

const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors({
    origin: ["https://localhost:3000"],
    credentials: true,
    accept: '*',
}));

require('dotenv').config()


const PORT = process.env.PORT || 3000;
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
app.use('/api/v1/signclient', cors(),clientRoutes);


//app.get("/", (req,res) =>{
//    res.send("hi");
//});
