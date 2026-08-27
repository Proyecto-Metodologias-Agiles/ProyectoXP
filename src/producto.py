"""
Módulo del modelo Producto para el Carrito de Compras XP.
"""

from typing import Dict, Any


class Producto:
    """
    Representa un producto dentro del catálogo del sistema.
    """

    def __init__(
        self,
        id_producto: str,
        nombre: str,
        precio: float,
        stock: int = 0,
        categoria: str = "General",
        descripcion: str = "",
        imagen: str = ""
    ) -> None:
        self._validar_datos(id_producto, nombre, precio, stock)
        
        self.id = str(id_producto).strip()
        self.nombre = str(nombre).strip()
        self.precio = float(precio)
        self.stock = int(stock)
        self.categoria = str(categoria).strip()
        self.descripcion = str(descripcion).strip()
        self.imagen = str(imagen).strip()

    def _validar_datos(self, id_producto: Any, nombre: Any, precio: Any, stock: Any) -> None:
        if not id_producto or not str(id_producto).strip():
            raise ValueError("El ID del producto no puede estar vacío.")

        if not nombre or not str(nombre).strip():
            raise ValueError("El nombre del producto no puede estar vacío.")

        try:
            val_precio = float(precio)
        except (ValueError, TypeError):
            raise ValueError("El precio del producto debe ser un número válido.")

        if val_precio <= 0:
            raise ValueError("El precio del producto debe ser mayor a 0.")

        try:
            val_stock = int(stock)
        except (ValueError, TypeError):
            raise ValueError("El stock del producto debe ser un número entero.")

        if val_stock < 0:
            raise ValueError("El stock del producto no puede ser negativo.")

    def tiene_stock_suficiente(self, cantidad: int) -> bool:
        """Verifica si existe suficiente stock para satisfacer la cantidad solicitada."""
        if cantidad <= 0:
            return False
        return self.stock >= cantidad

    def reducir_stock(self, cantidad: int) -> None:
        """Reduce la cantidad especificada del stock disponible."""
        if cantidad <= 0:
            raise ValueError("La cantidad a reducir debe ser mayor a cero.")
        if cantidad > self.stock:
            raise ValueError(f"Stock insuficiente para '{self.nombre}'. Disponible: {self.stock}, Solicitado: {cantidad}")
        self.stock -= cantidad

    def aumentar_stock(self, cantidad: int) -> None:
        """Incrementa el stock disponible con la cantidad especificada."""
        if cantidad <= 0:
            raise ValueError("La cantidad a aumentar debe ser mayor a cero.")
        self.stock += cantidad

    def to_dict(self) -> Dict[str, Any]:
        """Retorna una representación en diccionario del producto."""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": self.precio,
            "stock": self.stock,
            "categoria": self.categoria,
            "descripcion": self.descripcion,
            "imagen": self.imagen,
        }

    def __repr__(self) -> str:
        return f"Producto(id='{self.id}', nombre='{self.nombre}', precio={self.precio}, stock={self.stock})"

    def __eq__(self, otro: object) -> bool:
        if not isinstance(otro, Producto):
            return False
        return self.id == otro.id
