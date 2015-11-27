# Phantom PDF

A very opinionated PDF generation using [PhantomJS](http://phantomjs.org/) written for [Node.js](http://nodejs.org/). This is a push to get it out there. Unit tests and better documentation to come.

## Installing

  Make sure you have [PhantomJS](http://phantomjs.org/) installed. Download link can be found on their website.

    npm install phantom-pdf

## Rendering a PDF

```javascript
  var PhantomPDF = require('phantom-pdf');

  var manifest = {
    templates: {
      body: 'body String',
      header: 'header String'
      footer: 'footer String',
    },
    helpers: _dirname+'/helpers/index.js', // Handlebars helper
    helperVariables: {}, // Additional data to be passed in the helper such as local
    css: '', // Css String
    output: '/tmp/foo.pdf'
  };

  var data = { // Put any data you want to be exposed to your handlebars template
    products: ['soccer ball', 'baseball', 'football'],
    category: 'Balls'
  };
  
  var pdf = new PhantomPDF(manifest, data, function(err){
    ...
  });
```

## For debug
Save in a temp html file for develop

```
var manifest = {
    output: '/tmp/foo.html'
    ...,
    isDebug: true
}
```
