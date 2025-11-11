import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';
export class CreateSorteoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsNotEmpty()
    ticketPrice: number;

    @IsNumber()
    @IsNotEmpty()
    numbersQuantity: number;

    @IsNumber()
    @IsNotEmpty()
    startNumber: number;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
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

    @IsArray()
    @IsNotEmpty()
    @ValidateNested({each: true})
    @Type(()=>CreatePremioDto)
    premios: CreatePremioDto[];


}
