import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReleaseBoletoDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  boletoIds: string[];
}