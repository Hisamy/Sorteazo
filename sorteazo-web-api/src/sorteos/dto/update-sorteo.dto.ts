import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, Max, MinLength, MaxLength} from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';
export class UpdateSorteoDto {

    @IsString()
    @IsNotEmpty({ message: 'El titulo del sorteo es obligatorio.' })
    @MinLength(10, { message: 'El titulo del sorteo debe tener al menos 10 caractéres.' })
    @MaxLength(100, { message: 'El titulo del sorteo debe tener menos de 100 caractéres.' })
    title?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción del sorteo es obligatorio.' })
    @MinLength(10, { message: 'La descripción del sorteo debe tener al menos 10 caractéres.' })
    @MaxLength(300, { message: 'La descripción del sorteo debe tener menos de 300 caractéres.' })
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
