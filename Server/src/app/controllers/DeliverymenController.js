import * as Yup from 'yup';

import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

class DeliverymenController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymens = await Deliverymen.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.status(200).json(deliverymens);
  }

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

    const deliverymenExists = await Deliverymen.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (deliverymenExists) {
      return res.status(400).json({
        message: 'deliverymen already exists',
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

    const deliverymen = await Deliverymen.create(req.body);

    return res.status(201).json(deliverymen);
  }

  async update(req, res) {
    const { deliverymenId } = req.params;

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

    const deliverymen = await Deliverymen.findByPk(deliverymenId);

    if (!deliverymen) {
      return res.status(400).json({
        message: 'deliverymen not found',
      });
    }

    if (deliverymen.email !== req.body.email) {
      const emailExists = await Deliverymen.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (emailExists) {
        return res.status(400).json({
          message: 'E-mail already exists',
        });
      }
    }

    if (req.body.avatarId && deliverymen.avatarId !== req.body.avatarId) {
      const fileExists = await File.findByPk(req.body.avatarId);
      if (!fileExists) {
        return res.status(400).json({
          message: 'Image not found!',
        });
      }
    }

    await deliverymen.update(req.body);

    const updateddeliverymen = await Deliverymen.findByPk(deliverymen.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.status(200).json(updateddeliverymen);
  }
}

export default new DeliverymenController();
