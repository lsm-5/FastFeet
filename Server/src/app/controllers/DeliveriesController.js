import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  parseISO,
  isWithinInterval,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';

import Order from '../models/Order';
import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

class DeliverymenController {
  async index(req, res) {
    const deliverymenId = req.params.id;
    const { delivered } = req.query;

    if (!deliverymenId) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const deliverymen = await Deliverymen.findByPk(deliverymenId);

    if (!deliverymen) {
      return res.status(400).json({
        message: 'deliverymen not found',
      });
    }

    const where = {
      deliverymen_id: deliverymenId,
    };

    if (delivered === 'true') {
      where.signature_id = { [Op.ne]: null };
      where.canceled_at = { [Op.ne]: null };
      where.end_date = { [Op.ne]: null };
    } else {
      where.signature_id = null;
      where.canceled_at = null;
      where.end_date = null;
    }

    const orders = await Order.findAll({
      where,
    });

    return res.status(200).json(orders);
  }

  async update(req, res) {
    const { deliverymenId, orderId } = req.params;
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const deliverymen = await Deliverymen.findByPk(deliverymenId);
    if (!deliverymen) {
      return res.status(400).json({
        message: 'Deliverymen not found!',
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(400).json({
        message: 'Order not found!',
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

      const deliveriesCount = await Order.count({
        where: {
          deliverymenId,
          startDate: {
            [Op.between]: [
              startOfDay(parsedStartDate),
              endOfDay(parsedStartDate),
            ],
          },
        },
      });

      if (deliveriesCount >= 5) {
        return res.status(400).json({
          message: 'You can only do five deliveries per day',
        });
      }
    }

    const updatedOrder = await order.update(req.body);
    return res.status(200).json(updatedOrder);
  }
}

export default new DeliverymenController();
