import Notification from '../schemas/Notification';
import Deliverymen from '../models/Deliverymen';

class NotificationController {
  async index(req, res) {
    const { email } = req.query;

    if (!email) {
      return res
        .status(401)
        .json({ error: 'email required to load notifications' });
    }

    const checkIsDelivery = await Deliverymen.findOne({
      where: { id: req.userId, email },
    });

    if (!checkIsDelivery) {
      return res
        .status(401)
        .json({ error: 'Only deliverymen can load notifications' });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.status(200).json(notifications);
  }

  async update(req, res) {
    const { email } = req.query;

    if (!email) {
      return res
        .status(401)
        .json({ error: 'email required to load notifications' });
    }

    const checkIsDelivery = await Deliverymen.findOne({
      where: { id: req.userId, email },
    });

    if (!checkIsDelivery) {
      return res
        .status(401)
        .json({ error: 'Only deliverymen can load notifications' });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true } // retorna a notification atualizada
    );

    return res.status(200).json(notification);
  }
}

export default new NotificationController();
