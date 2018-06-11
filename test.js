const DbusShell = require('./shell.js');

(async function() {
  const shell = new DbusShell();

  const bus = await shell.systemBus();
  console.log(bus);

  const service = await shell.getService('org.freedesktop.DBus');
  console.log(service);

  const obj = await shell.getObject('/org/freedesktop/DBus');
  console.log(obj);

  const iface = await shell.getInterface('org.freedesktop.DBus.Introspectable');
  console.log(iface);

  const result = await shell.invoke('Introspect');
  console.log(result);

  shell.releaseBus();
})();

