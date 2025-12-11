import { IsInt, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateBoletosInfoDto {
    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
    })
    @IsInt({ message: 'La cantidad de boletos debe ser un número entero' })
    @Min(5, { message: 'Debe haber al menos 5 boletos' })
    @Max(1000, { message: 'No puede haber más de 1000 boletos' })
    numbersQuantity?: number;

    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
    })
    @IsInt({ message: 'El inicio de numeración debe ser un número entero' })
    @Min(0, { message: 'El inicio de numeración no puede ser negativo' })
    startNumber?: number;

    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
    })
    @IsNumber({}, { message: 'El precio debe ser un número' })
    @Min(0.01, { message: 'El precio debe ser mayor a 0' })
    ticketPrice?: number;
}