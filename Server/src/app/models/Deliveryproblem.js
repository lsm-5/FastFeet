import Sequelize, { Model } from 'sequelize';

class Deliveryproblem extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  }
}

export default Deliveryproblem;
