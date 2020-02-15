import mongoose from 'mongoose';
import Sequelize from 'sequelize';

import Deliverymen from '../app/models/Deliverymen';
import Deliveryproblem from '../app/models/Deliveryproblem';
import File from '../app/models/File';
import Order from '../app/models/Order';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';
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
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true, // estou utilizando um formato novo na string de conexão
      useFindAndModify: true, // para poder buscar e atualizar os registros
      useUnifiedTopology: true, // DeprecationWarning apareceu no console então eu estou usando, conforme a recomendação do mongo
    });
  }
}
export default new Database();
