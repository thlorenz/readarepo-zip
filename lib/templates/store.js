// Sources and compiles all handlebar templates found in this folder for future use.
// This happens synchronously and only once, to ensure that they are available when needed.

var fs = require('fs')
  , path = require('path')
  , handlebars = require('handlebars')
  ;

function isHandlebar(file) {
    var ext = path.extname(file);
    return ext === '.hbs' || ext === '.handlebars';
}

function getTemplate(root, file) {
    var tmplName  = file.substr(0, file.length - path.extname(file).length)
      , template  = fs.readFileSync(path.join(root, file), 'utf-8')
      ;

    return { name: tmplName, template: template };
}

function gatherPages() {
    exports.pages = {};
    fs.readdirSync(__dirname)
        .filter(isHandlebar)
        .map(function (file) {
            return getTemplate(__dirname, file);   
        })
        .forEach(function (template) {
            exports[template.name] = handlebars.compile(template.template);
        });
}

function registerPartials() {
    var partialsPath = path.join(__dirname, 'partials');
    exports.partials = {};

    fs.readdirSync(partialsPath)
        .filter(isHandlebar)
        .map(function (file) {
            return getTemplate(partialsPath, file);   
        })
        .forEach(function (template) {
            handlebars.registerPartial(template.name, template.template);
        });
}

gatherPages();
registerPartials();
