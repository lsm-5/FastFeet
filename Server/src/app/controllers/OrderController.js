import * as Yup from 'yup';

import Recipient from '../models/Recipient';
import Order from '../models/Order';
import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

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

    const order = await Order.create(req.body);

    return res.status(201).json(order);
  }
}

export default new OrdersController();
