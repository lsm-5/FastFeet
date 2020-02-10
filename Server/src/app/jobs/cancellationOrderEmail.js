import Mail from '../../lib/Mail';

class CancellationOrderEmail {
  get key() {
    return 'CancellationOrderEmail';
  }

  async handle({ data }) {
    const { deliverymen, order, recipient } = data;
    await Mail.sendMail({
      to: `${deliverymen.name} <${deliverymen.email}>`,
      subject: 'Novo cancelamento',
      template: 'cancellationOrder',
      context: {
        user: deliverymen.name,
        product: order.product,
        recipient: recipient.name,
        address: `${recipient.street}, ${recipient.number} - ${recipient.city}/${recipient.state} (${recipient.zipcode})`,
      },
    });
  }
}

export default new CancellationOrderEmail();
