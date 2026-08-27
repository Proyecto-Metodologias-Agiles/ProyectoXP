# Backlog de Historias de Usuario - Carrito de Compras (XP)

| ID | Historia de Usuario | Prioridad (Cliente) | Estimación (Story Points) | Iteración | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **HU-01** | Catálogo y visualización de productos | Alta | 3 SP | Iteración 1 | Completado |
| **HU-02** | Agregar productos al carrito con control de stock | Alta | 3 SP | Iteración 1 | Completado |
| **HU-03** | Modificar cantidades y eliminar productos individuales | Alta | 2 SP | Iteración 1 | Completado |
| **HU-04** | Cálculo dinámico de subtotal, IVA (16%) y total | Alta | 3 SP | Iteración 1 | Completado |
| **HU-05** | Vaciar el carrito de compras por completo | Media | 1 SP | Iteración 1 | Completado |
| **HU-06** | Aplicar cupones de descuento (porcentual y fijo) | Media | 5 SP | Iteración 2 | Completado |
| **HU-07** | Revalidación automática de cupones por monto mínimo | Media | 3 SP | Iteración 2 | Completado |
| **HU-08** | Finalización de compra (Checkout) y generación de recibo | Baja | 3 SP | Iteración 2 | Completado |

---

## Detalle de Historias y Criterios de Aceptación (TDD)

### HU-01: Catálogo y visualización de productos
* **Como** cliente de la tienda,
* **Quiero** ver la lista de productos disponibles con su nombre, categoría, precio y stock,
* **Para** poder elegir qué artículos comprar.
* **Criterios de Aceptación:**
  - El sistema muestra los productos con formato de moneda `$X.XX`.
  - Si el stock es 0, el botón de agregar se deshabilita y se marca como "Agotado".
  - Se puede filtrar por categoría y buscar por término clave.

---

### HU-02: Agregar productos al carrito con validación de stock
* **Como** comprador,
* **Quiero** hacer clic en "Agregar" en un producto,
* **Para** añadirlo a mi orden de compra.
* **Criterios de Aceptación:**
  - Si el producto ya está en el carrito, se incrementa su cantidad.
  - No es posible agregar más unidades que el stock disponible (`ValueError` en backend / alerta en UI).
  - El contador del carrito en la barra superior se actualiza en tiempo real.

---

### HU-03: Modificar cantidades y eliminar productos
* **Como** comprador,
* **Quiero** ajustar la cantidad de unidades o remover un producto del carrito,
* **Para** corregir mi selección antes de pagar.
* **Criterios de Aceptación:**
  - El botón `+` incrementa la cantidad (hasta el límite de stock).
  - El botón `-` disminuye la cantidad. Si la cantidad llega a 0, el producto se elimina.
  - El botón 🗑️ elimina el producto inmediatamente.

---

### HU-04: Cálculo dinámico de subtotal, IVA y total
* **Como** comprador,
* **Quiero** ver el desglose financiero exacto de mi compra,
* **Para** tener transparencia sobre los costos e impuestos.
* **Criterios de Aceptación:**
  - `Subtotal` = suma de (precio * cantidad) de cada ítem.
  - `Base Imponible` = Subtotal - Descuentos.
  - `IVA (16%)` = Base Imponible * 0.16.
  - `Total Final` = Base Imponible + IVA.
  - Todos los montos se redondean a 2 decimales.

---

### HU-05: Vaciar el carrito de compras
* **Como** comprador,
* **Quiero** vaciar todo el contenido del carrito con un solo botón,
* **Para** reiniciar mi compra rápidamente.
* **Criterios de Aceptación:**
  - Se solicita confirmación al usuario antes de vaciar.
  - Al vaciar, se limpian todos los ítems, cupones y los totales regresan a `$0.00`.

---

### HU-06: Aplicar cupones de descuento (Porcentuales y Fijos)
* **Como** comprador,
* **Quiero** ingresar un código promocional,
* **Para** obtener una rebaja en el subtotal de mi compra.
* **Criterios de Aceptación:**
  - Códigos válidos: `DESC10` (10%), `BIENVENIDA20` (20%), `SUPER50` ($50), `VERANO30` (30%).
  - Si el cupón no existe o está inactivo, muestra mensaje de error.
  - El descuento no puede exceder el monto del subtotal.

---

### HU-07: Revalidación automática de cupones por monto mínimo
* **Como** negocio,
* **Quiero** que los cupones solo apliquen si se cumple el monto mínimo de compra,
* **Para** evitar descuentos indebidos si el cliente reduce su carrito.
* **Criterios de Aceptación:**
  - Si el subtotal es menor al monto mínimo exigido (ej. $150 para `SUPER50`), el cupón es rechazado o removido automáticamente.

---

### HU-08: Checkout y emisión de comprobante de compra
* **Como** comprador,
* **Quiero** ingresar mis datos de envío y confirmar el pedido,
* **Para** completar mi compra y recibir un folio de orden.
* **Criterios de Aceptación:**
  - Validación de campos requeridos (nombre, email, dirección).
  - Generación de folio único (ej. `XP-XXXXXX`).
  - Reducción del stock de los productos adquiridos.
  - Reseteo del carrito tras la compra exitosa.
