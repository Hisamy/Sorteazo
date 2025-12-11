import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MinLength, MaxLength } from 'class-validator';

export class CreatePremioDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'El nombre del premio debe tener al menos 5 caractéres.' })
    @MaxLength(100, { message: 'El nombre del premio debe tener menos de 100 caractéres.' })
    name: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    @Length(1, 10, { message: 'Solo pueden haber 10 ganadores por sorteo.' })
    place: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'La imagen del premio es obligatoria.' })
    imageUrl?: string;

    @IsString()
    @IsOptional()
    @MinLength(10, { message: 'La descripción del premio debe tener al menos 10 caractéres.' })
    @MaxLength(300, { message: 'La descripción del premio debe tener menos de 300 caractéres.' })
    description: string;
}