// for deliveryman

import * as Yup from 'yup';

import DeliveryProblem from '../models/Deliveryproblem';
import Order from '../models/Order';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { orderId } = req.params;

    const ordersProblem = await DeliveryProblem.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        order_id: orderId,
      },
    });

    if (!ordersProblem) {
      return res.status(400).json({
        message: 'DeliveryProblem not found!',
      });
    }

    return res.status(200).json(ordersProblem);
  }

  async store(req, res) {
    const { orderId } = req.params;
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const orderExists = await Order.findOne({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      return res.status(400).json({
        message: 'Order not found',
      });
    }

    const problem = await DeliveryProblem.create({
      orderId,
      ...req.body,
    });
    return res.status(201).json(problem);
  }
}

export default new DeliveryProblemsController();
