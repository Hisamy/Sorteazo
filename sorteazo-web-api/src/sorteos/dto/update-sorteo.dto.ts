import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, Max } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';
export class UpdateSorteoDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @Transform(({ value }) => {
        const val = parseInt(value);
        return isNaN(val) ? undefined : val;
    })
    @IsNumber()
    @Min(1)
    @Max(60)
    paymentDeadlineDays?: number;

    @IsOptional()
    @IsDateString()
    saleStartDate?: Date;

    @IsOptional()
    @IsDateString()
    saleEndDate?: Date;

    @IsOptional()
    @IsDateString()
    raffleDateTime?: Date;
}
