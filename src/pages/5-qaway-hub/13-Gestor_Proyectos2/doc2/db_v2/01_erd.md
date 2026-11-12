# ERD — Gestor de Proyectos 2 (esquema `gp_*` v2)

> Diagrama lógico de entidades, relaciones y cardinalidades. Convención: sin sufijo = principal/operativa, `_c` = catálogo, `_r` = relacional. Tipos EDT canónicos se mantienen centralizados en código (no catálogo `_c`).

```mermaid
erDiagram
  %% Plataforma (externa, no duplicada)
  TENANTS_EXT["public.tenants (plataforma)"] {
    uuid id PK
  }
  AUTH_USERS_EXT["auth.users (plataforma)"] {
    uuid id PK
  }

  %% Catálogos _c
  gp_estados_proyecto_c { uuid id PK; text codigo UK }
  gp_tipos_proyecto_c { uuid id PK; text codigo UK }
  gp_estados_tarea_c { uuid id PK; text codigo UK }
  gp_prioridades_c { uuid id PK; text codigo UK }
  gp_roles_empresa_c { uuid id PK; text codigo UK }
  gp_roles_proyecto_c { uuid id PK; text codigo UK }
  gp_tipos_dependencia_c { uuid id PK; text codigo UK }
  gp_tipos_entregable_c { uuid id PK; text codigo UK }
  gp_estados_entregable_c { uuid id PK; text codigo UK }
  gp_tipos_reunion_c { uuid id PK; text codigo UK }
  gp_estados_reunion_c { uuid id PK; text codigo UK }
  gp_tipos_unidad_territorial_c { uuid id PK; text codigo UK }
  gp_tipos_avance_c { uuid id PK; text codigo UK }
  gp_tipos_archivo_c { uuid id PK; text codigo UK }

  %% Principales / operativas
  gp_proyectos {
    uuid id PK
    uuid empresa_id FK
    text codigo_proyecto UK_empresa
    text estado_codigo FK
  }
  gp_personas {
    uuid id PK
    uuid empresa_id
    text nombre_completo
  }
  gp_fases {
    uuid id PK
    uuid proyecto_id FK
    uuid empresa_id
    int orden
  }
  gp_nodos_edt {
    uuid id PK
    uuid proyecto_id FK
    uuid empresa_id
    uuid nodo_padre_id FK_self
    uuid fase_id FK
    text wbs_code UK_proyecto
    bool is_entregable
    text kind
  }
  gp_tareas {
    uuid id PK
    uuid proyecto_id FK
    uuid nodo_edt_id FK
    uuid fase_id FK
    uuid tarea_padre_id FK_self
  }
  gp_equipos { uuid id PK; uuid empresa_id; uuid proyecto_id FK }
  gp_unidades_territoriales { uuid id PK; uuid unidad_padre_id FK_self; text codigo UK }
  gp_sedes { uuid id PK; uuid unidad_territorial_id FK }
  gp_entregables { uuid id PK; uuid proyecto_id FK; uuid nodo_edt_id FK; uuid tarea_id FK }
  gp_lineas_base { uuid id PK; uuid proyecto_id FK }
  gp_linea_base_nodos { uuid id PK; uuid linea_base_id FK; uuid nodo_edt_id FK }
  gp_avances { uuid id PK; uuid proyecto_id FK; uuid nodo_edt_id FK; uuid tarea_id FK }
  gp_archivos { uuid id PK; uuid proyecto_id FK; uuid nodo_edt_id FK; uuid tarea_id FK; uuid entregable_id FK; uuid reunion_id FK }
  gp_reuniones { uuid id PK; uuid proyecto_id FK; uuid nodo_edt_id FK; uuid fase_id FK }
  gp_eventos_auditoria { uuid id PK; uuid empresa_id; uuid proyecto_id; text entidad; uuid entidad_id }
  gp_corridas_migracion { uuid id PK; text corrida_key UK }

  %% Relaciones _r
  gp_persona_cuentas_r { uuid id PK; uuid persona_id FK; uuid user_id FK_auth }
  gp_empresa_miembros_r { uuid id PK; uuid empresa_id FK_tenant; uuid persona_id FK; uuid user_id; text rol_empresa_codigo FK }
  gp_proyecto_miembros_r { uuid id PK; uuid proyecto_id FK; uuid persona_id FK; text rol_proyecto_codigo FK }
  gp_equipo_miembros_r { uuid id PK; uuid equipo_id FK; uuid persona_id FK }
  gp_edt_responsables_r { uuid id PK; uuid proyecto_id FK; uuid nodo_edt_id FK; uuid persona_id FK }
  gp_tarea_responsables_r { uuid id PK; uuid proyecto_id FK; uuid tarea_id FK; uuid persona_id FK }
  gp_nodo_dependencias_r { uuid id PK; uuid proyecto_id FK; uuid predecesor_nodo_id FK; uuid sucesor_nodo_id FK; text tipo_codigo FK }
  gp_tarea_dependencias_r { uuid id PK; uuid proyecto_id FK; uuid predecesora_tarea_id FK; uuid sucesora_tarea_id FK; text tipo_codigo FK }
  gp_reunion_participantes_r { uuid id PK; uuid reunion_id FK; uuid persona_id FK }
  gp_proyecto_unidades_r { uuid id PK; uuid proyecto_id FK; uuid unidad_territorial_id FK; uuid sede_id FK }

  %% Relaciones principales
  TENANTS_EXT ||--o{ gp_proyectos : "empresa_id (tenant)"
  TENANTS_EXT ||--o{ gp_empresa_miembros_r : "empresa_id"
  AUTH_USERS_EXT ||--o{ gp_persona_cuentas_r : "user_id"

  gp_estados_proyecto_c ||--o{ gp_proyectos : estado_codigo
  gp_tipos_proyecto_c ||--o{ gp_proyectos : tipo_proyecto_codigo
  gp_proyectos ||--o{ gp_fases : contiene
  gp_proyectos ||--o{ gp_nodos_edt : contiene
  gp_proyectos ||--o{ gp_tareas : contiene
  gp_proyectos ||--o{ gp_equipos : agrupa
  gp_proyectos ||--o{ gp_entregables : produce
  gp_proyectos ||--o{ gp_lineas_base : versiona
  gp_proyectos ||--o{ gp_reuniones : planifica
  gp_proyectos ||--o{ gp_avances : registra
  gp_proyectos ||--o{ gp_archivos : almacena_meta
  gp_proyectos ||--o{ gp_eventos_auditoria : audita

  gp_fases ||--o{ gp_nodos_edt : "fase_id (dimensión)"
  gp_fases ||--o{ gp_tareas : "fase_id (dimensión)"
  gp_fases ||--o{ gp_reuniones : contextualiza
  gp_nodos_edt ||--o{ gp_nodos_edt : "nodo_padre_id (jerarquía WBS)"
  gp_nodos_edt ||--o{ gp_tareas : desglosa
  gp_nodos_edt ||--o{ gp_entregables : genera
  gp_nodos_edt ||--o{ gp_avances : mide
  gp_nodos_edt ||--o{ gp_archivos : adjunta
  gp_nodos_edt ||--o{ gp_reuniones : referencia
  gp_tareas ||--o{ gp_tareas : tarea_padre_id
  gp_tareas ||--o{ gp_entregables : produce
  gp_tareas ||--o{ gp_avances : mide
  gp_tareas ||--o{ gp_archivos : adjunta

  gp_lineas_base ||--o{ gp_linea_base_nodos : congela
  gp_nodos_edt ||--o{ gp_linea_base_nodos : snapshot
  gp_entregables ||--o{ gp_archivos : evidencia
  gp_reuniones ||--o{ gp_archivos : acta_adjunto

  gp_personas ||--o{ gp_persona_cuentas_r : vincula
  gp_personas ||--o{ gp_empresa_miembros_r : miembro
  gp_personas ||--o{ gp_proyecto_miembros_r : participa
  gp_personas ||--o{ gp_equipo_miembros_r : integra
  gp_personas ||--o{ gp_edt_responsables_r : responsable
  gp_personas ||--o{ gp_tarea_responsables_r : asignado
  gp_personas ||--o{ gp_reunion_participantes_r : asiste
  gp_personas ||--o{ gp_avances : registra
  gp_personas ||--o{ gp_lineas_base : aprueba

  gp_equipos ||--o{ gp_equipo_miembros_r : compone
  gp_proyectos ||--o{ gp_proyecto_miembros_r : gobierna
  gp_roles_empresa_c ||--o{ gp_empresa_miembros_r : rol
  gp_roles_proyecto_c ||--o{ gp_proyecto_miembros_r : rol
  gp_nodos_edt ||--o{ gp_edt_responsables_r : asigna
  gp_tareas ||--o{ gp_tarea_responsables_r : asigna
  gp_nodos_edt ||--o{ gp_nodo_dependencias_r : predecesor
  gp_nodos_edt ||--o{ gp_nodo_dependencias_r : sucesor
  gp_tareas ||--o{ gp_tarea_dependencias_r : predecesora
  gp_tareas ||--o{ gp_tarea_dependencias_r : sucesora
  gp_tipos_dependencia_c ||--o{ gp_nodo_dependencias_r : tipo
  gp_tipos_dependencia_c ||--o{ gp_tarea_dependencias_r : tipo
  gp_reuniones ||--o{ gp_reunion_participantes_r : convoca

  gp_unidades_territoriales ||--o{ gp_unidades_territoriales : unidad_padre
  gp_unidades_territoriales ||--o{ gp_sedes : ubica
  gp_unidades_territoriales ||--o{ gp_proyecto_unidades_r : alcance
  gp_sedes ||--o{ gp_proyecto_unidades_r : alcance
  gp_proyectos ||--o{ gp_proyecto_unidades_r : cubre
  gp_tipos_unidad_territorial_c ||--o{ gp_unidades_territoriales : tipo
  gp_estados_tarea_c ||--o{ gp_tareas : estado
  gp_prioridades_c ||--o{ gp_tareas : prioridad
```

## Notas de cardinalidad y reglas

- **Empresa (tenant) 1:N** proyectos, personas, equipos, sedes, unidades, membresías; aislamiento por `empresa_id` + RLS.
- **Proyecto 1:N** fases, nodos EDT, tareas, entregables, líneas base, avances, archivos, reuniones.
- **Nodo EDT 1:N** nodos hijos (auto-relación WBS), tareas, entregables, avances, responsables; **N:M** dependencias vía `gp_nodo_dependencias_r`.
- **Tarea N:M** personas vía `gp_tarea_responsables_r`; **N:M** dependencias vía `gp_tarea_dependencias_r`.
- **Persona 1:N opcional** cuentas de plataforma vía `gp_persona_cuentas_r` (sin duplicar auth).
- **Fase** es dimensión independiente (1:N hacia nodos/tareas/reuniones), nunca tipo EDT.
- **Tipos EDT** (`COMPONENTE/PRODUCTO/ENTREGABLE/PAQUETE_TRABAJO/HITO`) son clasificación derivada por motor de dominio; BD almacena atributos fuente (`nodo_padre_id`, hijos, `is_entregable`, fechas/kind).
