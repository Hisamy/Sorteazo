import { PartialType } from '@nestjs/mapped-types';
import { CreateSorteoDto } from './create-sorteo.dto';

export class UpdateSorteoDto extends PartialType(CreateSorteoDto) {}
