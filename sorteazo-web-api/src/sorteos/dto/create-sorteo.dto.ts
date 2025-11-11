import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
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

    @IsDate()
    @IsNotEmpty()
    paymentDeadline: Date;

    @IsDate()
    @IsNotEmpty()
    saleStartDate: Date;

    @IsDate()
    @IsNotEmpty()
    saleEndDate: Date;

    @IsDate()
    @IsNotEmpty()
    raffleDateTime: Date;

    @IsArray()
    @IsNotEmpty()
    @ValidateNested({each: true})
    @Type(()=>CreatePremioDto)
    premios: CreatePremioDto[];


}
