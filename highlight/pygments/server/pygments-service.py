import socket
import json
import struct

from logger import get_logger

log = get_logger()

HOST = 'localhost'
PORT = 9999
EOM = '_^EOM^_'

def process_request(json_data):
    log.debug('Processing: %s' % json.dumps(json_data))

    # TODO: call into pygments to convert code
    return 'Highlighted Code'
    

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

s.bind((HOST, PORT))

s.listen(50)

log.info('Pygments Server listening on %s:%s' % (HOST, PORT))

# Accept client connections indefinitely
while 1:
    conn, addr = s.accept()

    log.debug('Accepted connection by (%s,%d)' % (addr[0],addr[1]))

    buf = ''

    # Listen for data until EOM, then convert, send result and close connection
    while 1:
        data = conn.recv(1024)
        if not data: break
        eom_ind = data.rfind(EOM)
        if  eom_ind < 0:
            buf += data
            log.debug('Got: %s' % data)
        else:
            buf += data[:eom_ind]
            json_data = json.loads(buf)
            buf = ''

            result = process_request(json_data)
            conn.send(result)

            break

    conn.close()
