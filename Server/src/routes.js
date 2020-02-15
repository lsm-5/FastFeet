import { Router } from 'express';
import multer from 'multer';

import DeliveriesController from './app/controllers/DeliveriesController';
import DeliverymenController from './app/controllers/DeliverymenController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import FileController from './app/controllers/FileController';
import NotificationController from './app/controllers/NotificationController';
import OrderController from './app/controllers/OrderController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/notifications/:id', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/deliverymen/:id/deliveries', DeliveriesController.index);
routes.patch(
  '/deliverymen/:deliverymenId/deliveries/:orderId',
  DeliveriesController.update
);

routes.post('/delivery/:orderId/problems', DeliveryProblemController.store);
routes.get(
  '/delivery/:deliveryProblemId/problems',
  authMiddleware,
  DeliveryProblemController.index
);

routes.delete(
  '/problems/:deliveryProblemId/cancel-delivery',
  authMiddleware,
  DeliveryProblemController.delete
);

// Todas as rotas que forem chamadas a partir daqui tem que ser autenticada
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverymens', DeliverymenController.store);
routes.get('/deliverymens', DeliverymenController.index);
routes.put('/deliverymens/:deliverymenId', DeliverymenController.update);
routes.delete('/deliverymens/:deliverymenId', DeliverymenController.delete);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:orderId', OrderController.update);
routes.delete('/orders/:orderId', OrderController.delete);

export default routes;
