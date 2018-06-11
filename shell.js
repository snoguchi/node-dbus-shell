'use strict';

const dbus = require('dbus-native');

class DbusShell {
  constructor() {
    this._bus = null;
    this._service = null;
    this._object = null;
    this._iface = null;
  }

  createClient(params) {
    if (this._bus) {
      return Promise.reject('bus already selected');
    }

    this._bus = dbus.createClient(params);
    this._service = null;
    this._object = null;
    this._iface = null;
    return Promise.resolve(this._bus);
  }

  systemBus() {
    return this.createClient({
      socket: '/var/run/dbus/system_bus_socket'
    });
  }

  sessionBus(params) {
    return this.createClient(params);
  }

  getService(name) {
    if (!this._bus) {
      return Promise.reject('no bus selected');
    }

    this._service = this._bus.getService(name);
    this._object = null;
    this._iface = null;
    return Promise.resolve(this._service);
  }

  getObject(path) {
    if (!this._service) {
      return Promise.reject('no service selected');
    }

    return new Promise((resolve, reject) => {
      this._service.getObject(path, (err, obj) => {
        if (err) {
          reject(err);
        } else {
          this._object = obj;
          this._iface = null;
          resolve(this._object);
        }
      });
    });
  }

  getInterface(name) {
    if (!this._object) {
      return Promise.reject('no object selected');
    }

    this._iface = this._object.as(name);
    return Promise.resolve(this._iface);
  }

  invoke(name, ...args) {
    if (!this._iface) {
      return Promise.reject('no interface selected');
    } else if (!this._iface[name]) {
      return Promise.reject('no such method');
    }
    return new Promise((resolve, reject) => {
      args.push((err, ...result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      this._iface[name].apply(this._iface, args);
    });
  }

  releaseBus() {
    if (!this._bus) {
      return Promise.reject('no bus selected');
    }

    this._bus.connection.stream.end();
    this._bus = null;
    this._service = null;
    this._object = null;
    this._iface = null;
    return Promise.resolve();
  }
}

module.exports = DbusShell;
