"""
Servidor HTTP local para la interfaz web de XP Commerce.
Uso: python server.py [puerto] (por defecto 8000)
"""

import os
import sys
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler


class WebAppHandler(SimpleHTTPRequestHandler):
    """Maneja las peticiones estáticas sirviendo el contenido de la carpeta 'web'."""

    def __init__(self, *args, **kwargs):
        web_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
        super().__init__(*args, directory=web_dir, **kwargs)

    def log_message(self, format, *args):
        # Formato de log simplificado
        sys.stdout.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")


def iniciar_servidor(puerto: int = 8000, abrir_navegador: bool = False):
    host = "127.0.0.1"
    servidor = HTTPServer((host, puerto), WebAppHandler)
    url = f"http://{host}:{puerto}"

    print("=" * 65)
    print("  XP COMMERCE - SERVIDOR WEB LOCAL")
    print("=" * 65)
    print(f"  * Aplicacion disponible en: {url}")
    print(f"  * Presiona Ctrl + C para detener el servidor")
    print("=" * 65)

    if abrir_navegador:
        webbrowser.open(url)

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Servidor detenido por el usuario.")
    finally:
        servidor.server_close()


if __name__ == "__main__":
    puerto = 8000
    if len(sys.argv) > 1:
        try:
            puerto = int(sys.argv[1])
        except ValueError:
            print(f"[!] Puerto inválido '{sys.argv[1]}', usando puerto 8000.")

    abrir = "--open" in sys.argv or "-o" in sys.argv
    iniciar_servidor(puerto, abrir_navegador=abrir)
