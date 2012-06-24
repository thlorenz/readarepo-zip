import sys
sys.path.append('../3rd/pygments')

from pygments.lexers import get_all_lexers
import json

def to_json (lexer_tpl):
    name        =  lexer_tpl[0]
    short_names =  lexer_tpl[1]
    extensions  =  lexer_tpl[2]
    mime_types  =  lexer_tpl[3]

    name_s        =  json.dumps(name)
    short_names_s =  json.dumps(short_names)
    extensions_s  =  json.dumps(extensions)
    mime_types_s  =  json.dumps(mime_types)


    return '\t{0}:{{ \n\t\t"shortnames": {1},\n\t\t"extensions": {2},\n\t\t "mimetypes": {3}\n\t}}'.format(name_s, short_names_s, extensions_s, mime_types_s)

lexer_jsons =  map(to_json, get_all_lexers())

# TODO: Probably the most verbose way of doing things, but the best I could google together at this point

print '{'
length = len(lexer_jsons)
count = 0
for lexer_json in lexer_jsons:
    count = count + 1
    if count < length: comma = ',' 
    else: comma = ''
    print lexer_json + comma
        
print '}'


