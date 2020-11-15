import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import Task from '../app/models/Task';
import Token from '../app/models/Token';

const models = [User, Task, Token];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Conexão do banco de dados com os models e suas associações. Ex: Task possui user_id em sua tabela
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
