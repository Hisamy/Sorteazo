import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length, MinLength, Matches } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @Length(2, 30, { message: 'Por favor ingrese un nombre con un tamaño válido.' })
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    //@IsPhoneNumber('MX', { message: 'Por favor ingrese un número telefónico válido.' })
    @Matches(/^[0-9]{10}$/, { message: 'El número telefónico debe contener exactamente 10 dígitos.' })
    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'La contraseña debe contener al menos 8 caractéres.' })
    password: string;
}