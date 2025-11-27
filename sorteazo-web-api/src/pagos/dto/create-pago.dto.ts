import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { TipoPago } from '../enums/pagos.enum';
import { Transform } from 'class-transformer';

export class CreatePagoDto {
  @IsUUID()
  @IsNotEmpty()
  boletoId: string;

  @IsNotEmpty()
  @Transform(({ value }) => value) 
  paymentMethod: TipoPago;
}
