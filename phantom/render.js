var fs = require('fs');
var Handlebars = require('handlebars');

var Render = module.exports = function(manifest, data, isDebug, callback) {
  var partials = this.loadPartials(manifest.templates);
  var phantomSettings = manifest.phantomSettings;

  if (!partials.body) {
    return callback('body.hbs not found');
  }

  var page = require('webpage').create();

  this.registerHelpers(require(manifest.helpers), manifest.helperVariables);

  var headerInserts = this.setPrintHeadersFooters('header', partials, phantomSettings, data);
  var footerInserts = this.setPrintHeadersFooters('footer', partials, phantomSettings, data);

  this.setPageSettings(page, phantomSettings);

  this.registerPartial(partials);
  this.registerCss(manifest.css);

  page.settings.resourceTimeout = 30000; // 30 seconds
  page.onResourceTimeout = function(e) {
    page.render(manifest.output);
    callback(e);
  };

  var html = "<!DOCTYPE html><html><head><style type='text/css'>{{> css}}</style></head><body>{{> body}}</body></html>";

  if (isDebug === 'true') {
    html = "<style type='text/css'>{{> css}}</style></head><body>{{> body}}</body>";
  }
  
  page.content = Handlebars.compile(top + headerInserts + footerInserts)(data);
  
  if (manifest.scripts) {
    manifest.scripts.forEach(function(script) {
      page.injectJs(script);
    });
  }

  page.onLoadFinished = function(status) {

    if (status !== 'success') {
      callback('error');
      return;
    } else {
      if (isDebug === 'true') {

        try {

          var html = "<!DOCTYPE html><html><head>" + headerInserts + page.content + footerInserts + '<html>'
          fs.write(manifest.output, html, 'w');
          callback();

        } catch (e) {
          console.log(e);
          callback('error');
        }
      }
      else {
        page.render(manifest.output);
        callback();
      }
    }
  }
};

Render.prototype.setPrintHeadersFooters = function(type, partials, phantomSettings, data) {
  var result = '';

  if (partials[type] && phantomSettings.paperSize[type] && phantomSettings.paperSize[type].height) {

    var partial = Handlebars.compile(partials[type])({data: data});
    result += partial;

    phantomSettings.paperSize[type].contents = phantom.callback(function(pageNum, numPages) {

      var template = Handlebars.compile('<style>{{> css}}</style>' + partials[type]);

      return template({pageNum: pageNum, numPages: numPages, data: data});
    });
  }

  return result;
};

Render.prototype.setPageSettings = function(page, phantomSettings) {
  for (var key in phantomSettings) {
    if (phantomSettings.hasOwnProperty(key) && page.hasOwnProperty(key)) {
      page[key] = phantomSettings[key];
    }
  }
}

// Get rid of replace
Render.prototype.registerCss = function(css) {
  //css = css.replace(/__&quote;__/g, "'");
  Handlebars.registerPartial('css', css || '');
}

Render.prototype.loadPartials = function(templates) {
//  var self = this;
//  var partials = {};
//  var path = '';
//  for (key in templates) {
//    path = templates[key];
//    if (fs.exists(path) && fs.isFile(path) && path.indexOf('.hbs') !== -1) {
//      partials[key] = fs.read(path);
//    }
//  }
  return templates;
};

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

Render.prototype.registerHelpers = function(helpers, vars) {
  for (key in vars) {
    helpers[key] = vars[key];
  }
  ;

  for (key in helpers) {
    if (isFunction(helpers[key]))
      Handlebars.registerHelper(key, helpers[key]);
  }

};

Render.prototype.registerPartial = function(partials) {
  for (key in partials) {
    Handlebars.registerPartial(key, partials[key]);
  }
};
