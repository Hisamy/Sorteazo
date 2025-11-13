import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';
export class CreateSorteoDto {
    @IsString()
    @IsNotEmpty()
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
    description: string;

    @IsDateString()
    @IsNotEmpty()
    paymentDeadline: Date;

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
        if (Array.isArray(value) && value.length > 0 && value[0]?.name) {
            return value;
        }
        
        if (typeof value === 'string') {
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
    @ValidateNested({each: true})
    @Type(()=>CreatePremioDto)
    premios: CreatePremioDto[];


}
