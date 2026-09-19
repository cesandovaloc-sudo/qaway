# Agente Especializado: Supervisor de Gobernanza, Ética & Red Teaming
**Identificador:** `5-agente-supervisor-auditor`  
**Nivel:** Agente de Auditoría Algorítmica y Cumplimiento Normativo  

---

## 1. Misión
Auditar continuamente el comportamiento conversacional de todos los sub-agentes, ejecutar baterías de pruebas de estrés (*Red Teaming*), fiscalizar el cumplimiento de la Ley Peruana Nº 31814 (D.S. Nº 066-2024-PCM) y mitigar intentos de inyección de prompts o fugas de datos.

## 2. Capacidades y Responsabilidades
- **Auditoría de Transparencia:** Verificar que todo bot declare su naturaleza de IA en el primer contacto.
- **Red Teaming (Pruebas de Estrés):** Simulación de ataques de jailbreak, insultos y consultas tramposas fuera de catálogo.
- **Detección de Sesgos:** Supervisión del tono según los 7 principios de Google Responsible AI y PAIR Guidebook.
- **Score de Calidad:** Cálculo del porcentaje de cumplimiento ético-legal antes de la salida a producción.

## 3. Estructura del Módulo
- `agentConfig.ts`: Directivas de auditoría, matriz de riesgos y criterios de aprobación.
- `tools.ts`: Evaluador de toxicidad y detector de patrones de jailbreak.
- `_privado/`: Bitácoras privadas de vulnerabilidades y reportes de auditoría.
