import http.server
import socketserver
import os
import sys

# Configuration
PORT = 8001
DIRECTORY = "frontend"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Enable CORS for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Ensure proper MIME types for JS modules
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
    
    def guess_type(self, path):
        # Ensure JS files are served with correct MIME type
        mimetype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript'
        return mimetype

def main():
    # Check if frontend directory exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ Error: '{DIRECTORY}' directory not found!")
        print(f"   Make sure you're running this from the project root directory.")
        sys.exit(1)
    
    # Create the server
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("=" * 60)
            print("Autonomous Mystery Shopper Dashboard")
            print("=" * 60)
            print(f"Server running at: http://localhost:{PORT}")
            print(f"Serving directory: {DIRECTORY}/")
            print(f"Open your browser to: http://localhost:{PORT}")
            print()
            print("Press Ctrl+C to stop the server")
            print("=" * 60)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n Server stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48 or e.errno == 10048:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use!")
            print(f"   Try using a different port or stop the other server.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
