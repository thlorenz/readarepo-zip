import time

from jsonsocket import JsonSocket
from logger import get_logger

logger = get_logger()

class JsonClient(JsonSocket):
	def __init__(self, address='127.0.0.1', port=9999):
		super(JsonClient, self).__init__(address, port)

	def connect(self):
		for i in range(10):
			try:
				self.socket.connect( (self.address, self.port) )
			except socket.error as msg:
				logger.error("SockThread Error: %s" % msg)
				time.sleep(3)
				continue
			logger.info("...Socket Connected")
			return True
		return False

if __name__ == "__main__":
    logger.debug("starting JsonClient")

    client = JsonClient()
    client.connect()

    i = 0
    while i < 10:
        client.send_obj({"i": i})
        try:
            msg = client.read_obj()
            logger.info("client received: %s" % msg)
        except socket.timeout as e:
            logger.debug("client socket.timeout: %s" % e)
            continue
        except Exception as e:
            logger.error("client: %s" % e)
            break
        i = i + 1

