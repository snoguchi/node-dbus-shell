var shell = require('./shell.js');

shell()
  .systemBus()
  .then(function(bus) { console.log(bus); })
  .getService('org.freedesktop.DBus')
  .then(function(service) { console.log(service); })
  .getObject('/org/freedesktop/DBus')
  .then(function(obj) { console.log(obj); })
  .getInterface('org.freedesktop.DBus.Introspectable')
  .then(function(iface) { console.log(iface); })
  .invoke('Introspect')
  .then(function(result) { console.log(result); })
  .releaseBus();
