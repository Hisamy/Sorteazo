import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateOrganizadorDto } from './dto/create-organizador.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Post('/register/client')
  async registerClient(@Body() createClientDto: CreateClientDto) {
    return this.usersService.createClient(createClientDto);
  }

  @Post('/register/organizador')
  async registerOrganizador(@Body() createOrganizadorDto: CreateOrganizadorDto) {
    return this.usersService.createOrganizador(createOrganizadorDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, role } = await this.usersService.login(loginUserDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    return { message: 'Successful Login', role };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async findUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile/me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Successful Logout' };
  }
}