import socket
import json
import struct

HOST = 'localhost'
PORT = 9999
EOM = '_^EOM^_'

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

s.bind((HOST, PORT))

s.listen(1)

print 'Listening on %s:%s' % (HOST , PORT)

conn, addr = s.accept()

print 'Connected by', addr

buf = ''
while 1:
  data = conn.recv(1024)
  if not data: break
  if data == EOM:
 
    js = json.loads(buf)
    print 'Json: %s' % json.dumps(js)

    buf = ''

    conn.send('OK')
    conn.send('Highlighted this: blah')
    conn.close()
    break
  else:
    buf += data

conn.close()
