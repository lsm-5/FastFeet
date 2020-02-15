import Deliverymen from '../models/Deliverymen';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const deliverymenId = req.params.id;

    if (!deliverymenId) {
      return res
        .status(401)
        .json({ error: 'Necessery id can to load notification' });
    }

    const checkIsDelivery = await Deliverymen.findOne({
      where: { id: deliverymenId },
    });

    if (!checkIsDelivery) {
      return res
        .status(401)
        .json({ error: 'Only deliverymen can load notifications' });
    }

    const notifications = await Notification.find({
      user: deliverymenId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.status(200).json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true } // retorna a notification atualizada
    );

    return res.status(200).json(notification);
  }
}

export default new NotificationController();
