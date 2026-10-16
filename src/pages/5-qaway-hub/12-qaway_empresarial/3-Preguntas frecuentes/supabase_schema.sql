-- =============================================================
-- ESQUEMA SQL PARA SUPABASE - BANCO DE CASUÍSTICAS MINEDU
-- =============================================================
-- Ejecuta este script en el "SQL Editor" de tu proyecto de Supabase.

-- 1. CREACIÓN DE LA TABLA
create table if not exists public.casuisticas (
  id text primary key,
  direction_id text not null check (direction_id in ('DEI', 'DEP', 'DISER', 'DEBA', 'DEBE', 'DES')),
  number text not null,
  title text not null,
  criterio_title text not null,
  criterio_desc text not null,
  desarrollo text not null,
  accion text not null,
  solucion text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.casuisticas enable row level security;

-- 3. POLÍTICAS DE ACCESO PÚBLICO (Lectura y Gestión)
drop policy if exists "Permitir lectura publica" on public.casuisticas;
create policy "Permitir lectura publica" on public.casuisticas
  for select using (true);

drop policy if exists "Permitir insercion" on public.casuisticas;
create policy "Permitir insercion" on public.casuisticas
  for insert with check (true);

drop policy if exists "Permitir actualizacion" on public.casuisticas;
create policy "Permitir actualizacion" on public.casuisticas
  for update using (true);

drop policy if exists "Permitir eliminacion" on public.casuisticas;
create policy "Permitir eliminacion" on public.casuisticas
  for delete using (true);

-- 4. HABILITAR ACTUALIZACIONES EN TIEMPO REAL (REALTIME)
alter publication supabase_realtime add table public.casuisticas;

-- 5. ÍNDICES DE RENDIMIENTO PARA BÚSQUEDA Y FILTRO
create index if not exists idx_casuisticas_dir on public.casuisticas(direction_id);
create index if not exists idx_casuisticas_created on public.casuisticas(created_at desc);

-- 6. DATOS SEMILLA (12 CASUÍSTICAS OFICIALES)
insert into public.casuisticas (id, direction_id, number, title, criterio_title, criterio_desc, desarrollo, accion, solucion)
values
  -- DEI
  ('dei-01', 'DEI', '01', 
   'Material asignado que no corresponde a la característica del servicio', 
   'Pertinencia', 
   'El material debe corresponder a la característica del servicio educativo.', 
   'Se asignó material de inicial ciclo II a una IE que atiende ciclo I, generando inconsistencias con la población matriculada.', 
   'Verificar el nivel y ciclo de atención de la IE y solicitar el reajuste de materiales según corresponda.', 
   'Procede el reajuste con el material correspondiente al ciclo de atención registrado en el SIAGIE.'),

  ('dei-02', 'DEI', '02', 
   'Cantidad de materiales menor a la matrícula atendida', 
   'Suficiencia / Cobertura', 
   'La dotación debe cubrir el 100% de niños y niñas matriculados en el aula.', 
   'La IE recibió cuadernos de trabajo en una cantidad inferior a los estudiantes registrados en las nóminas vigentes del ciclo II.', 
   'Identificar la brecha en el acta de recepción y reportar el déficit al especialista de material educativo de la UGEL.', 
   'Redistribución de excedentes disponibles en el almacén de la UGEL o modulación entre II.EE. cercanas de la jurisdicción.'),

  -- DEP
  ('dep-01', 'DEP', '01', 
   'Cuadernos de trabajo entregados en grado distinto al solicitado', 
   'Concordancia de grado', 
   'El material distribuido debe coincidir con la matrícula por grado del nivel primaria.', 
   'Durante el monitoreo se detectaron paquetes de 4.° grado entregados en secciones multigrado que únicamente atienden de 1.° a 3.° grado.', 
   'Registrar la observación en el sistema de seguimiento y coordinar con el área de Abastecimiento de la UGEL el recojo y canje.', 
   'Reasignación inmediata mediante pecosa complementaria con cargo al stock de contingencia de la UGEL.'),

  ('dep-02', 'DEP', '02', 
   'Retraso en la recepción de bibliotecas de aula para el III ciclo', 
   'Oportunidad', 
   'Los materiales deben encontrarse en la IE antes del inicio o durante el primer bimestre escolar.', 
   'La ruta de transporte programada presentó incidencias climáticas, postergando la llegada de los módulos de lectura a 5 II.EE.', 
   'Reprogramar la ruta priorizada en coordinación con el transportista y notificar al director de la IE la nueva fecha de entrega.', 
   'Suscripción del acta de entrega reprogramada y actualización del estado de recepción en el módulo SIGA.'),

  ('dep-03', 'DEP', '03', 
   'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?', 
   'Pertinencia y suficiencia', 
   'En el marco del numeral 1.6 «Elaboración del Cuadro de Distribución Local en el MC SIGA», la dotación de materiales educativos debe responder a la característica de servicio validada en el padrón oficial.', 
   'La UGEL identifica una institución educativa que ha cambiado de característica o modalidad en su servicio (ej. multigrado a polidocente completo, o primaria regular a servicio rural/EIB). Se consulta qué dirección pedagógica (DEP o DISER) debe asumir la dotación y asignación de materiales educativos en el MC SIGA.', 
   'Verificar el reporte actualizado en SIAGIE y coordinar entre especialistas de DEP y DISER para validar la matrícula real y la nómina oficial antes de la emisión de la pecosa.', 
   'Corresponde a la dirección pedagógica que atiende la nueva característica validada en el padrón oficial MINEDU. La UGEL emite el informe técnico y efectúa la reasignación en el MC SIGA.'),

  -- DISER
  ('diser-01', 'DISER', '01', 
   'Material EIB asignado en lengua originaria distinta a la de la comunidad', 
   'Pertinencia lingüística', 
   'Los cuadernos EIB deben corresponder a la lengua originaria y variante registrada en el RNIIEE-EIB.', 
   'Una IE bilingüe de revitalización cultural recibió cuadernos en variante quechua chanka cuando su registro corresponde a quechua collao.', 
   'Contrastación con el padrón EIB vigente y comunicación inmediata con el especialista EIB de la UGEL.', 
   'Transferencia de material adecuado desde el lote de reserva regional y actualización de la caracterización lingüística.'),

  ('diser-02', 'DISER', '02', 
   'Fichas de autoaprendizaje incompletas para aulas multigrado monolingües', 
   'Integralidad del módulo', 
   'El kit rural multigrado requiere guías docentes y fichas para todas las edades agrupadas.', 
   'Se evidenció la llegada de fichas de Matemática sin sus respectivas guías metodológicas para el docente rural.', 
   'Facilitar temporalmente el repositorio digital oficial y gestionar el envío físico de los ejemplares faltantes.', 
   'Entrega complementaria en el siguiente tramo de distribución rural y descarga asistida de guías en tableta.'),

  ('diser-03', 'DISER', '03', 
   'Cambio de característica de una IE a servicio rural o EIB: asignación de materiales en MC SIGA', 
   'Pertinencia y suficiencia', 
   'En el marco del numeral 1.6 «Elaboración del Cuadro de Distribución Local en el MC SIGA», la dotación de materiales educativos debe responder a la característica de servicio validada en el padrón oficial.', 
   'La UGEL identifica una institución educativa que ha transitado a servicio educativo rural o EIB. Se consulta el procedimiento de asignación entre DEP y DISER en el MC SIGA.', 
   'Contrastar con el padrón RIE/RNIIEE-EIB y coordinar entre especialistas de DEP y DISER para conciliar la nómina oficial en SIAGIE.', 
   'Corresponde a DISER asumir la dotación de los materiales pertinentes a la nueva característica. La UGEL formaliza la reasignación en el MC SIGA según el numeral 1.6.'),

  -- DEBA
  ('deba-01', 'DEBA', '01', 
   'Portafolios y textos del ciclo avanzado sin entrega en periféricos del CEBA', 
   'Alcance de atención', 
   'El material debe llegar tanto a la sede central del CEBA como a sus aulas periféricas autorizadas.', 
   'El material permaneció almacenado en la sede central del CEBA sin distribuirse a los dos centros periféricos de turno nocturno.', 
   'Orientar al director del CEBA sobre el cronograma interno de reparto y verificar las actas de entrega a los docentes responsables.', 
   'Distribución interna validada mediante acta firmada por los coordinadores de aulas periféricas.'),

  ('deba-02', 'DEBA', '02', 
   'Variación de matrícula por periodos promocionales semestrales', 
   'Flexibilidad de dotación', 
   'La asignación debe prever la matrícula por periodos de atención propios de la modalidad EBA.', 
   'Incremento de estudiantes jóvenes y adultos en el segundo periodo promocional supera el stock inicial remitido.', 
   'Consolidar el reporte de matrícula actualizada en SIAGIE y solicitar dotación adicional a la UGEL.', 
   'Asignación de módulos disponibles en el stock de reserva de la modalidad EBA.'),

  -- DEBE
  ('debe-01', 'DEBE', '01', 
   'Material concreto adaptado pendiente de distribución a PRITE y CEBE', 
   'Accesibilidad y adaptación', 
   'Los recursos educativos deben responder a las necesidades educativas especiales asociadas a discapacidad.', 
   'Kits sensoriales y material en relieve llegaron al almacén de la UGEL pero no contaban con cuadro de distribución actualizado para el PRITE.', 
   'Elaborar el cuadro de distribución junto con el especialista de EBE según la nómina de atención temprana.', 
   'Emisión de pecosas específicas y entrega priorizada a los centros de Educación Básica Especial.'),

  ('debe-02', 'DEBE', '02', 
   'Requerimiento de textos en formato macrotipo o sistema Braille para II.EE. inclusivas', 
   'Inclusión educativa', 
   'Los estudiantes incluidos en EBR con baja visión o ceguera requieren formatos accesibles oportunos.', 
   'Se identificó a dos estudiantes con discapacidad visual matriculados en EBR que aún no cuentan con material adaptado a su condición.', 
   'Articular con el SAANEE y reportar el requerimiento nominal al equipo de materiales de la DRE/MINEDU.', 
   'Envío personalizado del paquete en sistema Braille y macrotipo a través del servicio de apoyo SAANEE.'),

  -- DES
  ('des-01', 'DES', '01', 
   'Desbalance de fichas de Matemática y Comunicación en 1.° y 2.° de secundaria', 
   'Proporcionalidad por sección', 
   'Cada estudiante de nivel secundaria debe contar con su ejemplar individual para el trabajo pedagógico.', 
   'Incremento de dos secciones adicionales en 1.° de secundaria generó un faltante de 60 ejemplares en la IE.', 
   'Verificar la resolución de ampliación de secciones y contrastar con el padrón de modulación de la UGEL.', 
   'Atención del déficit con el saldo de contingencia de la UGEL y registro en el aplicativo de monitoreo.'),

  ('des-02', 'DES', '02', 
   'Módulos de laboratorio de Ciencia y Tecnología sin recepción conforme en modelos JEC', 
   'Conformidad técnica', 
   'La recepción de equipamiento y material pedagógico requiere verificación de componentes completos.', 
   'El director de la IE JEC reportó cajas con precinto observado antes de la firma de la pecosa correspondiente.', 
   'Levantar acta de verificación conjunta entre el responsable de almacén de la IE y el representante de la UGEL.', 
   'Reposición de los insumos observados por parte del proveedor dentro del plazo de garantía contractual.')
on conflict (id) do nothing;
