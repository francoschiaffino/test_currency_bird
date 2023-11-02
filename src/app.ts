import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Sequelize, DataTypes } from 'sequelize';

const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


// Configuración de la base de datos
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: '34.151.222.189',
    username: 'currency_user',
    password: 'currency123',
    database: 'currencydb',
    port: 5432,
  });

const Pago = sequelize.define('Pago', {
    ip: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    retries: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    transferCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

sequelize.sync();

// Endpoint para obtener información de un pago en GeneralPayment
app.get('/obtener-informacion-pago', async (req: Request, res: Response) => {
  try {
    const email = 'franco.schiaffino@uc.cl'
    const transferCode = 'franco.schiaffino@uc.cl'

    if (!email || !transferCode) {
      return res.status(400).send('Faltan parámetros en la solicitud.');
    }

    const token = await obtenerNuevoToken(transferCode);

    if (!token) {
      return res.status(500).send('Error al obtener un nuevo token de acceso.');
    }

    const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${email}&transferCode=${transferCode}`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: token,
      },
    });

    const paymentInfo = response.data;
    console.log('Información del pago:', paymentInfo);
    res.status(200).json(paymentInfo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la información del pago desde GeneralPayment.');
  }
});


async function obtenerGet (transferCode: string) {
    try {
        console.log('transferCode:', transferCode);
        const token = await obtenerNuevoToken(transferCode);
        const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${transferCode}&transferCode=${transferCode}`
        const response = await axios.get(apiUrl,{
            headers: {
                Authorization: token,
            },
            });
        if (response.status === 200) {
            return response.data;
        }
        return null;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

// Función para obtener un nuevo token de acceso
async function obtenerNuevoToken(transferCode) {
    try {
      const tokenUrl = `https://prod.developers-test.currencybird.cl/token?email=${transferCode}`;
      const response = await axios.get(tokenUrl);
  
      console.log('Estado de la respuesta:', response.status);
      console.log('Contenido de la respuesta:', response.data);
  
      if (response.status === 200) {
        console.log('Token obtenido:', response.data);
        return response.data;
      }
  
      console.log('No se encontró el token en la respuesta.');
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }


// Endpoint para enviar un pago a GeneralPayment
app.post('/enviar-pago', async (req: Request, res: Response) => {
  try {
    const { transferCode, amount } = req.body;
    const get = await obtenerGet(transferCode);
    console.log('get:', get)
    if (get_2 == "TRANSFER_NOT_FOUND") { 
    console.log('transferCode:', transferCode);
    console.log('amount:', amount);
    const data = {
        transferCode: `${transferCode}`,
        amount: amount,
    }
    const token = await obtenerNuevoToken(transferCode);
    const apiUrl = `https://prod.developers-test.currencybird.cl/payment?email=${transferCode}&transferCode=${transferCode}`
    const response = await axios.post(apiUrl, data,{
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
    await Pago.create({ ip: ip, amount: res_amount, email: email, retries: retries, transferCode: res_transferCode});
    res.status(200).json(paymentInfo);
    } else {
        res.status(403).send('Ya se ha enviado el pago con este correo. Solo se puede enviar una vez.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al enviar el pago');
  }
});


app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});