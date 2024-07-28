'use strict';
const bcrypt = require('bcrypt');

class PasswordHash {
  constructor() {
    this.saltRounds = 10; // Number of salt rounds for hashing
  }

  async createHash(password) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Error creating hash');
    }
  }

  async compareHash(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error comparing hash');
    }
  }
}

module.exports = new PasswordHash();
