# 📜 Registro de Prácticas Extreme Programming (XP)

## 1. Conformación del Equipo y Asignación de Roles

| Rol XP | Responsable(s) | Responsabilidades Clave Cumplidas |
| :--- | :--- | :--- |
| **Cliente** | Integrante A | Escribió y priorizó las Historias de Usuario (HU-01 a HU-08), definió los criterios de aceptación y validó las entregas. |
| **Coach** | Integrante B | Aseguró el apego estricto al ciclo TDD (Red-Green-Refactor), fomentó la integración frecuente y destrabó impedimentos técnicos. |
| **Tracker** | Integrante C | Registró las estimaciones en Story Points (SP), midió la velocidad del equipo y llevó la bitácora de rotación de parejas. |
| **Programadores** | Todo el Equipo | Programaron en parejas, diseñaron pruebas unitarias automáticas en `Unitest/` y mantuvieron el software siempre funcionando. |

---

## 2. Metáfora del Sistema
* **"La Canasta de Compras Inteligente"**: El carrito actúa como un contenedor activo que no solo almacena artículos, sino que inspecciona en tiempo real el inventario disponible, audita cupones válidos aplicables y recalcula de forma transparente la base gravable e impuestos con cada modificación.

---

## 3. Registro de Programación en Parejas (Pair Programming)

| Iteración | Pareja de Programadores | Historia / Tarea Abordada | Rol Conductor (Driver) | Rol Navegador (Navigator) |
| :---: | :--- | :--- | :--- | :--- |
| **Iteración 1** | Pareja 1 (Dev A + Dev B) | HU-01 & HU-02: Modelo `Producto`, validaciones de stock y pruebas unitarias `productos.py_test`. | Dev A | Dev B |
| **Iteración 1** | Pareja 2 (Dev C + Dev D) | HU-03, HU-04, HU-05: Modelo `Carrito`, gestión de ítems, cálculo de subtotal/IVA y `carrito.py_test`. | Dev C | Dev D |
| **Iteración 2** | Pareja 3 (Dev A + Dev C) | HU-06 & HU-07: Motor de cupones `Descuento`, validación de mínimos y `descuentos.py_test`. | Dev A | Dev C |
| **Iteración 2** | Pareja 4 (Dev B + Dev D) | HU-08 & Frontend: Interfaz visual responsiva (`index.html`, `styles.css`, `app.js`), Drawer y Checkout. | Dev B | Dev D |

---

## 4. Evidencia del Ciclo TDD (Test-Driven Development)

1. **Fase Roja (Red)**: Se escribieron primero las pruebas unitarias en `Unitest/*.py_test` definiendo los comportamientos esperados (ej. `test_agregar_producto_excede_stock`, `test_cupon_se_invalida_si_subtotal_baja_del_minimo`). Al ejecutarse inicialmente, las pruebas fallaron.
2. **Fase Verde (Green)**: Se escribió el código mínimo indispensable en `src/producto.py`, `src/carrito.py` y `src/descuento.py` hasta lograr que las 46 pruebas pasaran satisfactoriamente.
3. **Fase Refactorización (Refactor)**: Se mejoró la estructura del código eliminando redundancias, asegurando tipado estricto y desacoplando la gestión de descuentos sin alterar el resultado de las pruebas.

---

## 5. Ejemplo Concreto de Refactorización

* **Antes de la refactorización**:
  El cálculo de descuentos estaba embebido con múltiples `if/else` dentro de `Carrito`, hardcodeando porcentajes y sin validación de montos mínimos ni desacoplamiento.
* **Después de la refactorización**:
  Se creó la abstracción `Cupon` y `GestorDescuentos` con enumeración `TipoDescuento`. La clase `Carrito` delega el cálculo al gestor (`_revalidar_cupon()` y `calcular_descuento()`).
* **Verificación**: La suite completa de 46 pruebas en `Unitest/` continuó en **verde (PASS)** sin romper ninguna funcionalidad previa.

---

## 6. Acta de Retrospectiva Final

### ¿Qué funcionó muy bien?
- El desarrollo guiado por pruebas (TDD) evitó errores comunes en el cálculo de impuestos y en el manejo de límites de stock.
- La rotación de parejas permitió que todos los integrantes conocieran tanto la lógica de backend como la interfaz web.
- La ejecución rápida de pruebas en local con `python run_tests.py` dio certeza antes de cada commit.

### ¿Qué podríamos mejorar?
- En las primeras sesiones de estimación subestimamos la complejidad del manejo de mínimos en cupones dinámicos.
- Agregar pruebas E2E automatizadas para la interfaz gráfica del navegador.

### Principales Aprendizajes
- Las entregas pequeñas y frecuentes reducen la ansiedad de integración y permiten recibir feedback temprano del cliente.
- Mantener el diseño simple evita sobre-ingeniería innecesaria.
