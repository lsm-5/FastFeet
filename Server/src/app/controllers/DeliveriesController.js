import { Op } from 'sequelize';
import Deliverymen from '../models/Deliverymen';
import Orders from '../models/Order';

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

    const orders = await Orders.findAll({
      where,
    });

    return res.status(200).json(orders);
  }
}

export default new DeliverymenController();
