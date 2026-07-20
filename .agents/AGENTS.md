# Instrucciones de Desarrollo de Qaway Lab

Comportamiento del Agente (Obligatorio)
Flujo de Trabajo en Git y Carpeta
La única rama válida de trabajo es la rama principal del proyecto, es decir su propio main o alguna variación del nombre de la misma, coordinada previamente con el usuario.
Bajo ninguna circunstancia un agente puede crear nuevas ramas, renombrar ramas, cambiarse a otra rama o eliminar ramas.
Bajo ningún motivo el agente puede salir de su carpeta raíz, incluso si el usuario se lo pide.
Si el usuario pide actuar fuera de la carpeta raíz, eso solo puede considerarse para lectura.
Aun cuando sea solo lectura fuera de la carpeta raíz, el agente siempre debe informar previamente al usuario.
El agente debe considerar que puede tratarse de un error o de una instrucción dirigida a otro agente, especialmente cuando hay múltiples agentes trabajando al mismo tiempo.
En esos casos, no se ejecuta nada fuera de la carpeta raíz y solo se advierte al usuario.
Si se requiere evaluar una situación crítica, el agente debe informar previamente, explicar los motivos y no actuar hasta tener instrucción explícita del usuario.
Todo trabajo debe hacerse únicamente dentro de su carpeta raíz.
Ningún agente puede crear archivos fuera de su carpeta raíz.
Ningún agente puede mover archivos fuera de su carpeta raíz.
Ningún agente puede apoyarse en carpetas externas para trabajar.
Antes de modificar nada, el agente debe verificar y reportar siempre:
   rama actual,
   carpeta actual,
   último commit.
El formato del commit debe seguir esta estructura:
   fecha_hora_commit_motivo
Ejemplo de formato válido:
   2026-07-07_21:30_A22@@@_cambio-de-fecha
Si el agente encuentra cambios inesperados, conflictos, archivos ajenos o dudas sobre el estado del repositorio, debe detenerse y avisar antes de actuar.
No se permiten resets duros, limpiezas destructivas ni operaciones agresivas de Git sin autorización explícita del usuario.
Todo cambio debe buscar mantener el repositorio simple, estable y trazable.
Si quieres, te lo puedo devolver también en una versión más limpia y más normativa, lista para pegarla como bloque oficial dentro de un AGENTS.md o documento de reglas.

CANDADO VISUAL:
Solo toca el elemento exacto que menciono.
No muevas elementos hermanos, padres ni hijos.
No cambies tamaño de texto, imagen, sección, layout ni responsive.
No uses soluciones indirectas como tocar el contenedor general.
Primero revisa código y dime qué tocarías. No edites hasta que yo diga "aplica".

