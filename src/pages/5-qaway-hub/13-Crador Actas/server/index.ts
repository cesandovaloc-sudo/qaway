import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { z } from 'zod';

const app = express();
app.use(express.json({ limit: '25mb' }));
const port = Number(process.env.PORT || 8787);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = z.object({ sourceText: z.string().min(1).max(250000), currentForm: z.record(z.string(), z.any()).optional() });

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) }));
app.post('/api/export-docx', async (req, res) => {
  const payload = req.body;
  if (!payload?.form || !Array.isArray(payload.evidence)) return res.status(400).json({ error: 'Faltan los datos del acta o las evidencias.' });
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const script = path.resolve(__dirname, 'generate_docx.py');
  const child = spawn(python, [script], { stdio: ['pipe', 'pipe', 'pipe'] });
  const output: Buffer[] = [];
  const errors: Buffer[] = [];
  child.stdout.on('data', chunk => output.push(Buffer.from(chunk)));
  child.stderr.on('data', chunk => errors.push(Buffer.from(chunk)));
  child.on('error', error => res.status(500).json({ error: `No se pudo iniciar Python. Instala Python y ejecuta pip install -r requirements.txt. ${error.message}` }));
  child.on('close', code => {
    if (res.headersSent) return;
    if (code !== 0) {
      const detail = Buffer.concat(errors).toString('utf8').slice(-1200);
      return res.status(500).json({ error: `No se pudo rellenar la plantilla Word original. Verifica Python y python-docx. ${detail}` });
    }
    try {
      const base64 = Buffer.concat(output).toString('utf8').trim();
      const file = Buffer.from(base64, 'base64');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="acta-institucional.docx"');
      return res.send(file);
    } catch {
      return res.status(500).json({ error: 'La salida de Word no pudo interpretarse.' });
    }
  });
  child.stdin.end(JSON.stringify(payload));
});
app.post('/api/generate-act', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'El insumo está vacío o excede el límite de tamaño.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'La API de IA no está configurada. Añade OPENAI_API_KEY al archivo .env para activar la redacción asistida.' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `Eres especialista en redacción de actas institucionales del sector educación peruano. Tu tarea es transformar una transcripción o resumen en datos para completar un acta. Escribe en español institucional natural, claro y humano, sin frases rimbombantes ni tono genérico de IA. Resume repeticiones, conserva el sentido y distingue temas conversados de compromisos confirmados. Nunca inventes fechas, nombres, participantes, responsables, acuerdos o plazos. Si un dato no consta, conserva el valor actual o déjalo vacío. No conviertas una propuesta, pregunta o posibilidad en acuerdo firme. Agrupa contenido para que sea legible y redacta acuerdos con acción verificable cuando la fuente lo sustente. Devuelve únicamente JSON con esta forma: {"form":{"date":"YYYY-MM-DD o vacío","startTime":"","endTime":"","activity":"Asistencia técnica|Monitoreo y seguimiento|Balance","modality":"Presencial|Virtual","scope":"Regional|Local","totalParticipants":"","dre":"","ugel":"","participants":"","agenda":["..."],"agreements":[{"text":"...","deadline":"..."}],"observations":"..."},"warnings":["datos que requieren confirmación"]}. No devuelvas campos distintos. La estructura del acta no se puede modificar; solo se adapta el contenido.` },
        { role: 'user', content: `DATOS ACTUALES DEL FORMULARIO (pueden contener campos vacíos):\n${JSON.stringify(parsed.data.currentForm || {})}\n\nINSUMO DE LA REUNIÓN:\n${parsed.data.sourceText}` },
      ],
    });
    const raw = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(raw);
    if (!result.form || typeof result.form !== 'object') throw new Error('La respuesta de IA no contiene un formulario válido.');
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado al generar el acta.';
    console.error('generate-act failed:', message);
    return res.status(500).json({ error: 'No se pudo generar el borrador con IA. Revisa la configuración de la API e inténtalo de nuevo.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(port, () => console.log(`Actas API disponible en http://localhost:${port}`));
