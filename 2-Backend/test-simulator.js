

const BACKEND_URL = 'http://localhost:4000/api/webhooks/meta';

// Payload 1: Mensaje de Texto Normal de WhatsApp
const payloadTexto = {
  object: "whatsapp_business_account",
  entry: [{
    id: "WHATSAPP_ACCOUNT_ID",
    changes: [{
      value: {
        messaging_product: "whatsapp",
        metadata: {
          display_phone_number: "1234567890",
          phone_number_id: "PHONE_ID"
        },
        contacts: [{
          profile: { name: "Cliente Prueba" },
          wa_id: "51999999999"
        }],
        messages: [{
          from: "51999999999",
          id: "wamid.HBgL...",
          timestamp: "1700000000",
          text: { body: "Hola, quiero información sobre el CRM." },
          type: "text"
        }]
      },
      field: "messages"
    }]
  }]
};

// Payload 2: Cliente hizo clic en un botón interactivo
const payloadBoton = {
  object: "whatsapp_business_account",
  entry: [{
    id: "WHATSAPP_ACCOUNT_ID",
    changes: [{
      value: {
        messaging_product: "whatsapp",
        contacts: [{
          profile: { name: "Cliente Prueba" },
          wa_id: "51999999999"
        }],
        messages: [{
          from: "51999999999",
          id: "wamid.HBgL...",
          timestamp: "1700000005",
          type: "interactive",
          interactive: {
            type: "button_reply",
            button_reply: {
              id: "btn_comprar",
              title: "Comprar Ahora"
            }
          }
        }]
      },
      field: "messages"
    }]
  }]
};

async function enviarSimulacion(nombre, payload) {
  try {
    console.log(`\n[Simulador] Enviando prueba: ${nombre}...`);
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.text();
    console.log(`[Servidor Responde] Código: ${response.status} -> ${result}`);
  } catch (error) {
    console.error(`[Error] No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en el puerto 4000.`);
  }
}

// Ejecutar pruebas secuenciales
async function ejecutarPruebas() {
  await enviarSimulacion('Mensaje de Texto Básico', payloadTexto);
  await enviarSimulacion('Respuesta a Botón Interactivo', payloadBoton);
  console.log('\n[Simulador] Pruebas finalizadas.');
}

ejecutarPruebas();
