import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRecordatorioConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  frequencyDays?: number;

  @IsOptional()
  @IsString()
  sendTime?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
