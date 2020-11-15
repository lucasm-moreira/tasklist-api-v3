import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';
import Token from '../models/Token';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ response: 'Token não existe!' });
  }

  // Descarta a primeira posição, ou seja, a palavra Bearer
  const [, token] = authHeader.split(' ');

  if (typeof token === 'undefined') {
    return res.status(400).json({ response: 'Token não pode ser vazio!' });
  }

  const isRevoked = await Token.findOne({
    where: { token: token, revoked: true },
  });

  if (isRevoked) {
    return res.status(401).json({ response: 'Você está deslogado!' });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Atribui o payload extraído por meio da decodificação do token, nesse caso é o id de usuário. Isso foi setado no SessionController.js
    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res.status(400).json({ response: 'Token inválido!' });
  }
};
