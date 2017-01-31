var dbus = require('dbus-native');

function Shell() {
  this._bus = null;
  this._service = null;
  this._object = null;
  this._iface = null;
  this._promise = Promise.resolve();
}

Shell.prototype.then = function(resolve, reject) {
  this._promise = this._promise.then(resolve, reject);
  return this;
}

Shell.prototype['catch'] = function(reject) {
  this._promise = this._promise.catch(reject);
  return this;
}

Shell.prototype.createClient = function(params) {
  var self = this;
  return this.then(function() {
    if (self._bus) {
      return Promise.reject('bus already selected');
    }

    self._bus = dbus.createClient(params);
    self._service = null;
    self._object = null;
    self._iface = null;
    return Promise.resolve(self._bus);
  });
}

Shell.prototype.systemBus = function() {
  return this.createClient({
    socket: '/var/run/dbus/system_bus_socket'
  });
}

Shell.prototype.sessionBus = function(params) {
  return this.createClient(params);
}

Shell.prototype.getService = function(name) {
  var self = this;
  return this.then(function() {
    if (!self._bus) {
      return Promise.reject('no bus selected');
    }

    self._service = self._bus.getService(name);
    self._object = null;
    self._iface = null;
    return Promise.resolve(self._service);
  });
}

Shell.prototype.getObject = function(path) {
  var self = this;
  return this.then(function() {
    if (!self._service) {
      return Promise.reject('no service selected');
    }

    return new Promise(function(resolve, reject) {
      self._service.getObject(path, function(err, obj) {
        if (err) {
          reject(err);
        } else {
          self._object = obj;
          self._iface = null;
          resolve(self._object);
        }
      });
    })
  });
}

Shell.prototype.getInterface = function(name) {
  var self = this;
  return this.then(function() {
    if (!self._object) {
      return Promise.reject('no object selected');
    }

    self._iface = self._object.as(name);
    return Promise.resolve(self._iface);
  });
}

Shell.prototype.invoke = function(name) {
  var self = this;
  return this.then(function() {
    if (!self._iface) {
      return Promise.reject('no interface selected');
    } else if (!self._iface[name]) {
      return Promise.reject('no such method');
    }
    return new Promise(function(resolve, reject) {
      self._iface[name](function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
}

Shell.prototype.releaseBus = function() {
  var self = this;
  return this.then(function(resolve, reject) {
    if (!self._bus) {
      return Promise.reject('no bus selected');
    }

    self._bus.connection.stream.end();
    self._bus = null;
    self._service = null;
    self._object = null;
    self._iface = null;
    return Promise.resolve();
  });
}

module.exports = function() {
  return new Shell();
}

