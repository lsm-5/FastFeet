import * as Yup from 'yup';
import Recipient from '../models/Recipient';
import User from '../models/User';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists' });
    }

    const isAdmin = await User.findOne({
      where: {
        id: req.userId,
        admin: true,
      },
    });

    if (!isAdmin) {
      return res
        .status(401)
        .json({ error: 'You can only create recipient with admin' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = await Recipient.create(req.body);
    return res.status(201).json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object(req.body).shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const isAdmin = await User.findOne({
      where: {
        id: req.userId,
        admin: true,
      },
    });

    if (!isAdmin) {
      return res
        .status(401)
        .json({ error: 'You can only create recipient with admin' });
    }

    const { name } = req.body;

    const recipient = await Recipient.findByPk(req.params.id);

    if (name !== recipient.name) {
      const recipientExists = await Recipient.findOne({ where: { name } });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipients already exists' });
      }
    }

    const updatedRecipient = await recipient.update(req.body);

    return res.status(200).json(updatedRecipient);
  }
}
export default new RecipientController();
