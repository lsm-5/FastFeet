import * as Yup from 'yup';

import Deliveryman from '../models/Deliverymen';
import File from '../models/File';

class DeliverymenController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatarId: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        message: 'Validation fail',
      });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (deliverymanExists) {
      return res.status(400).json({
        message: 'Deliveryman already exists',
      });
    }

    if (req.body.avatarId) {
      const fileExists = await File.findByPk(req.body.avatarId);
      if (!fileExists) {
        return res.status(400).json({
          message: 'Image not found!',
        });
      }
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.status(201).json(deliveryman);
  }
}

export default new DeliverymenController();
