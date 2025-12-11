import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, Max, MaxLength, MinLength } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';

export class CreateSorteoDto {

    @IsString()
    @IsNotEmpty({ message: 'El titulo del sorteo es obligatorio.' })
    @MinLength(10, { message: 'El titulo del sorteo debe tener al menos 10 caractéres.' })
    @MaxLength(100, { message: 'El titulo del sorteo debe tener menos de 100 caractéres.' })
    title: string;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsNotEmpty()
    ticketPrice: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsNotEmpty()
    numbersQuantity: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsNotEmpty()
    startNumber: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'La descripción del sorteo es obligatorio.' })
    @MinLength(10, { message: 'La descripción del sorteo debe tener al menos 10 caractéres.' })
    @MaxLength(300, { message: 'La descripción del sorteo debe tener menos de 300 caractéres.' })
    description: string;

    @Transform(({ value }) => {
        const val = parseInt(value);
        return isNaN(val) ? undefined : val;
    })
    @IsNumber()
    @Min(1)
    @Max(60)
    paymentDeadlineDays: number;

    @IsDateString()
    @IsNotEmpty()
    saleStartDate: Date;

    @IsDateString()
    @IsNotEmpty()
    saleEndDate: Date;

    @IsDateString()
    @IsNotEmpty()
    raffleDateTime: Date;

    @Transform(({ value }) => {
        if (Array.isArray(value) && value.length > 0) {
            if (value[0]?.name !== undefined) {
                return value;
            }
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
            try {
                return JSON.parse(value);
            } catch (error) {
                return [];
            }
        }
        
        return [];
    })
    @IsArray()
    @IsOptional()
    premios: CreatePremioDto[];


}
