import sys
import os

script_path = os.path.dirname( os.path.realpath( __file__ ) )
pygments_path = os.path.join(script_path, '../../../3rd/pygments')
sys.path.append(pygments_path)

import socket
import json
import struct


from pygments import __version__, highlight
from pygments.lexers import get_all_lexers, get_lexer_by_name, get_lexer_for_filename, \
     find_lexer_class, guess_lexer, TextLexer

from pygments.formatters import get_all_formatters, get_formatter_by_name, \
     get_formatter_for_filename, find_formatter_class, \
     TerminalFormatter
"""
from pygments.util import ClassNotFound, OptionError, docstring_headline
from pygments.filters import get_all_filters, find_filter_class
from pygments.styles import get_all_styles, get_style_by_name
"""

from logger import get_logger

log = get_logger()

HOST = 'localhost'
PORT = 9999
EOM = '_^EOM^_'

actions = { 
    'highlight' :  'highlight',
    'tokenize'  :  'tokenize'
}

def process_request(json_data):
    log.debug('Processing: path: %s\n%s:%s' % (json_data['fullPath'], json_data['action'], json_data['language']))

    try:
      code = json_data['code']

      fmter = get_formatter_by_name(json_data['outformat'])
      fmter.encoding = json_data['encoding'] 

      lexer = get_lexer_by_name(json_data['language'])

      return highlight(code, lexer, fmter)
    except ValueError as err:
      log.error(err)
      return ''' 
        <h1><a href="http://pygments.org">Pygments</a> failed to highlight this file</h1>
        <div>You should consider filing a bug report or provide a bug fix to help the community ;)</div>
        <div>
          The Error was:
            <pre>%s</pre>
        </div>
        <div>
          The code that was parsed is:
            <pre>%s</pre>
        </div>
        ''' % (err, code)
          
      

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

s.bind((HOST, PORT))

s.listen(5)

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
        buf += data
        eom_ind = buf.rfind(EOM)
        if  eom_ind >= 0:

            buf = buf[:eom_ind]
            json_data = json.loads(buf)
            buf = ''

            result = process_request(json_data)
            conn.send(result)

            break

    conn.close()
