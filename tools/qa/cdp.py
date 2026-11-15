# CDP tối giản (stdlib): python cdp.py <port> <job.json>
# job: {"url":..., "wait":"expr", "steps":[{"eval":"expr"} | {"shot":"path.jpg","q":85} | {"sleep":s}]}
import json, socket, base64, os, struct, sys, time, urllib.request

class WS:
    def __init__(s, url):
        hostport, path = url[5:].split('/', 1)
        h, p = hostport.split(':')
        s.sock = socket.create_connection((h, int(p)), timeout=300)
        key = base64.b64encode(os.urandom(16)).decode()
        s.sock.sendall((f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b''
        while b'\r\n\r\n' not in buf:
            buf += s.sock.recv(1)
        s.id = 0
        s.console = []
    def send(s, obj):
        data = json.dumps(obj).encode()
        hdr = bytearray([0x81]); n = len(data); mask = os.urandom(4)
        if n < 126: hdr.append(0x80 | n)
        elif n < 65536: hdr.append(0x80 | 126); hdr += struct.pack('>H', n)
        else: hdr.append(0x80 | 127); hdr += struct.pack('>Q', n)
        hdr += mask
        s.sock.sendall(bytes(hdr) + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))
    def rn(s, n):
        buf = b''
        while len(buf) < n:
            c = s.sock.recv(n - len(buf))
            if not c: raise EOFError
            buf += c
        return buf
    def recv(s):
        msg = b''
        while True:
            b0, b1 = s.rn(2)
            op = b0 & 0x0f; n = b1 & 0x7f
            if n == 126: n = struct.unpack('>H', s.rn(2))[0]
            elif n == 127: n = struct.unpack('>Q', s.rn(8))[0]
            if b1 & 0x80: s.rn(4)
            data = s.rn(n)
            if op in (9, 10): continue
            msg += data
            if b0 & 0x80: return json.loads(msg)
    def call(s, method, params=None):
        s.id += 1; mid = s.id
        s.send({'id': mid, 'method': method, 'params': params or {}})
        while True:
            r = s.recv()
            if r.get('id') == mid: return r
            m = r.get('method')
            if m == 'Runtime.consoleAPICalled':
                a = r['params']['args']; t = r['params']['type']
                if t in ('error', 'warning', 'warn'):
                    s.console.append(t + ': ' + ' '.join(str(x.get('value', x.get('description', ''))) for x in a)[:400])
            elif m == 'Runtime.exceptionThrown':
                d = r['params']['exceptionDetails']
                s.console.append('EXC: ' + str(d.get('exception', {}).get('description', d.get('text')))[:600])
    def ev(s, expr, timeout=240):
        r = s.call('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True, 'timeout': timeout * 1000})
        res = r.get('result', {})
        if 'exceptionDetails' in res:
            return {'__error': res['exceptionDetails'].get('exception', {}).get('description', str(res['exceptionDetails']))[:800]}
        return res.get('result', {}).get('value')

def main():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    port = int(sys.argv[1]); job = json.load(open(sys.argv[2], encoding='utf-8'))
    tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json'))
    page = [t for t in tabs if t.get('type') == 'page'][0]
    ws = WS(page['webSocketDebuggerUrl'])
    ws.call('Runtime.enable'); ws.call('Page.enable')
    vp = job.get('viewport', [1600, 900])
    ws.call('Emulation.setDeviceMetricsOverride', {'width': vp[0], 'height': vp[1], 'deviceScaleFactor': 1, 'mobile': False})
    if job.get('url'):
        ws.call('Page.navigate', {'url': job['url']})
        t0 = time.time()
        while time.time() - t0 < job.get('timeout', 180):
            v = ws.ev(job.get('wait', 'document.readyState==="complete"'))
            if v is True: break
            time.sleep(.5)
        print('ready after %.1fs' % (time.time() - t0), flush=True)
    out = []
    for st in job.get('steps', []):
        if 'evalFile' in st:
            st = {'eval': open(st['evalFile'], encoding='utf-8').read(), 'max': st.get('max', 1500)}
        if 'save' in st:
            v = ws.ev(open(st['evalFile2'], encoding='utf-8').read(), 600)
            if isinstance(v, dict) and 'imgs' in v:
                for i, d in enumerate(v['imgs']):
                    open(st['save'] + str(i) + '.jpg', 'wb').write(base64.b64decode(d.split(',', 1)[1]))
                print('saved', len(v['imgs']), 'pages'); out.append(v.get('info')); print(json.dumps(v.get('info'), ensure_ascii=False)[:st.get('max', 6000)], flush=True)
            else: print(json.dumps(v, ensure_ascii=False)[:1500], flush=True)
            continue
        if 'eval' in st:
            v = ws.ev(st['eval']); out.append(v); print(json.dumps(v, ensure_ascii=False)[:st.get('max', 1500)], flush=True)
        elif 'shot' in st:
            os.makedirs(os.path.dirname(st['shot']), exist_ok=True)
            r = ws.call('Page.captureScreenshot', {'format': 'jpeg', 'quality': st.get('q', 85)})
            open(st['shot'], 'wb').write(base64.b64decode(r['result']['data'])); print('shot', st['shot'], flush=True)
        elif 'sleep' in st:
            time.sleep(st['sleep'])
    for c in ws.console[:40]: print('CONSOLE', c)
    if job.get('out'): json.dump(out, open(job['out'], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

main()
