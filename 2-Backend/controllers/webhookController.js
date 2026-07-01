/**
 * Controlador de Webhooks
 * Aquí se procesan todas las señales (cargas útiles) que vienen desde el exterior
 * (Meta, WooCommerce, Mailing) y se estandarizan para ser inyectadas al CRM.
 */

// 1. Manejador para Meta (WhatsApp y Facebook Ads)
exports.handleMetaWebhook = (req, res) => {
  const { body } = req;

  // Verificar si es un evento de WhatsApp (Mensaje entrante)
  if (body.object === 'whatsapp_business_account') {
    try {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      // Asegurarnos de que exista un mensaje
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const contact = value.contacts[0];
        const phone = message.from;
        const name = contact.profile.name;
        
        console.log(`\n========================================`);
        console.log(`💬 NUEVO MENSAJE DE WHATSAPP`);
        console.log(`👤 Cliente: ${name} (${phone})`);
        
        if (message.type === 'text') {
          console.log(`📝 Texto: "${message.text.body}"`);
        } else if (message.type === 'interactive') {
          console.log(`👆 Clic en Botón: "${message.interactive.button_reply.title}" (ID: ${message.interactive.button_reply.id})`);
        } else {
          console.log(`📎 Tipo de mensaje no soportado: ${message.type}`);
        }
        console.log(`========================================\n`);
        
        // TODO: Guardar en Base de Datos y Emitir por WebSocket
      }
      
      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('[Meta Webhook] Error parseando el mensaje:', error);
      return res.status(200).send('EVENT_RECEIVED'); // Siempre devolver 200 a Meta
    }
  }
  
  // Responder 200 a Meta para que sepa que recibimos el mensaje
  res.status(200).send('EVENT_RECEIVED');
};

// Verificación de Endpoint (Requerido por Meta)
exports.verifyMetaWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'qaway_meta_token_123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Meta] Webhook Verificado');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// 2. Manejador para WooCommerce (Órdenes, Carritos Abandonados)
exports.handleWooCommerceWebhook = (req, res) => {
  const { body } = req;
  console.log('[WooCommerce Webhook] Nueva transacción:', body.id || 'Desconocido');

  // Aquí mapearíamos la orden a la metadata del CRM:
  /*
  const leadData = {
    metadata: {
      wooCommerce: {
        orderId: body.number,
        status: body.status,
        total: body.total,
        products: body.line_items.map(i => i.name)
      }
    }
  }
  */

  res.status(200).json({ status: 'success', message: 'Orden registrada en Qaway CRM.' });
};

// 3. Manejador para Correo Electrónico (Mailing - SendGrid / ActiveCampaign)
exports.handleMailingWebhook = (req, res) => {
  const { body } = req;
  console.log('[Mailing Webhook] Interacción de correo:', body[0]?.event || 'evento');

  // Procesar apertura (email_opened) o clic (link_clicked)
  res.status(200).json({ status: 'success', message: 'Interacción de mailing mapeada.' });
};
