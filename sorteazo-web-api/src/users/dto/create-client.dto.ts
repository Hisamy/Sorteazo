import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateClientDto extends CreateUserDto {

    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    @IsString()
    @Length(5, 50, { message: 'El tamaño de la dirección es inválido.' })
    address: string;

    @Matches(/^[0-9]{5}$/, { message: 'El código postal debe tener exactamente 5 dígitos.' })
    @IsString()
    @IsNotEmpty({ message: 'El código postal es obligatorio.' })
    //@Length(5, 5, { message: 'El código postal debe tener exactamente 5 dígitos.' })
    zipCode: string;
}