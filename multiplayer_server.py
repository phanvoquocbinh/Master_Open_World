# QC World – server NHIỀU NGƯỜI CHƠI (Sprint 7)
# Chỉ chuyển tiếp giữa các người chơi: vị trí, hướng, động tác, tên, màu, tin nhắn chat, cử chỉ.
#   • KHÔNG chứa token / mật khẩu, KHÔNG đọc db.json hay bất kỳ dữ liệu nào của Master Dashboard
#   • KHÔNG phục vụ file, KHÔNG gọi ra Internet, KHÔNG lưu gì xuống đĩa
#   • Mặc định CHỈ nghe 127.0.0.1 (thử nhiều cửa sổ trên cùng 1 máy)
#   • Chơi trong mạng LAN: chạy với --lan (nghe mọi card mạng). Máy khác mở QC World của họ (127.0.0.1:8770)
#     → nút 👥 Online → nhập ws://<IP máy chạy server>:8790
#   • Chỉ nhận kết nối từ trang game chạy ở 127.0.0.1 / localhost (trang web lạ không kết nối được)
#   • S19g – ĐIỆN THOẠI trong game: mỗi người tự xưng 1 số dạng 555-xxx-xxxx (số ảo, tạo ở máy họ, giữ cố định);
#     tin nhắn chuyển thẳng tới người có số đó; người nhận chưa online → giữ tạm TRONG RAM (tối đa 50 tin/số, 24 giờ),
#     tắt server là mất – vẫn KHÔNG ghi gì xuống đĩa.
# Chạy:  python multiplayer_server.py [cổng] [--lan]      (mặc định cổng 8790)
import asyncio, base64, hashlib, json, os, random, re, socket, struct, sys, time

if sys.stdout is None or sys.stderr is None:          # pythonw: không có console
    _null = open(os.devnull, 'w')
    sys.stdout = sys.stdout or _null
    sys.stderr = sys.stderr or _null

ARGS = sys.argv[1:]
HOST = '0.0.0.0' if '--lan' in ARGS else '127.0.0.1'
PORT = next((int(a) for a in ARGS if a.isdigit()), 8790)
GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
ORIGIN_OK = re.compile(r'^https?://(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$')
MAX_FRAME, MAX_PLAYERS, TICK = 8192, 32, 0.1
KEYS = ('id', 'name', 'x', 'y', 'z', 'f', 'a', 'm', 'c', 'v', 'in')

players, clients = {}, {}
next_id = 1
PHONE_RE = re.compile(r'^555-\d{3}-\d{4}$')
phones, inbox = {}, {}          # số → pid đang online · số → [tin chờ]

def new_temp_phone():
    while True:
        n = '555-0%02d-%04d' % (random.randint(0, 99), random.randint(0, 9999))
        if n not in phones: return n

def drop_phone(pid):
    for n, p in list(phones.items()):
        if p == pid: phones.pop(n, None)

def log(*a):
    try: print(time.strftime('%H:%M:%S'), *a, flush=True)
    except Exception: pass

def clean(s, n):
    s = re.sub(r'[\x00-\x1f<>]', '', str(s if s is not None else ''))
    return s.strip()[:n]

def frame(payload, op=1):
    n = len(payload)
    head = bytes([0x80 | op])
    if n < 126: head += bytes([n])
    elif n < 65536: head += bytes([126]) + struct.pack('>H', n)
    else: head += bytes([127]) + struct.pack('>Q', n)
    return head + payload

def send(pid, obj):
    w = clients.get(pid)
    if not w: return
    try: w.write(frame(json.dumps(obj, ensure_ascii=False).encode('utf-8')))
    except Exception: pass

def broadcast(obj, skip=None):
    data = frame(json.dumps(obj, ensure_ascii=False).encode('utf-8'))
    for pid, w in list(clients.items()):
        if pid == skip: continue
        try:
            if w.transport.get_write_buffer_size() > 1_000_000: w.close(); continue   # máy quá chậm → ngắt
            w.write(data)
        except Exception: pass

async def handshake(reader, writer):
    data = b''
    while b'\r\n\r\n' not in data:
        chunk = await asyncio.wait_for(reader.read(1024), 5)
        if not chunk or len(data) > 8192: return False
        data += chunk
    head = data.split(b'\r\n\r\n', 1)[0].decode('latin-1')
    lines = head.split('\r\n')
    hdr = {}
    for l in lines[1:]:
        if ':' in l:
            k, v = l.split(':', 1); hdr[k.strip().lower()] = v.strip()
    if lines[0].startswith('GET /status'):
        body = json.dumps({'ok': True, 'game': 'qcworld', 'players': len(players)}).encode()
        writer.write(b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: %d\r\nConnection: close\r\n\r\n' % len(body) + body)
        await writer.drain(); return False
    if hdr.get('upgrade', '').lower() != 'websocket' or 'sec-websocket-key' not in hdr: return False
    origin = hdr.get('origin', '')
    if origin and not ORIGIN_OK.match(origin):
        writer.write(b'HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n'); await writer.drain()
        log('Từ chối kết nối từ trang lạ:', origin); return False
    acc = base64.b64encode(hashlib.sha1((hdr['sec-websocket-key'] + GUID).encode()).digest()).decode()
    writer.write(('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n' % acc).encode())
    await writer.drain()
    return True

async def read_frame(reader):
    h = await reader.readexactly(2)
    op, masked, n = h[0] & 0x0F, h[1] & 0x80, h[1] & 0x7F
    if n == 126: n = struct.unpack('>H', await reader.readexactly(2))[0]
    elif n == 127: n = struct.unpack('>Q', await reader.readexactly(8))[0]
    if n > MAX_FRAME: raise ValueError('frame quá lớn')
    mask = await reader.readexactly(4) if masked else b'\0\0\0\0'
    data = bytearray(await reader.readexactly(n))
    for i in range(n): data[i] ^= mask[i & 3]
    return op, bytes(data)

async def handle(reader, writer):
    global next_id
    pid = None
    try:
        if not await handshake(reader, writer): return
        if len(players) >= MAX_PLAYERS:
            writer.write(frame(b'{"t":"full"}')); await writer.drain(); return
        pid = next_id; next_id += 1
        players[pid] = {'id': pid, 'name': 'Khách %d' % pid, 'x': 0.0, 'y': 0.0, 'z': 0.0, 'f': 0.0, 'a': 'idle', 'm': 'soldier', 'c': '#46d39a', 'v': '', 'in': ''}
        clients[pid] = writer
        send(pid, {'t': 'hello', 'id': pid, 'players': len(players)})
        last_chat = 0.0; sms_times = []
        while True:
            op, data = await asyncio.wait_for(read_frame(reader), 40)
            if op == 8: break                                   # đóng
            if op == 9: writer.write(frame(data, 10)); continue  # ping → pong
            if op != 1: continue
            try: m = json.loads(data.decode('utf-8'))
            except Exception: continue
            if not isinstance(m, dict): continue
            p, t = players[pid], m.get('t')
            if t == 's':
                for k in ('x', 'y', 'z', 'f'):
                    v = m.get(k)
                    if isinstance(v, (int, float)) and abs(v) < 1e5: p[k] = round(float(v), 2)
                p['a'] = clean(m.get('a'), 10) or 'idle'; p['m'] = clean(m.get('m'), 10) or 'soldier'
                p['v'] = clean(m.get('v'), 10); p['in'] = clean(m.get('in'), 40)
            elif t == 'hi':
                old = p['name']; p['name'] = clean(m.get('name'), 24) or p['name']
                c = clean(m.get('c'), 9); p['c'] = c if re.match(r'^#[0-9a-fA-F]{6}$', c) else p['c']
                if old != p['name']: log('Vào game:', p['name'], '(%d người)' % len(players))
                broadcast({'t': 'join', 'id': pid, 'name': p['name']}, skip=pid)
            elif t == 'chat':
                now = time.time()
                if now - last_chat < 0.8: continue                 # chống spam
                last_chat = now; txt = clean(m.get('text'), 140)
                if txt: broadcast({'t': 'chat', 'id': pid, 'name': p['name'], 'text': txt})
            elif t == 'emote':
                broadcast({'t': 'emote', 'id': pid, 'k': clean(m.get('k'), 12)}, skip=pid)
            elif t == 'game':                                     # 23/11: tháp Brain – chơi cùng bạn (brain_games.js)
                broadcast({k: v for k, v in m.items() if k in ('t','g','k','tid','gid','name','kind','seat','ok','why','n','s','seats','host','ix','iz','mx','my','b','ev')}, skip=pid)
            elif t == 'phone':                                   # S19g: đăng ký số điện thoại của người chơi
                num = clean(m.get('num'), 16); temp = False
                if not PHONE_RE.match(num): continue
                drop_phone(pid)
                if num in phones and phones[num] in clients and phones[num] != pid:
                    num = new_temp_phone(); temp = True           # số đang dùng ở cửa sổ khác → cấp số tạm cho phiên này
                phones[num] = pid; p['ph'] = num
                send(pid, {'t': 'phone_ok', 'num': num, 'temp': temp})
                now = time.time()
                for sm in inbox.pop(num, []):
                    if now - sm['ts'] < 86400: send(pid, dict(sm, t='sms'))
            elif t == 'sms':
                now = time.time(); frm = p.get('ph'); to = clean(m.get('to'), 16); txt = clean(m.get('text'), 300); cid = clean(m.get('cid'), 24)
                sms_times[:] = [x for x in sms_times if now - x < 3.0]   # chống spam: tối đa 5 tin / 3 giây
                if not frm or not txt or not PHONE_RE.match(to) or len(sms_times) >= 5:
                    send(pid, {'t': 'sms_ack', 'cid': cid, 'ok': False}); continue
                sms_times.append(now)
                sm = {'from': frm, 'name': p['name'], 'text': txt, 'ts': round(now, 3)}
                dst = phones.get(to)
                if dst in clients:
                    send(dst, dict(sm, t='sms')); send(pid, {'t': 'sms_ack', 'cid': cid, 'ok': True, 'delivered': True})
                else:
                    if len(inbox) < 500:
                        q = inbox.setdefault(to, []); q.append(sm); del q[:-50]
                    send(pid, {'t': 'sms_ack', 'cid': cid, 'ok': True, 'delivered': False})
            elif t == 'who':
                send(pid, {'t': 'who', 'list': [{'name': x['name'], 'num': x['ph']} for x in players.values() if x.get('ph')]})
    except (asyncio.IncompleteReadError, asyncio.TimeoutError, ConnectionError, ValueError, OSError):
        pass
    finally:
        if pid is not None:
            name = players.get(pid, {}).get('name', '?')
            players.pop(pid, None); clients.pop(pid, None); drop_phone(pid)
            broadcast({'t': 'leave', 'id': pid, 'name': name})
            log('Rời game:', name, '(%d người)' % len(players))
        try: writer.close()
        except Exception: pass

async def ticker():
    while True:
        await asyncio.sleep(TICK)
        if not clients: continue
        snap = {'t': 'snap', 'ts': round(time.time(), 3), 'p': [{k: p[k] for k in KEYS if k in p} for p in players.values()]}
        broadcast(snap)

def lan_ips():
    ips = set()
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET): ips.add(info[4][0])
    except Exception: pass
    return sorted(ip for ip in ips if not ip.startswith('127.'))

async def main():
    try:
        srv = await asyncio.start_server(handle, HOST, PORT)
    except OSError:
        log('Cổng %d đang bận – có thể server đã chạy rồi.' % PORT); return
    log('QC World – server nhiều người chơi đang chạy ở cổng %d (%s)' % (PORT, 'LAN' if HOST == '0.0.0.0' else 'chỉ máy này'))
    if HOST == '0.0.0.0':
        for ip in lan_ips(): log('  Bạn bè trong LAN nhập:  ws://%s:%d' % (ip, PORT))
    else:
        log('  Trong game: nút 👥 Online → ws://127.0.0.1:%d  (muốn chơi LAN: chạy lại với --lan)' % PORT)
    asyncio.create_task(ticker())
    async with srv:
        await srv.serve_forever()

if __name__ == '__main__':
    try: asyncio.run(main())
    except KeyboardInterrupt: pass
