const path = require('path');
const os = require('os');
const crypto = require('crypto');

let sequelizeInstance = null;
let isFallback = false;

try {
  const { Sequelize } = require('sequelize');
  const storagePath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join(os.tmpdir(), 'database.sqlite')
    : path.join(__dirname, '..', 'database.sqlite');

  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
} catch (err) {
  console.warn('[DB Engine] SQLite native bindings unavailable on serverless environment. Activating resilient in-memory database:', err.message);
  isFallback = true;
}

// Resilient Fallback Engine for Serverless/Lambda (Vercel) environments where native sqlite3 bindings are absent
class ModelRecord {
  constructor(data, model) {
    this._model = model;
    Object.assign(this, data);
    if (!this.id) {
      this.id = crypto.randomUUID();
    }
    if (!this.createdAt) this.createdAt = new Date();
    if (!this.updatedAt) this.updatedAt = new Date();
  }

  toJSON() {
    const copy = { ...this };
    delete copy._model;
    return copy;
  }

  get(key) {
    if (!key) return this.toJSON();
    return this[key];
  }

  getDataValue(key) {
    return this[key];
  }

  setDataValue(key, val) {
    this[key] = val;
  }

  async save() {
    this.updatedAt = new Date();
    const idx = this._model.records.findIndex(r => r.id === this.id);
    if (idx !== -1) {
      this._model.records[idx] = this;
    } else {
      this._model.records.push(this);
    }
    return this;
  }

  async update(fields) {
    Object.assign(this, fields);
    return this.save();
  }

  async destroy() {
    this._model.records = this._model.records.filter(r => r.id !== this.id);
  }
}

class FallbackModel {
  constructor(name, attributes, options = {}) {
    this.name = name;
    this.attributes = attributes;
    this.options = options;
    this.records = [];
    this.associations = {};
  }

  _matchesWhere(record, where = {}) {
    if (!where || Object.keys(where).length === 0) return true;

    for (const [key, expected] of Object.entries(where)) {
      const actual = record[key];

      if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
        const symbols = Object.getOwnPropertySymbols(expected);
        for (const sym of symbols) {
          const val = expected[sym];
          const symStr = sym.toString();

          if (symStr.includes('like')) {
            const pattern = String(val).replace(/%/g, '').toLowerCase();
            if (!String(actual || '').toLowerCase().includes(pattern)) return false;
          } else if (symStr.includes('notIn')) {
            if (Array.isArray(val) && val.includes(actual)) return false;
          } else if (symStr.includes('in')) {
            if (Array.isArray(val) && !val.includes(actual)) return false;
          } else if (symStr.includes('ne')) {
            if (actual === val) return false;
          } else if (symStr.includes('gte')) {
            if (actual < val) return false;
          } else if (symStr.includes('lte')) {
            if (actual > val) return false;
          }
        }
      } else if (expected !== undefined) {
        if (actual !== expected) return false;
      }
    }
    return true;
  }

  async findAll(options = {}) {
    const { where, order } = options;
    let results = this.records.filter(r => this._matchesWhere(r, where));

    // Resolve associations if present
    for (const item of results) {
      for (const [assocKey, assocDef] of Object.entries(this.associations)) {
        if (assocDef.type === 'belongsTo' && assocDef.target) {
          const foreignVal = item[assocDef.foreignKey];
          if (foreignVal) {
            item[assocKey] = assocDef.target.records.find(t => t.id === foreignVal) || null;
          }
        }
      }
    }

    if (order && Array.isArray(order) && order.length > 0) {
      const [col, dir = 'ASC'] = order[0];
      results.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA < valB) return dir.toUpperCase() === 'DESC' ? 1 : -1;
        if (valA > valB) return dir.toUpperCase() === 'DESC' ? -1 : 1;
        return 0;
      });
    }

    return results;
  }

  async findOne(options = {}) {
    const results = await this.findAll(options);
    return results[0] || null;
  }

  async findByPk(id) {
    if (!id) return null;
    return this.findOne({ where: { id } });
  }

  async count(options = {}) {
    const results = await this.findAll(options);
    return results.length;
  }

  async create(data) {
    const record = new ModelRecord(data, this);
    this.records.push(record);
    return record;
  }

  async bulkCreate(items) {
    const created = [];
    for (const item of items) {
      created.push(await this.create(item));
    }
    return created;
  }

  async findOrCreate({ where, defaults = {} }) {
    const existing = await this.findOne({ where });
    if (existing) {
      return [existing, false];
    }
    const created = await this.create({ ...defaults, ...where });
    return [created, true];
  }

  async update(values, options = {}) {
    const matches = await this.findAll(options);
    for (const item of matches) {
      await item.update(values);
    }
    return [matches.length];
  }

  async destroy(options = {}) {
    const matches = await this.findAll(options);
    const matchIds = new Set(matches.map(m => m.id));
    this.records = this.records.filter(r => !matchIds.has(r.id));
    return matches.length;
  }

  hasMany(target, options = {}) {
    const as = options.as || target.name.toLowerCase() + 's';
    this.associations[as] = { type: 'hasMany', target, foreignKey: options.foreignKey };
  }

  belongsTo(target, options = {}) {
    const as = options.as || target.name.toLowerCase();
    this.associations[as] = { type: 'belongsTo', target, foreignKey: options.foreignKey };
  }
}

class FallbackSequelize {
  constructor() {
    this.models = {};
  }

  define(name, attributes, options = {}) {
    const model = new FallbackModel(name, attributes, options);
    this.models[name] = model;
    return model;
  }

  async sync() {
    return Promise.resolve();
  }

  async authenticate() {
    return Promise.resolve();
  }
}

const sequelize = isFallback ? new FallbackSequelize() : sequelizeInstance;

const connectDB = async () => {
  try {
    if (sequelize && typeof sequelize.authenticate === 'function') {
      await sequelize.authenticate();
      console.log('[DB Engine] Database Connected Successfully');
    }
    if (sequelize && typeof sequelize.sync === 'function') {
      await sequelize.sync();
    }
  } catch (error) {
    console.error('[DB Engine] Connection error:', error.message);
  }
};

module.exports = { sequelize, connectDB };
