import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, Max } from 'class-validator';
import { Timestamp } from 'typeorm';
import { Type, Transform } from 'class-transformer';
import { CreatePremioDto } from './create-premio.dto';

export class UpdatePremiosDto {
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
