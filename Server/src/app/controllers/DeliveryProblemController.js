import * as Yup from 'yup';

import DeliveryProblem from '../models/Deliveryproblem';
import Order from '../models/Order';
import Deliverymen from '../models/Deliverymen';
import Mail from '../../lib/Mail';
import Notification from '../schemas/Notification';
import Recipient from '../models/Recipient';

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

    await Mail.sendMail({
      to: `${deliverymen.name} <${deliverymen.email}>`,
      subject: 'Novo cancelamento',
      template: 'cancellationOrder',
      context: {
        user: deliverymen.name,
        product: order.product,
        recipient: recipient.name,
        address: `${recipient.street}, ${recipient.number} - ${recipient.city}/${recipient.state} (${recipient.zipcode})`,
      },
    });

    await Notification.create({
      content: `Você tem um cancelamento na entrega do produto ${order.product}, para o destino ${recipient.street}, cidade ${recipient.city}, estado ${recipient.state}`,
      user: order.deliverymen_id,
    });

    return res.status(204).json();
  }
}

export default new DeliveryProblemsController();
