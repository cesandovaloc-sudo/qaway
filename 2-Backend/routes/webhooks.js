const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Rutas para Meta (WhatsApp / Facebook Ads)
// GET es requerido por Meta para verificar el Endpoint al momento de conectarlo.
router.get('/meta', webhookController.verifyMetaWebhook);
// POST es donde llegarán los mensajes entrantes reales
router.post('/meta', webhookController.handleMetaWebhook);

// Ruta para WooCommerce
router.post('/woocommerce', webhookController.handleWooCommerceWebhook);

// Ruta para Correos (Mailing)
router.post('/mailing', webhookController.handleMailingWebhook);

module.exports = router;
