import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePremioDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    place: number;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    description: string;

}