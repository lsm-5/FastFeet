// for deliveryman

import * as Yup from 'yup';

import DeliveryProblem from '../models/Deliveryproblem';
import Order from '../models/Order';

class DeliveryProblemsController {
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
