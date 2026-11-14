# QC World – web server cục bộ (chỉ 127.0.0.1). Code (html/js/json) không cache để luôn chạy bản mới nhất; model/texture cache 1 ngày.
# Chạy bằng pythonw (không cửa sổ) thì sys.stdout/stderr = None → mọi chỗ ghi log phải được chặn, nếu không server trả trang rỗng.
# S19g – thêm 2 API nhỏ cho thiết bị trong game (chỉ trả lời trang game ở 127.0.0.1/localhost):
#   • /api/md/available   → {"available": true/false}: máy này có thư mục Master Dashboard cạnh thư mục game không (KHÔNG trả đường dẫn)
#   • /api/yt/search?q=…  → tìm bài trên trang tìm kiếm công khai của YouTube (không cần API key), có cache 30 phút; mất mạng → offline
#   Không đọc / gửi bất kỳ dữ liệu nào của Master Dashboard, không gửi gì của người dùng ngoài từ khoá tìm nhạc họ tự gõ.
import functools, http.server, json, os, re, sys, threading, time, urllib.parse, urllib.request

if sys.stdout is None or sys.stderr is None:      # pythonw: không có console
    _null = open(os.devnull, 'w')
    sys.stdout = sys.stdout or _null
    sys.stderr = sys.stderr or _null

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
ROOT = os.path.dirname(os.path.abspath(__file__))
NO_CACHE = ('.html', '.js', '.mjs', '.json', '.css', '/')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
HOST_OK = re.compile(r'^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$')

# ---------- Master Dashboard có trên máy không (chỉ kiểm tra thư mục + file đặc trưng, không đọc nội dung) ----------
def md_available():
    d = os.path.normpath(os.path.join(ROOT, '..', 'Master Dashboard'))
    try:
        return os.path.isdir(d) and os.path.isdir(os.path.join(d, 'app')) and os.path.isfile(os.path.join(d, 'MasterDashboard.vbs'))
    except OSError:
        return False

# ---------- tìm nhạc YouTube (trang kết quả công khai) ----------
_yt_cache, _yt_lock = {}, threading.Lock()

def _txt(o):
    if not isinstance(o, dict): return ''
    if 'simpleText' in o: return str(o['simpleText'])
    return ''.join(str(r.get('text', '')) for r in o.get('runs', []) if isinstance(r, dict))

def yt_search(q):
    url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(q) + '&sp=EgIQAQ%253D%253D'   # chỉ video
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8', 'Cookie': 'CONSENT=YES+cb; SOCS=CAI'})
    with urllib.request.urlopen(req, timeout=8) as r:
        html = r.read(4_000_000).decode('utf-8', 'replace')
    m = re.search(r'(?:var\s+ytInitialData|window\["ytInitialData"\])\s*=\s*(\{.+?\})\s*;\s*</script>', html, re.S)
    if not m: raise ValueError('không đọc được trang kết quả')
    data = json.loads(m.group(1))
    out, seen = [], set()
    stack = [data]
    while stack and len(out) < 20:
        o = stack.pop()
        if isinstance(o, dict):
            v = o.get('videoRenderer')
            if isinstance(v, dict) and v.get('videoId') and v['videoId'] not in seen:
                seen.add(v['videoId'])
                out.append({'id': v['videoId'], 'title': _txt(v.get('title'))[:140], 'channel': _txt(v.get('ownerText') or v.get('longBylineText'))[:60],
                            'len': _txt(v.get('lengthText'))[:12], 'views': _txt(v.get('shortViewCountText') or v.get('viewCountText'))[:30]})
                continue
            stack.extend(reversed(list(o.values())))
        elif isinstance(o, list):
            stack.extend(reversed(o))
    return out

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
                      '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.wasm': 'application/wasm'}
    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def _api(self):
        if not HOST_OK.match(self.headers.get('Host', '')):     # chặn trang lạ mượn tên miền trỏ về 127.0.0.1
            return self._json({'ok': False, 'error': 'host'}, 403)
        u = urllib.parse.urlsplit(self.path); qs = urllib.parse.parse_qs(u.query)
        if u.path == '/api/md/available':
            return self._json({'available': md_available()})
        if u.path == '/api/yt/search':
            q = (qs.get('q') or [''])[0].strip()[:100]
            if not q: return self._json({'ok': False, 'error': 'empty'}, 400)
            key = q.lower()
            with _yt_lock:
                hit = _yt_cache.get(key)
            if hit and time.time() - hit[0] < 1800:
                return self._json({'ok': True, 'items': hit[1], 'cached': True})
            try:
                items = yt_search(q)
            except (OSError, ValueError) as e:      # URLError / timeout / trang đổi cấu trúc
                if hit: return self._json({'ok': True, 'items': hit[1], 'cached': True, 'stale': True})
                return self._json({'ok': False, 'offline': isinstance(e, OSError), 'error': str(e)[:120]})
            with _yt_lock:
                if len(_yt_cache) > 120: _yt_cache.clear()
                _yt_cache[key] = (time.time(), items)
            return self._json({'ok': True, 'items': items})
        return self._json({'ok': False, 'error': 'not found'}, 404)
    def do_GET(self):
        if self.path == '/__qcworld':               # để launcher kiểm tra đúng server QC World đã sẵn sàng
            body = b'qcworld-ok'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path.startswith('/api/'):
            return self._api()
        super().do_GET()
    def end_headers(self):
        path = self.path.split('?', 1)[0].lower()
        if path.endswith(NO_CACHE) or path == '/__qcworld' or path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        else:
            self.send_header('Cache-Control', 'public, max-age=86400')
        super().end_headers()
    def log_message(self, *args):
        pass

class Server(http.server.ThreadingHTTPServer):
    allow_reuse_address = False   # không cho 2 server cùng chiếm 1 cổng
    daemon_threads = True
    def handle_error(self, request, client_address):
        pass                      # trình duyệt đóng kết nối giữa chừng → bỏ qua, không làm sập server

if __name__ == '__main__':
    try:
        Server(('127.0.0.1', PORT), functools.partial(Handler, directory=ROOT)).serve_forever()
    except OSError:
        pass   # cổng đã có server chạy rồi → thoát êm (QCWorld.vbs tự tắt server cũ trước khi mở)
