"""
Módulo de Descuentos y Cupones para el Carrito de Compras XP.
"""

from enum import Enum
from typing import Dict, Optional, Tuple, List, Any


class TipoDescuento(Enum):
    PORCENTUAL = "PORCENTUAL"
    MONTO_FIJO = "MONTO_FIJO"


class Cupon:
    """
    Representa un cupón de descuento aplicable al carrito de compras.
    """

    def __init__(
        self,
        codigo: str,
        tipo: TipoDescuento,
        valor: float,
        monto_minimo: float = 0.0,
        descripcion: str = "",
        activo: bool = True
    ) -> None:
        self._validar_cupon(codigo, tipo, valor, monto_minimo)
        self.codigo = str(codigo).strip().upper()
        self.tipo = tipo
        self.valor = float(valor)
        self.monto_minimo = float(monto_minimo)
        self.descripcion = str(descripcion).strip()
        self.activo = bool(activo)

    def _validar_cupon(self, codigo: Any, tipo: Any, valor: Any, monto_minimo: Any) -> None:
        if not codigo or not str(codigo).strip():
            raise ValueError("El código del cupón no puede estar vacío.")

        if not isinstance(tipo, TipoDescuento):
            raise ValueError("El tipo de descuento debe ser una instancia de TipoDescuento.")

        try:
            val_valor = float(valor)
        except (ValueError, TypeError):
            raise ValueError("El valor del descuento debe ser numérico.")

        if val_valor <= 0:
            raise ValueError("El valor del descuento debe ser mayor a 0.")

        if tipo == TipoDescuento.PORCENTUAL and val_valor > 100:
            raise ValueError("Un descuento porcentual no puede exceder el 100%.")

        try:
            val_minimo = float(monto_minimo)
        except (ValueError, TypeError):
            raise ValueError("El monto mínimo debe ser numérico.")

        if val_minimo < 0:
            raise ValueError("El monto mínimo no puede ser negativo.")

    def es_aplicable(self, subtotal: float) -> Tuple[bool, str]:
        """Verifica si el cupón puede aplicarse dado un subtotal."""
        if not self.activo:
            return False, "El cupón se encuentra inactivo o vencido."
        if subtotal < self.monto_minimo:
            return False, f"El cupón requiere una compra mínima de ${self.monto_minimo:.2f}."
        return True, "Cupón aplicable."

    def calcular_monto_descuento(self, subtotal: float) -> float:
        """Calcula el valor en dinero a descontar sobre el subtotal."""
        if subtotal <= 0:
            return 0.0

        aplicable, _ = self.es_aplicable(subtotal)
        if not aplicable:
            return 0.0

        if self.tipo == TipoDescuento.PORCENTUAL:
            descuento = subtotal * (self.valor / 100.0)
        else:
            descuento = self.valor

        # El descuento no puede ser mayor que el subtotal mismo
        return round(min(descuento, subtotal), 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "codigo": self.codigo,
            "tipo": self.tipo.value,
            "valor": self.valor,
            "monto_minimo": self.monto_minimo,
            "descripcion": self.descripcion,
            "activo": self.activo
        }

    def __repr__(self) -> str:
        return f"Cupon(codigo='{self.codigo}', tipo={self.tipo.name}, valor={self.valor}, min={self.monto_minimo})"


class GestorDescuentos:
    """
    Administra la colección de cupones y la aplicación de reglas de descuento.
    """

    def __init__(self) -> None:
        self._cupones: Dict[str, Cupon] = {}
        self._cargar_cupones_predeterminados()

    def _cargar_cupones_predeterminados(self) -> None:
        cupones_iniciales = [
            Cupon("DESC10", TipoDescuento.PORCENTUAL, 10.0, monto_minimo=0.0, descripcion="10% de descuento directo en cualquier compra"),
            Cupon("BIENVENIDA20", TipoDescuento.PORCENTUAL, 20.0, monto_minimo=200.0, descripcion="20% de descuento en compras mayores a $200"),
            Cupon("SUPER50", TipoDescuento.MONTO_FIJO, 50.0, monto_minimo=150.0, descripcion="$50 de descuento directo en compras desde $150"),
            Cupon("DESCUENTOFACIL", TipoDescuento.PORCENTUAL, 15.0, monto_minimo=100.0, descripcion="15% de descuento a partir de $100"),
            Cupon("VERANO30", TipoDescuento.PORCENTUAL, 30.0, monto_minimo=300.0, descripcion="30% de descuento en compras de $300 o más"),
            Cupon("CUPON_INACTIVO", TipoDescuento.PORCENTUAL, 50.0, monto_minimo=0.0, descripcion="Cupón de prueba inactivo", activo=False),
        ]
        for c in cupones_iniciales:
            self.registrar_cupon(c)

    def registrar_cupon(self, cupon: Cupon) -> None:
        if not isinstance(cupon, Cupon):
            raise TypeError("Se esperaba un objeto de tipo Cupon.")
        self._cupones[cupon.codigo.upper()] = cupon

    def obtener_cupon(self, codigo: str) -> Optional[Cupon]:
        if not codigo:
            return None
        return self._cupones.get(codigo.strip().upper())

    def validar_y_obtener(self, codigo: str, subtotal: float) -> Tuple[bool, str, Optional[Cupon]]:
        """Valida si un código de cupón existe y es aplicable al subtotal."""
        if not codigo or not str(codigo).strip():
            return False, "Por favor ingrese un código de cupón.", None

        codigo_limpio = str(codigo).strip().upper()
        cupon = self.obtener_cupon(codigo_limpio)
        if not cupon:
            return False, f"El cupón '{codigo_limpio}' no existe.", None

        es_valido, motivo = cupon.es_aplicable(subtotal)
        if not es_valido:
            return False, motivo, None

        return True, "Cupón aplicado con éxito.", cupon

    def listar_cupones_disponibles(self) -> List[Dict[str, Any]]:
        """Retorna la lista de cupones activos disponibles para el cliente."""
        return [c.to_dict() for c in self._cupones.values() if c.activo]
