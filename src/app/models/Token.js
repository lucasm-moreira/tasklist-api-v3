import Sequelize, { Model } from 'sequelize';

class Token extends Model {
  static init(sequelize) {
    super.init(
      {
        token: Sequelize.STRING,
        revoked: Sequelize.BOOLEAN,
      },
      {
        // É a conexão entre o ORM e o Banco de Dados
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Token;
