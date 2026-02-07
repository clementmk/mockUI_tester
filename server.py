import http.server
import socketserver
import os
import sys
import threading

# Configuration
DASHBOARD_PORT = 8001
DASHBOARD_DIR = "frontend"

BUGGY_UI_PORT = 8002
BUGGY_UI_DIR = "."  # mokeBuggyUI.html is in the project root


def make_handler(directory, default_file=None):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)

        def do_GET(self):
            if default_file and self.path == '/':
                self.path = '/' + default_file
            super().do_GET()

        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('X-Content-Type-Options', 'nosniff')
            super().end_headers()

        def guess_type(self, path):
            mimetype = super().guess_type(path)
            if path.endswith('.js'):
                return 'application/javascript'
            return mimetype

    return Handler


def start_server(port, directory, label, default_file=None):
    handler = make_handler(directory, default_file)
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"  {label}: http://localhost:{port}  (serving {directory}/)")
        httpd.serve_forever()


def main():
    # Validate directories/files
    if not os.path.exists(DASHBOARD_DIR):
        print(f"Error: '{DASHBOARD_DIR}' directory not found!")
        sys.exit(1)
    if not os.path.exists("mokeBuggyUI.html"):
        print(f"Error: 'mokeBuggyUI.html' not found in project root!")
        sys.exit(1)

    print("=" * 60)
    print("Autonomous Mystery Shopper - Dual Server")
    print("=" * 60)

    try:
        # Start buggy UI server in a background thread
        buggy_thread = threading.Thread(
            target=start_server,
            args=(BUGGY_UI_PORT, BUGGY_UI_DIR, "Buggy UI", "mokeBuggyUI.html"),
            daemon=True,
        )
        buggy_thread.start()

        # Start dashboard server on the main thread
        start_server(DASHBOARD_PORT, DASHBOARD_DIR, "Dashboard")

    except KeyboardInterrupt:
        print("\n\nServers stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno in (48, 10048):
            print(f"Error: A port is already in use!")
            print(f"   Make sure ports {DASHBOARD_PORT} and {BUGGY_UI_PORT} are free.")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
