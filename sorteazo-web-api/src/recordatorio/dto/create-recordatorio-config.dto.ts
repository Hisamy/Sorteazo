import { IsInt, IsString, Min, Max } from 'class-validator';

export class CreateRecordatorioConfigDto {
  @IsInt()
  @Min(1)
  @Max(15)
  frequencyDays: number;

  @IsString()
  sendTime: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;
}
