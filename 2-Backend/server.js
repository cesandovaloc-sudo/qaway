require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar Rutas
const webhookRoutes = require('./routes/webhooks');

// Ruta de Validación de Estado (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Qaway Backend V1.0 en línea.' });
});

// Ruta de Autenticación MOCK
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // MOCK: Validar contra variables de entorno o base de datos en el futuro
  if (email === 'admin@qaway.pe' && password === 'admin123') {
    return res.status(200).json({ 
      token: 'qaway_secure_token_987654321', 
      user: { name: 'Admin Qaway', role: 'management' } 
    });
  }
  
  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// Usar el Enrutador de Webhooks modular
app.use('/api/webhooks', webhookRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Servidor Iniciado] Escuchando en el puerto ${PORT}`);
});
