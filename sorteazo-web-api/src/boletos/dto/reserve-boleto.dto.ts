import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ReserveBoletoDto {
    @IsNotEmpty({ message: 'El ID del sorteo es obligatorio' })
    @IsUUID('4', { message: 'El ID del sorteo debe ser un UUID valido' })
    sorteoId: string;

    @IsNotEmpty({ message: 'Los numeros de boletos son obligatorios' })
    @IsArray({ message: 'Los numeros deben ser un arreglo' })
    numbers: string[];
}