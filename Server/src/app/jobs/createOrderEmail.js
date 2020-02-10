import Mail from '../../lib/Mail';

class CreateOrderEmail {
  get key() {
    return 'CreateOrderEmail';
  }

  async handle({ data }) {
    const { deliverymen, order, recipient } = data;

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
  }
}

export default new CreateOrderEmail();
