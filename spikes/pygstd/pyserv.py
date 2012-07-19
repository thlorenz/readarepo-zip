EOM = '_^EOM^_'

import sys
import time

def readInput(buf):
    line = sys.stdin.readline()
    if len(line) > 0:
        if line == EOM + '\n':
            sys.stdout.write(buf.upper() + '\n')
            sys.stdout.write(EOM + '\n')
            
            readInput('')
        else: 
            readInput(buf + line)

readInput('')
