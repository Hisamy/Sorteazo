export class TransporterConfig {
  constructor({ service, host, port, secure, user, pass }) {
    this.service = service;
    this.host = host;
    this.port = port;
    this.secure = secure;
    this.user = user;
    this.pass = pass;
  }
}
