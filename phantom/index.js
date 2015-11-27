var Render = require('./render');
var fs = require('fs');

if (phantom.args.length < 1) {
  console.log('incorrect args');
  phantom.exit(1);
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

var manifest = require(phantom.args[0]);
var data = require(phantom.args[1]);
var isDebug = phantom.args[2];

fs.remove(phantom.args[0]);
fs.remove(phantom.args[1]);

new Render(manifest, data, isDebug, function(err) {
  if (err) {
    console.error(err);
    phantom.exit(1);
  } else {
    phantom.exit();
  }
});
