export class EmailService {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async sendEmail({ to, subject, text, html }) {
    await this.transporter.sendMail({
      from: this.transporter.options.auth.user,
      to,
      subject,
      text,
      html,
    });
  }
}
