# Test Currency Bird

Este proyecto es un servidor Node.js que proporciona dos endpoints para interactuar con la API de GeneralPayment:

1. `/obtener-informacion-pago` (GET): Obtiene información de un pago en GeneralPayment.
2. `/enviar-pago` (POST): Envía un pago a GeneralPayment.

## Configuración

### Base de Datos en Google Cloud

La base de datos de este proyecto está alojada en Google Cloud. A continuación, se muestra la información de la base de datos:

- Punto de enlace (Endpoint): `34.151.222.189`
- Puerto: `5432`

### Despliegue en Render

Este proyecto ha sido alojado en Render y se puede acceder en el siguiente enlace: [Test Currency Bird en Render](https://test-currencybird.onrender.com/).

### Endpoints

#### /obtener-informacion-pago (GET)

Este endpoint se utiliza para obtener información de un pago en GeneralPayment. Debes proporcionar los siguientes parámetros:

1. email: El correo electrónico asociado al pago.
2. transferCode: El código de transferencia del pago.

##### Ejemplo de solicitud GET:

GET https://test-currencybird.onrender.com/obtener-informacion-pago?email=franco.schiaffino@uc.cl&transferCode=franco.schiaffino@uc.cl


#### /enviar-pago (POST)

Este endpoint se utiliza para enviar un pago a GeneralPayment. Sin embargo, ten en cuenta que solo se realiza un pago si el correo no ha realizado un pago antes. Debes enviar los siguientes datos en el cuerpo de la solicitud:

1. transferCode: El código de transferencia del pago,
2. amount: La cantidad del pago

##### Ejemplo de solicitud POST:

POST https://test-currencybird.onrender.com/enviar-pago

{
  "transferCode": "franco.schiaffino@uc.cl",
  "amount": 100
}
