import struct, zlib

def create_png(width, height, filename):
    bg = (250, 246, 238)
    gold = (201, 151, 43)
    rows = []
    cx, cy = width // 2, height // 2
    r = width // 4
    for y in range(height):
        row = b'\x00'
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            if dist < r:
                row += bytes(gold)
            else:
                row += bytes(bg)
        rows.append(row)
    raw = b''.join(rows)
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    compressed = zlib.compress(raw)
    with open(filename, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))

create_png(192, 192, 'public/icons/icon-192.png')
create_png(512, 512, 'public/icons/icon-512.png')
print('Created icon-192.png and icon-512.png')
