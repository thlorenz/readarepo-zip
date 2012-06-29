# From: https://github.com/chris-piekarski/python-json-socket/blob/master/jsocket/jsocket_base.py

import json
import socket
import struct
from logger import get_logger

logger = get_logger()

class JsonSocket(object):
  def __init__(self, address='127.0.0.1', port=9999):
    self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    self.conn = self.socket
    self._timeout = None
    self._address = address
    self._port = port
  
  def send_obj(self, obj):
    msg = json.dumps(obj)
    if self.socket:
      frmt = "=%ds" % len(msg)
      packed_msg = struct.pack(frmt, msg)
      packed_hdr = struct.pack('=I', len(packed_msg))
      
      self._send(packed_hdr)
      self._send(packed_msg)
      
  def _send(self, msg):
    sent = 0
    while sent < len(msg):
      sent += self.conn.send(msg[sent:])
      
  def _read(self, size):
    data = ''
    while len(data) < size:
      data_tmp = self.conn.recv(size-len(data))
      data += data_tmp
      logger.debug(data)
      if data_tmp == '':
        raise RuntimeError("socket connection broken")
    return data

  def _msg_length(self):
    d = self._read(4)
    s = struct.unpack('=I', d)
    return s[0]
  
  def read_obj(self):
    size = self._msg_length()
    logger.debug('size: {0}'.format(size))
    data = self._read(size)
    frmt = "=%ds" % size
    msg = struct.unpack(frmt, data)
    return json.loads(msg[0])
  
  def close(self):
    self._close_socket()
    if self.socket is not self.conn:
      self._close_connection()
      
  def _close_socket(self):
    logger.debug("closing main socket")
    self.socket.close()
    
  def _close_connection(self):
    logger.debug("closing the connection socket")
    self.conn.close()
  
  def _get_timeout(self):
    return self._timeout
  
  def _set_timeout(self, timeout):
    self._timeout = timeout
    self.socket.settimeout(timeout)
    
  def _get_address(self):
    return self._address
  
  def _set_address(self, address):
    pass
  
  def _get_port(self):
    return self._port
  
  def _set_port(self, port):
    pass
      
  timeout = property(_get_timeout, _set_timeout,doc='Get/set the socket timeout')
  address = property(_get_address, _set_address,doc='read only property socket address')
  port = property(_get_port, _set_port,doc='read only property socket port')

  
