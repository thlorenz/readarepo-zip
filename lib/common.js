var path         =  require('path')
  , root         =  path.join(__dirname, '..')
  , pygments     =  path.join(root, '3rd', 'pygments')
  , highlight    =  path.join(root, 'highlight')
  , hiliPygments =  path.join(highlight, 'pygments')
  , hiliHljs     =  path.join(highlight, 'hljs')
  , lib          =  path.join(root, 'lib')
  , readarepo    =  '__readarepo-zip__'
  ;

exports.paths = {
    root                 :  root
  , pygments             :  pygments
  , pygmentsStylesSource :  path.join(pygments, 'pygments', 'styles')
  , pygmentsStyles       :  path.join(hiliPygments, 'styles')
  , pygmentsLexersJson   :  path.join(hiliPygments, 'pygments_lexers.json')
  , hljsStyles           :  path.join(hiliHljs, 'styles')
};

exports.reader = {
  paths: {
      readarepo         :  readarepo
    , styles            :  path.join(readarepo, 'styles')
    , javascripts       :  path.join(readarepo, 'javascripts')
    , javascriptsSource :  path.join(lib, 'reader')
  }
};
