import { Router } from 'express';
import User from './app/models/user';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Lucas Mendonça',
    email: 'lsm5@cin.ufpe.br',
    password_hash: '123456',
  });
  return res.json(user);
});

export default routes;
