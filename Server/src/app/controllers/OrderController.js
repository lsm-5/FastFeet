import * as Yup from 'yup';
import { parseISO, isWithinInterval, setHours } from 'date-fns';

import Recipient from '../models/Recipient';
import Order from '../models/Order';
import Deliverymen from '../models/Deliverymen';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail';

class OrdersController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const orders = await Order.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
        },
        {
          model: File,
          as: 'signature',
        },
        {
          model: Deliverymen,
          as: 'deliverymen',
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.status(200).json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
      deliverymen_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const deliverymen = await Deliverymen.findByPk(req.body.deliverymen_id);
    if (!deliverymen) {
      return res.status(400).json({
        message: 'Deliverymen not found!',
      });
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return res.status(400).json({
        message: 'Recipient not found!',
      });
    }

    if (req.body.signature_id) {
      const signatureExists = await File.findByPk(req.body.signature_id);
      if (!signatureExists) {
        return res.status(400).json({
          message: 'Signature image not found!',
        });
      }
    }

    // Allow delivery between 8h - 18h
    if (req.body.start_date) {
      const parsedStartDate = parseISO(req.body.start_date);

      // Checks if the start time is between 8 and 18
      const rangeStart = setHours(parsedStartDate, 8);

      const rangeEnd = setHours(parsedStartDate, 18);

      if (
        !isWithinInterval(parsedStartDate, { start: rangeStart, end: rangeEnd })
      ) {
        return res.status(400).json({
          message: 'You can only withdraw between 08:00 and 18:00.',
        });
      }
    }

    const order = await Order.create(req.body);

    await Notification.create({
      content: `Você tem uma nova entrega de produto ${req.body.product}, para o destino ${recipient.street}, cidade ${recipient.city}, estado ${recipient.state}`,
      user: req.body.deliverymen_id,
    });

    /*
     * send email to deliverymen
     */

    await Mail.sendMail({
      to: `${deliverymen.name} <${deliverymen.email}>`,
      subject: 'Nova entrega',
      template: 'createOrder',
      context: {
        user: deliverymen.name,
        product: order.product,
        recipient: recipient.name,
        address: `${recipient.street}, ${recipient.number} - ${recipient.city}/${recipient.state} (${recipient.zipcode})`,
      },
    });

    return res.status(201).json(order);
  }

  async update(req, res) {
    const { orderId } = req.params;

    const schema = Yup.object().shape({
      product: Yup.string().required(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
      deliverymen_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({
        message: 'Order not found ',
      });
    }

    const deliverymenExists = await Deliverymen.findByPk(
      req.body.deliverymen_id
    );
    if (!deliverymenExists) {
      return res.status(400).json({
        message: 'Deliveryman not found!',
      });
    }

    const recipientExists = await Recipient.findByPk(req.body.recipient_id);
    if (!recipientExists) {
      return res.status(400).json({
        message: 'Recipient not found!',
      });
    }

    if (req.body.signature_id) {
      const signatureExists = await File.findByPk(req.body.signature_id);
      if (!signatureExists) {
        return res.status(400).json({
          message: 'Signature not found!',
        });
      }
    }

    // Allow delivery between 8h - 18h
    if (req.body.start_date) {
      const parsedStartDate = parseISO(req.body.start_date);

      // Checks if the start time is between 8 and 18
      const rangeStart = setHours(parsedStartDate, 8);

      const rangeEnd = setHours(parsedStartDate, 18);

      if (
        !isWithinInterval(parsedStartDate, { start: rangeStart, end: rangeEnd })
      ) {
        return res.status(400).json({
          message: 'You can only withdraw between 08:00 and 18:00.',
        });
      }
    }

    const updatedOrder = await order.update(req.body);

    return res.status(200).json(updatedOrder);
  }

  async delete(req, res) {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({
        message: 'Order not found ',
      });
    }

    await order.destroy();

    return res.status(204).json();
  }
}

export default new OrdersController();
