import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePremioDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    place: number;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    description: string;

}