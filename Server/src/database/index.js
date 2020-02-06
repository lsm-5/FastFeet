import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import File from '../app/models/File';
import Deliverymen from '../app/models/Deliverymen';
import Order from '../app/models/Order';
import Deliveryproblem from '../app/models/Deliveryproblem';

import databaseConfig from '../config/database';

const models = [User, Recipient, File, Deliverymen, Order, Deliveryproblem];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/fastfeet',
      {
        useNewUrlParser: true, // estou utilizando um formato novo na string de conexão
        useFindAndModify: true, // para poder buscar e atualizar os registros
        useUnifiedTopology: true, // DeprecationWarning apareceu no console então eu estou usando, conforme a recomendação do mongo
      }
    );
  }
}
export default new Database();
