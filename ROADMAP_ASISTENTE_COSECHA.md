# Roadmap - Asistente Inteligente de Cosecha

Este documento define, paso por paso, las mejoras que vamos a sumar a la app de cosecha para convertirla en un asistente de decision para el productor.

La idea es avanzar por partes, sin romper lo que ya funciona, y dejar claro donde seguir trabajando cada vez que retomemos el proyecto.

## Estado actual

- La app ya calcula un escenario base de cosecha.
- Ya maneja clima, mapa, historial y precio de referencia.
- Ya tiene una logica funcional para:
  - produccion
  - ingreso bruto
  - costos de secada
  - costos de flete
  - ingreso neto
  - margen
  - alertas basicas
- Ya empezamos la Fase 1 con un panel de analisis temporal para comparar hoy con los proximos dias.

## Objetivo general

Convertir la calculadora actual en un asistente que pueda responder:

- Conviene cosechar hoy?
- Conviene esperar algunos dias?
- Que pasa con la humedad si espero?
- Que dias son mejores o peores para cosechar?

## Estructura de evolucion propuesta

### 1. Motor de decision temporal

Este sera el nucleo de la nueva logica.

Que hace:

- compara cosechar hoy vs cosechar en uno o mas dias futuros
- calcula rentabilidad esperada por fecha
- usa clima y humedad como variables que cambian con el tiempo
- genera una recomendacion base: hoy, esperar o revisar

Salida esperada:

- fecha analizada
- produccion estimada
- ingreso neto estimado
- margen estimado
- diferencia contra cosechar hoy
- nivel de riesgo

Resultado:

- tabla o lista por dia
- primer ranking de conveniencia

### 2. Modulo de humedad y mermas

Este modulo explicara que pasa cuando el productor espera antes de cosechar.

Que hace:

- estima la humedad del grano por dia
- calcula si la humedad sube, baja o se mantiene
- estima merma de peso/calidad si corresponde
- actualiza el costo de secada en funcion del dia elegido

Primer version simple:

- reglas por cultivo
- umbral de humedad base
- penalizacion por dia de espera
- castigo por secada cuando la humedad supera el objetivo

Resultado:

- humedad estimada por dia
- merma estimada por dia
- impacto economico por esperar

### 3. Calendario inteligente de cosecha

Este sera la capa visual que interpreta el motor temporal.

Que hace:

- muestra un calendario con dias recomendados
- marca dias para cosechar
- marca dias para pausar
- marca dias para continuar
- resalta ventanas mejores y peores

Estados sugeridos:

- `cosechar`
- `pausar`
- `continuar`
- `vigilar`

Resultado:

- calendario de decision facil de leer
- resumen visual para celular
- recomendacion operativa clara

## Orden de desarrollo recomendado

### Fase 1 - Base temporal

Primero vamos a construir el modelo que compare escenarios en el tiempo.

Por que primero:

- sin esta base no se puede saber si conviene esperar
- es el corazon logico de todo lo demas
- permite reutilizar la calculadora actual

### Fase 2 - Humedad y mermas

Despues agregamos la logica de humedad.

Por que despues:

- la humedad modifica el resultado dia a dia
- sirve para refinar la rentabilidad temporal

### Fase 3 - Calendario inteligente

Por ultimo armamos la visualizacion del calendario.

Por que al final:

- depende de los calculos anteriores
- transforma la analitica en una decision simple para el usuario

## Como deberia organizarse el codigo

### Capa 1: calculos puros

Funciones que solo reciban datos y devuelvan resultados.

Ejemplos:

- calcular escenario base
- estimar humedad futura
- calcular merma
- comparar escenarios por dia

### Capa 2: orquestacion

Funciones que armen el flujo completo.

Ejemplos:

- comparar hoy vs proximos dias
- generar ranking de dias
- preparar datos para el calendario

### Capa 3: interfaz

La parte visual solo mostrara lo que devuelven los calculos.

Ejemplos:

- tarjetas de recomendacion
- alerta por dia
- calendario inteligente
- resumen ejecutivo

## Decisiones de diseño que conviene mantener

- No reescribir toda la app de golpe.
- Reutilizar la logica actual de calculo como base.
- Mantener la experiencia simple para celular.
- Mostrar recomendaciones entendibles, no tecnicas.
- Priorizar claridad antes que complejidad.

## Criterio de exito

Vamos a considerar que esta evolucion va bien si la app puede:

- decir si conviene cosechar hoy o esperar
- estimar el impacto de la humedad por dia
- mostrar un calendario operativo facil de leer
- mantener el calculo economico actual sin romperlo

## Proximo paso sugerido

Empezar por la **Fase 1: Base temporal**.

Eso significa definir:

- que datos necesita el motor temporal
- que salida va a devolver
- como va a comparar hoy contra dias futuros

---

Nota para seguir mas adelante:

- este archivo sera el punto de referencia para continuar la expansion de la app
- cuando retomemos, empezamos desde la Fase 1
