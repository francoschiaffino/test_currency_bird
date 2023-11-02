"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const sequelize_1 = require("sequelize");
const fs = require('fs');
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
// Configuración de la base de datos
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: '34.151.222.189',
    username: 'currency_user',
    password: 'currency123',
    database: 'currencydb',
    port: 5432,
});
const Pago = sequelize.define('Pago', {
    ip: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    retries: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    transferCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
sequelize.sync();
// Endpoint para obtener información de un pago en GeneralPayment
app.get('/obtener-informacion-pago', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.query.email;
        const transferCode = req.query.transferCode;
        if (!email || !transferCode) {
            return res.status(400).send('Faltan parámetros en la solicitud.');
        }
        const token = yield obtenerNuevoToken(transferCode);
        if (!token) {
            return res.status(500).send('Error al obtener un nuevo token de acceso.');
        }
        const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${email}&transferCode=${transferCode}`;
        const response = yield axios_1.default.get(apiUrl, {
            headers: {
                Authorization: token,
            },
        });
        const paymentInfo = response.data;
        console.log('Información del pago:', paymentInfo);
        res.status(200).json(paymentInfo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener la información del pago desde GeneralPayment.');
    }
}));
function obtenerGet(transferCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('transferCode:', transferCode);
            const token = yield obtenerNuevoToken(transferCode);
            const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${transferCode}&transferCode=${transferCode}`;
            const response = yield axios_1.default.get(apiUrl, {
                headers: {
                    Authorization: token,
                },
            });
            if (response.status === 200) {
                return response.data;
            }
            return null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    });
}
;
// Función para obtener un nuevo token de acceso
function obtenerNuevoToken(transferCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokenUrl = `https://prod.developers-test.currencybird.cl/token?email=${transferCode}`;
            const response = yield axios_1.default.get(tokenUrl);
            console.log('Estado de la respuesta:', response.status);
            console.log('Contenido de la respuesta:', response.data);
            if (response.status === 200) {
                console.log('Token obtenido:', response.data);
                return response.data;
            }
            console.log('No se encontró el token en la respuesta.');
            return null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    });
}
// Endpoint para enviar un pago a GeneralPayment
app.post('/enviar-pago', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transferCode, amount } = req.body;
        const get = yield obtenerGet(transferCode);
        console.log('get:', get);
        if (get == "TRANSFER_NOT_FOUND") {
            console.log('transferCode:', transferCode);
            console.log('amount:', amount);
            const data = {
                transferCode: `${transferCode}`,
                amount: amount,
            };
            const token = yield obtenerNuevoToken(transferCode);
            const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${transferCode}&transferCode=${transferCode}`;
            const response = yield axios_1.default.post(apiUrl, data, {
                headers: {
                    Authorization: token,
                },
            });
            const paymentInfo = response.data;
            const ip = paymentInfo.ip;
            const res_amount = paymentInfo.amount;
            const email = paymentInfo.email;
            const retries = paymentInfo.retries;
            const res_transferCode = paymentInfo.transferCode;
            console.log('Información del pago:', paymentInfo);
            console.log('ip:', ip);
            console.log('res_amount:', res_amount);
            console.log('email:', email);
            console.log('retries:', retries);
            console.log('res_transferCode:', res_transferCode);
            yield Pago.create({ ip: ip, amount: res_amount, email: email, retries: retries, transferCode: res_transferCode });
            res.status(200).json(paymentInfo);
        }
        else {
            res.status(403).send('Ya se ha enviado el pago con este correo. Solo se puede enviar una vez.');
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar el pago');
    }
}));
app.listen(port, () => {
    console.log(`Servidor en funcionamiento en el puerto ${port}`);
});
//# sourceMappingURL=app.js.map