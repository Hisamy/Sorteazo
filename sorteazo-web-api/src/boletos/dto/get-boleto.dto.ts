import { EstadoBoleto } from '../enums/boleto.enum';

export class GetBoletoDto {
  number: string;
  price: number;
  status: EstadoBoleto;
  fechaReserva: Date;
  paymentDeadline: Date;
}