# Bitácora de Ajuste: Precio de Prueba Temporal y Métodos Yape (Inventi Pro)

## Fecha
2026-10-18

## Objetivo
1. Habilitar precio temporal de S/ 0.10 céntimos en el Plan Básico de Inventi Pro en Hub / Onboarding para pruebas en vivo de cobro y regularización de accesos sin impacto monetario elevado.
2. Mantener las 3 opciones de pago en Checkout sin romper diseño:
   - Opción 1: Tarjeta de crédito o débito (colapsada).
   - Opción 2: Yape (Maqueta Canva existente con temporizador y pasos).
   - Opción 3: Yape Directo BCP (Operativo probado: BCP Carlos Sandoval 930 323 632, ingreso de código de operación/aprobación y confirmación inmediata).
3. Resolver el bloqueo en `HubOnboardingPage` para que los métodos Yape activen de inmediato los accesos a la empresa en Supabase sin exigir `cardTokenId` de tarjeta.

## Archivos Modificados
1. `src/pages/5-qaway-hub/CanvaPlanSelector.jsx`:
   - `PLAN_CONFIGS[0].priceMonthly = 0.10` (Plan Básico, temporal para pruebas).
   - `formatPrice` para visualización limpia `S/ 0.10`.
   - Incorporación de la Opción 3 (Yape Directo BCP).
   - Botón CTA actualizado para validar y continuar con Yape Push o Yape Directo.
2. `src/pages/5-qaway-hub/HubOnboardingPage.jsx`:
   - Habilitación de activación directa de apps para métodos `yape` y `yape_directo`.
