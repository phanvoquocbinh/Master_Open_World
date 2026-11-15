import http.server, functools, sys
ROOT = r"F:\Software\Self-Software\Master Dashboard Open World"
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a):
        pass
H.extensions_map['.js'] = 'text/javascript'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8785
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(H, directory=ROOT))
print('serving', PORT, flush=True)
srv.serve_forever()
