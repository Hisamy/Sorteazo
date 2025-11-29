import { PartialType } from '@nestjs/mapped-types';
import { CreatePremioDto } from './create-premio.dto';

export class UpdatePremio extends PartialType(CreatePremioDto) {}
