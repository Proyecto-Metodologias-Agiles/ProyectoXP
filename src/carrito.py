"""
Módulo del Carrito de Compras para el Proyecto XP.
"""

from typing import Dict, List, Optional, Tuple, Any
from .producto import Producto
from .descuento import GestorDescuentos, Cupon


class ItemCarrito:
    """
    Representa una línea o ítem individual dentro del carrito de compras.
    """

    def __init__(self, producto: Producto, cantidad: int = 1) -> None:
        if not isinstance(producto, Producto):
            raise TypeError("El producto debe ser una instancia válida de Producto.")
        if not isinstance(cantidad, int) or cantidad <= 0:
            raise ValueError("La cantidad debe ser un entero mayor a cero.")
        if cantidad > producto.stock:
            raise ValueError(f"No hay suficiente stock para '{producto.nombre}'. Disponible: {producto.stock}")

        self.producto = producto
        self.cantidad = cantidad

    @property
    def subtotal(self) -> float:
        """Calcula el subtotal para esta línea (precio * cantidad)."""
        return round(self.producto.precio * self.cantidad, 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "producto": self.producto.to_dict(),
            "cantidad": self.cantidad,
            "subtotal": self.subtotal
        }

    def __repr__(self) -> str:
        return f"ItemCarrito(producto={self.producto.nombre}, cantidad={self.cantidad}, subtotal={self.subtotal})"


class Carrito:
    """
    Gestiona la colección de productos seleccionados, el cálculo de totales,
    aplicación de cupones de descuento e impuestos.
    """

    def __init__(self, tasa_impuesto: float = 0.16, gestor_descuentos: Optional[GestorDescuentos] = None) -> None:
        if tasa_impuesto < 0:
            raise ValueError("La tasa de impuesto no puede ser negativa.")

        self.tasa_impuesto = float(tasa_impuesto)
        self.gestor_descuentos = gestor_descuentos or GestorDescuentos()
        self._items: Dict[str, ItemCarrito] = {}
        self.cupon_aplicado: Optional[Cupon] = None

    @property
    def items(self) -> Dict[str, ItemCarrito]:
        return self._items

    def esta_vacio(self) -> bool:
        """Verifica si el carrito no tiene ningún producto."""
        return len(self._items) == 0

    def obtener_cantidad_total(self) -> int:
        """Retorna la suma total de unidades de productos en el carrito."""
        return sum(item.cantidad for item in self._items.values())

    def agregar_producto(self, producto: Producto, cantidad: int = 1) -> None:
        """
        Agrega un producto al carrito o incrementa su cantidad si ya existe.
        Verifica la disponibilidad de stock en todo momento.
        """
        if not isinstance(producto, Producto):
            raise TypeError("El parámetro producto debe ser una instancia de Producto.")

        if not isinstance(cantidad, int) or cantidad <= 0:
            raise ValueError("La cantidad a agregar debe ser un entero mayor a cero.")

        if producto.id in self._items:
            cantidad_actual = self._items[producto.id].cantidad
            cantidad_final = cantidad_actual + cantidad
            if cantidad_final > producto.stock:
                raise ValueError(
                    f"Stock insuficiente para '{producto.nombre}'. Stock disponible: {producto.stock}, ya en carrito: {cantidad_actual}, solicitado: {cantidad}"
                )
            self._items[producto.id].cantidad = cantidad_final
        else:
            if cantidad > producto.stock:
                raise ValueError(f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}, Solicitado: {cantidad}")
            self._items[producto.id] = ItemCarrito(producto, cantidad)

        self._revalidar_cupon()

    def remover_producto(self, id_producto: str) -> bool:
        """
        Elimina un producto del carrito por su ID.
        Retorna True si fue eliminado, False si no existía.
        """
        if not id_producto:
            return False

        id_limpio = str(id_producto).strip()
        if id_limpio in self._items:
            del self._items[id_limpio]
            self._revalidar_cupon()
            return True
        return False

    def modificar_cantidad(self, id_producto: str, nueva_cantidad: int) -> None:
        """
        Actualiza la cantidad de un producto. Si la cantidad es 0, se remueve.
        """
        if not id_producto:
            raise ValueError("ID de producto inválido.")

        id_limpio = str(id_producto).strip()
        if id_limpio not in self._items:
            raise KeyError(f"El producto con ID '{id_limpio}' no se encuentra en el carrito.")

        if not isinstance(nueva_cantidad, int) or nueva_cantidad < 0:
            raise ValueError("La nueva cantidad debe ser un entero mayor o igual a cero.")

        if nueva_cantidad == 0:
            self.remover_producto(id_limpio)
            return

        item = self._items[id_limpio]
        if nueva_cantidad > item.producto.stock:
            raise ValueError(
                f"No hay suficiente stock para '{item.producto.nombre}'. Stock disponible: {item.producto.stock}, Solicitado: {nueva_cantidad}"
            )

        item.cantidad = nueva_cantidad
        self._revalidar_cupon()

    def vaciar_carrito(self) -> None:
        """Remueve todos los productos del carrito y reinicia cupones aplicados."""
        self._items.clear()
        self.cupon_aplicado = None

    def aplicar_cupon(self, codigo_cupon: str) -> Tuple[bool, str]:
        """
        Aplica un cupón de descuento validándolo contra el subtotal actual.
        """
        if self.esta_vacio():
            return False, "No se puede aplicar un cupón a un carrito vacío."

        subtotal = self.calcular_subtotal()
        es_valido, mensaje, cupon = self.gestor_descuentos.validar_y_obtener(codigo_cupon, subtotal)

        if es_valido and cupon:
            self.cupon_aplicado = cupon
            return True, f"Cupón '{cupon.codigo}' aplicado con éxito ({cupon.descripcion})."
        else:
            return False, mensaje

    def remover_cupon(self) -> None:
        """Remueve el cupón de descuento activo."""
        self.cupon_aplicado = None

    def _revalidar_cupon(self) -> None:
        """Revalida el cupón actual cuando cambia el subtotal del carrito."""
        if not self.cupon_aplicado:
            return

        subtotal = self.calcular_subtotal()
        if subtotal <= 0:
            self.cupon_aplicado = None
            return

        es_aplicable, _ = self.cupon_aplicado.es_aplicable(subtotal)
        if not es_aplicable:
            # Si el nuevo subtotal ya no cumple los requisitos, se retira el cupón
            self.cupon_aplicado = None

    def calcular_subtotal(self) -> float:
        """Calcula el subtotal bruto sumando el subtotal de cada ítem."""
        subtotal = sum(item.subtotal for item in self._items.values())
        return round(subtotal, 2)

    def calcular_descuento(self) -> float:
        """Calcula el monto de descuento en dinero según el cupón activo."""
        if not self.cupon_aplicado or self.esta_vacio():
            return 0.0

        subtotal = self.calcular_subtotal()
        return self.cupon_aplicado.calcular_monto_descuento(subtotal)

    def calcular_base_imponible(self) -> float:
        """Calcula la base para impuestos (Subtotal - Descuento)."""
        subtotal = self.calcular_subtotal()
        descuento = self.calcular_descuento()
        return round(max(0.0, subtotal - descuento), 2)

    def calcular_impuesto(self, tasa: Optional[float] = None) -> float:
        """Calcula el monto de impuestos (IVA)."""
        tasa_uso = self.tasa_impuesto if tasa is None else tasa
        if tasa_uso < 0:
            raise ValueError("La tasa de impuesto no puede ser negativa.")
        base = self.calcular_base_imponible()
        return round(base * tasa_uso, 2)

    def calcular_total(self) -> float:
        """Calcula el total final a pagar (Base imponible + Impuestos)."""
        if self.esta_vacio():
            return 0.0
        base = self.calcular_base_imponible()
        impuesto = self.calcular_impuesto()
        return round(base + impuesto, 2)

    def obtener_resumen(self) -> Dict[str, Any]:
        """Retorna un resumen estructurado completo del estado del carrito."""
        subtotal = self.calcular_subtotal()
        descuento = self.calcular_descuento()
        base = self.calcular_base_imponible()
        impuesto = self.calcular_impuesto()
        total = self.calcular_total()

        return {
            "items": [item.to_dict() for item in self._items.values()],
            "cantidad_articulos": self.obtener_cantidad_total(),
            "subtotal": subtotal,
            "descuento": descuento,
            "cupon_aplicado": self.cupon_aplicado.to_dict() if self.cupon_aplicado else None,
            "base_imponible": base,
            "tasa_impuesto": self.tasa_impuesto,
            "impuesto": impuesto,
            "total": total,
            "esta_vacio": self.esta_vacio(),
        }
