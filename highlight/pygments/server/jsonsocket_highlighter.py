# Include pygments path
import sys
import os
script_path = os.path.dirname( os.path.realpath( __file__ ) )
pygments_path = os.path.join(script_path, '../../../3rd/pygments')
sys.path.append(pygments_path)

import socket
from jsonsocket import JsonSocket
from logger import get_logger

logger = get_logger()

class JsonServer(JsonSocket):
	def __init__(self, address='127.0.0.1', port=9999):
		super(JsonServer, self).__init__(address, port)
		self._bind()
	
	def _bind(self):
		self.socket.bind( (self.address,self.port) )

	def _listen(self):
		self.socket.listen(1)
	
	def _accept(self):
		return self.socket.accept()
	
	def accept_connection(self):
		self._listen()
		self.conn, addr = self._accept()
		self.conn.settimeout(self.timeout)
		logger.debug("connection accepted, conn socket (%s,%d)" % (addr[0],addr[1]))
	
	def _is_connected(self):
		return True if not self.conn else False
	
	connected = property(_is_connected, doc="True if server is connected")

	
if __name__ == "__main__":
	""" basic json echo server """
	import threading
	
	def server_thread():
		logger.debug("starting JsonServer")
		server = JsonServer()
		server.accept_connection()
		while 1:
			try:
				msg = server.read_obj()
				logger.info("server received: %s" % msg)
				server.send_obj(msg)
			except socket.timeout as e:
				logger.debug("server socket.timeout: %s" % e)
				continue
			except Exception as e:
				logger.error("server: %s" % e)
				break
			
		server.close()
			
	t = threading.Timer(1, server_thread)
	t.start()
