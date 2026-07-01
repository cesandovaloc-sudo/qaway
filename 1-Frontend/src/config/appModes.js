/**
 * ========================================================
 * MODOS DE DISTRIBUCIÓN COMERCIAL (MODELOS DE NEGOCIO)
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export const APP_MODES = {
  SAAS: {
    id: 'saas',
    name: 'SaaS (Consola en Web Qaway)',
    description: 'La aplicación corre de forma centralizada en la plataforma Qaway Lab. Soporta planes de suscripción y pasarelas de pago.',
    features: {
      userApiKeys: true,         // Permite al usuario usar sus propias API keys
      platformApiKeys: true,     // Soporta consumo de créditos/keys de la plataforma (Plan Enterprise/Premium)
      customBranding: false,     // Mantiene la marca unificada de Qaway Lab
      localExecution: false,     // Requiere servidores en la nube
      multiTenant: true          // Base de datos de múltiples inquilinos
    },
    integrations: {
      wooCommerce: true,         // Preparado para WooCommerce
      stripe: true               // Listo para Stripe Checkout
    }
  },
  LOCAL: {
    id: 'local',
    name: 'Versión Local PC (Desktop/Ollama)',
    description: 'Empaquetado offline u online para ser ejecutado directamente en la máquina del cliente.',
    features: {
      userApiKeys: true,
      platformApiKeys: false,
      customBranding: false,
      localExecution: true,      // Habilita Ollama/servidores locales
      multiTenant: false
    },
    integrations: {
      localStorage: true,        // Almacenamiento local directo
      offlineFallback: true      // Funciona 100% offline si usa Ollama
    }
  },
  WHITE_LABEL: {
    id: 'white_label',
    name: 'White-Label (Instalable e Independiente)',
    description: 'Instalación autónoma en el servidor del cliente final. Permite marca blanca, colores personalizados y dominio independiente.',
    features: {
      userApiKeys: true,
      platformApiKeys: false,
      customBranding: true,      // Permite marca y logotipo personalizados del cliente
      localExecution: false,
      multiTenant: false
    },
    brandingDefaults: {
      clientName: 'Consola Estratégica',
      primaryColor: '#FFD200',   // Por defecto el amarillo Qaway, modificable por instalación
      logoUrl: '',
      domainWhitelist: []
    }
  }
}
