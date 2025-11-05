import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateOrganizadorDto extends CreateUserDto {
    @IsString()
    @IsNotEmpty()
    adminName: string;
}