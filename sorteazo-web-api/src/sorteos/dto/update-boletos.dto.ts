
import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';

export class UpdateBoletosInfoDto {
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @IsOptional()
    ticketPrice: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    numbersQuantity: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    startNumber: number;
}