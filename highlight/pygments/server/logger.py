import logging

logger = logging.getLogger("pygments service")
logger.setLevel(logging.DEBUG)
FORMAT = '[%(asctime)-15s][%(levelname)s][%(module)s][%(funcName)s] %(message)s'
logging.basicConfig(format=FORMAT)

def get_logger():
    return logger

