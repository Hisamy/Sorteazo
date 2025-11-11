import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsPhoneNumber('MX', { message: 'Please provide a valid Mexican phone number' })
    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'Password must contain at least 8 chars' })
    password: string;

}