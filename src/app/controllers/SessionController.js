import jwt from 'jsonwebtoken';
import User from '../models/User';
import Token from '../models/Token';
import authConfig from '../../config/auth';

class SessionController {
  async login(req, res) {
    const { email, password } = req.body;

    // Verifica se o e-mail é cadastrado no banco de dados
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      res.status(401).json({ response: 'Usuário não cadastrado!' });
    }

    // Verifica password
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ response: 'Senha incorreta!' });
    }

    const { id, name } = user;

    const activeToken = await Token.findOne({
      where: { user_id: id, revoked: false },
    });

    if (activeToken) {
      return res.status(200).json({
        response: `Você já está autenticado com o token: ${activeToken.token}`,
      });
    }

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    await Token.create({
      token: token,
      user_id: id
    });

    return res.status(200).json({
      user: {
        id,
        name,
        email,
      },
      token: token,
    });
  }

  async logout(req, res) {
    const authHeader = req.headers.authorization;

    // Descarta a primeira posição, ou seja, a palavra Bearer
    const [, token] = authHeader.split(' ');

    const tokenToRevoke = await Token.findOne({
      where: { token: token, user_id: req.userId, revoked: false },
    });

    if (!tokenToRevoke) {
      return res.status(404).json({ response: 'Token não encontrado!' });
    }

    const isRevoked = await tokenToRevoke.update({ revoked: true });

    if (!isRevoked) {
      return res
        .status(500)
        .json({ response: 'Falha ao deslogar: token não revogado!' });
    }

    return res.status(200).json({ response: 'Deslogado com sucesso!' });
  }
}

export default new SessionController();
