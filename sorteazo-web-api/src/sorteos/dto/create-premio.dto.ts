import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePremioDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    place: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    description: string;
}