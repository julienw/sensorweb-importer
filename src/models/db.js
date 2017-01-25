/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const IDLE = 0;
const INITIALIZING = 1;
const READY = 2;

function Deferred() {
  const result = {};

  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

let deferred;
let state = IDLE;

let db = null;

const { name, user, password, host, port } = config.get('db');

const sequelize = new Sequelize(name, user, password, {
  host,
  port,
  dialect: 'postgres',
  logging: false
});

// only used in tests
function reset() {
  state = IDLE;
  db = deferred = null;
}

module.exports = function() {
  if (state === READY) {
    return Promise.resolve(db);
  }

  if (state === INITIALIZING) {
    return deferred.promise;
  }

  // state === IDLE
  state = INITIALIZING;
  deferred = Deferred();
  db = {};

  fs.readdirSync(__dirname)
    .filter(file =>
      (file.includes('.js') &&
        !file.startsWith('.') &&
        file !== 'db.js')
    )
    .forEach(file => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  deferred.resolve(
    sequelize.sync().then(() => {
      state = READY;
      return db;
    }).catch(e => {
      console.error(e);
      throw e;
    })
  );

  return deferred.promise;
};

Object.assign(module.exports, { sequelize, Sequelize, reset });
