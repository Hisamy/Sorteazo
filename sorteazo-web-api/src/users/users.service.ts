import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Organizador } from './entities/organizador.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateOrganizadorDto } from './dto/create-organizador.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Organizador)
    private organizadorRepository: Repository<Organizador>,
    private jwtService: JwtService,
  ) { }

  async createClient(dto: CreateClientDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('This email is already in use');
    }

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: 'client',
    });
    const savedUser = await this.userRepository.save(user);

    const client = this.clientRepository.create({
      userId: savedUser.id,
      adress: dto.address,
      zipCode: dto.zipCode,
    });

    try {
      await this.clientRepository.save(client);
    } catch (error) {
      throw new Error(`Error registering client: ${error.message}`);
    }

    const { password, ...result } = savedUser;
    return { ...result, address: client.adress, zipCode: client.zipCode };
  }

  async createOrganizador(dto: CreateOrganizadorDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('This email is already in use');
    }

    const user = this.userRepository.create({
      name: dto.adminName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: 'organizador',
    });
    const savedUser = await this.userRepository.save(user);

    const organizador = this.organizadorRepository.create({
      userId: savedUser.id,
      adminName: dto.adminName,
    });

    try {
      await this.organizadorRepository.save(organizador);
    } catch (error) {
      throw new Error(`Error registering organizer: ${error.message}`);
    }

    const { password, ...result } = savedUser;
    return { ...result, adminName: organizador.adminName };
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.password = "";
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}