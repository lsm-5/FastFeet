import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import cancellationOrderEmail from '../jobs/cancellationOrderEmail';
import Deliverymen from '../models/Deliverymen';
import DeliveryProblem from '../models/Deliveryproblem';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Notification from '../schemas/Notification';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { deliveryProblemId } = req.params;

    const ordersProblem = await DeliveryProblem.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        order_id: deliveryProblemId,
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
      order_id: orderId,
      ...req.body,
    });

    return res.status(201).json(problem);
  }

  async delete(req, res) {
    const { deliveryProblemId } = req.params;

    const orderProblem = await DeliveryProblem.findByPk(deliveryProblemId);

    if (!orderProblem) {
      return res.status(400).json({
        message: 'Order Problem not found',
      });
    }

    const order = await Order.findByPk(orderProblem.order_id);

    await order.update({
      canceled_at: new Date(),
    });

    const deliverymen = await Deliverymen.findByPk(order.deliverymen_id);
    const recipient = await Recipient.findByPk(order.recipient_id);

    /*
     * Send email
     */

    await Queue.add(cancellationOrderEmail.key, {
      deliverymen,
      order,
      recipient,
    });

    await Notification.create({
      content: `Você tem um cancelamento na entrega do produto ${order.product}, para o destino ${recipient.street}, cidade ${recipient.city}, estado ${recipient.state}`,
      user: order.deliverymen_id,
    });

    return res.status(204).json();
  }
}

export default new DeliveryProblemsController();
