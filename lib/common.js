var path      =  require('path')
  , root      =  path.join(__dirname, '..')
  , pygments  =  path.join(root, '3rd', 'pygments')
  , styles    =  path.join(root, 'highlight', 'styles')
  , lib       =  path.join(root, 'lib')
  , readarepo =  '.__readarepo__'
  ;

exports.languages = {
    '.js'     :  { name :  'javascript'}
  , '.coffee' :  { name :  'coffeescript' }
  , '.json'   :  { name :  'json' }
  , '.as'     :  { name :  'actionscript' }
  , '.sh'     :  { name :  'bash' }
  , '.hs'     :  { name :  'haskell' }
  , '.py'     :  { name :  'python' }
  , '.rb'     :  { name :  'ruby' }
};

exports.paths = {
  root                   :  root
  , pygments             :  pygments
  , styles               :  styles
  , pygmentsStylesSource :  path.join(pygments, 'pygments', 'styles')
  , pygmentsStyles       :  path.join(styles, 'pygments')
  , hljsStyles           :  path.join(styles, 'hljs')
};

exports.reader = {
  paths: {
      readarepo         :  readarepo
    , styles            :  path.join(readarepo, 'styles')
    , javascripts       :  path.join(readarepo, 'javascripts')
    , javascriptsSource :  path.join(lib, 'reader')
  }
};
