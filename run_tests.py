"""
Ejecutor de Pruebas Unitarias para el Proyecto XP.
Descubre y ejecuta todos los archivos de prueba '.py_test' en la carpeta Unitest.
"""

import sys
import os
import time
import unittest
import importlib.util
from importlib.machinery import SourceFileLoader


def cargar_modulo_desde_archivo(ruta_archivo: str):
    """Carga un archivo .py o .py_test dinámicamente como módulo de Python."""
    nombre_modulo = os.path.basename(ruta_archivo).replace(".", "_")
    loader = SourceFileLoader(nombre_modulo, ruta_archivo)
    spec = importlib.util.spec_from_loader(nombre_modulo, loader)
    if spec is None or spec.loader is None:
        raise ImportError(f"No se pudo crear spec para: {ruta_archivo}")
    modulo = importlib.util.module_from_spec(spec)
    sys.modules[nombre_modulo] = modulo
    spec.loader.exec_module(modulo)
    return modulo


def ejecutar_pruebas():
    # Configurar salida segura para Windows si es necesario
    if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    base_dir = os.path.abspath(os.path.dirname(__file__))
    unitest_dir = os.path.join(base_dir, "Unitest")

    # Asegurar que el directorio base esté en sys.path
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)

    print("=" * 70)
    print(" SUITE DE PRUEBAS UNITARIAS XP (TDD) - CARRITO DE COMPRAS")
    print("=" * 70)

    # Identificar archivos a ejecutar
    archivos_prueba = []
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            ruta = os.path.abspath(arg) if os.path.isabs(arg) else os.path.join(base_dir, arg)
            if os.path.exists(ruta):
                archivos_prueba.append(ruta)
            else:
                print(f"[!] Archivo no encontrado: {arg}")
    else:
        if os.path.exists(unitest_dir):
            for archivo in sorted(os.listdir(unitest_dir)):
                if archivo.endswith(".py_test") or archivo.endswith("_test.py") or archivo.startswith("test_"):
                    archivos_prueba.append(os.path.join(unitest_dir, archivo))

    if not archivos_prueba:
        print("[X] No se encontraron archivos de prueba (.py_test) en Unitest/.")
        sys.exit(1)

    print(f"[*] Archivos de prueba encontrados: {len(archivos_prueba)}")
    for ap in archivos_prueba:
        print(f"  - {os.path.relpath(ap, base_dir)}")
    print("-" * 70)

    suite_total = unittest.TestSuite()
    loader = unittest.TestLoader()

    for ruta_archivo in archivos_prueba:
        try:
            modulo = cargar_modulo_desde_archivo(ruta_archivo)
            suite = loader.loadTestsFromModule(modulo)
            suite_total.addTests(suite)
        except Exception as e:
            print(f"[X] Error al cargar {ruta_archivo}: {e}")
            sys.exit(1)

    start_time = time.time()
    runner = unittest.TextTestRunner(verbosity=2)
    resultado = runner.run(suite_total)
    elapsed_time = time.time() - start_time

    print("=" * 70)
    total_tests = resultado.testsRun
    fallos = len(resultado.failures)
    errores = len(resultado.errors)
    exitosos = total_tests - fallos - errores

    print(f" RESUMEN DE EJECUCION (TDD):")
    print(f"  * Total de pruebas ejecutadas: {total_tests}")
    print(f"  * Pruebas exitosas:            {exitosos} [PASS]")
    print(f"  * Fallos:                      {fallos} {'[FAIL]' if fallos else ''}")
    print(f"  * Errores:                     {errores} {'[ERROR]' if errores else ''}")
    print(f"  * Tiempo de ejecucion:         {elapsed_time:.3f} segundos")
    print("=" * 70)

    if resultado.wasSuccessful():
        print(">>> TODAS LAS PRUEBAS PASARON EXITOSAMENTE (XP Green State)")
        sys.exit(0)
    else:
        print(">>> SE ENCONTRARON FALLOS EN LA SUITE DE PRUEBAS.")
        sys.exit(1)


if __name__ == "__main__":
    ejecutar_pruebas()
