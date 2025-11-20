import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Organizador } from '../users/entities/organizador.entity';
import { Sorteo } from '../sorteos/entities/sorteo.entity';
import { Boleto } from '../boletos/entities/boleto.entity';

@Controller('test')
export class TestController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organizador) private readonly organizadorRepo: Repository<Organizador>,
    @InjectRepository(Sorteo) private readonly sorteoRepo: Repository<Sorteo>,
    @InjectRepository(Boleto) private readonly boletoRepo: Repository<Boleto>,
  ) {}

  // Endpoint dev-only para crear datos de prueba: organizador + sorteo + boletos
  @Post('seed')
  async seed(@Body() body: { numbersQuantity?: number; startNumber?: number }) {
    const numbersQuantity = body?.numbersQuantity ?? 100;
    const startNumber = body?.startNumber ?? 1;

    // crear usuario organizador
    const user = this.userRepo.create({ name: 'dev organizador', email: `dev+org@example.com`, password: 'password', role: 'organizador' });
    const savedUser = await this.userRepo.save(user);

    // crear organizador
    const organizador = this.organizadorRepo.create({ userId: savedUser.id, adminName: 'Dev Admin' });
    await this.organizadorRepo.save(organizador);

    // crear sorteo
    const sorteo = this.sorteoRepo.create({
      title: 'Sorteo de prueba',
      ticketPrice: 10.0,
      numbersQuantity,
      startNumber,
      imageUrl: '',
      description: 'Sorteo creado por seed de pruebas',
      paymentDeadline: new Date(),
      saleStartDate: new Date(),
      saleEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      raffleDateTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
      organizador: organizador,
    } as any);

    const savedSorteo: any = await this.sorteoRepo.save(sorteo as any);

    // crear boletos (guardar uno por uno para evitar problemas de tipado)
    const maxNumber = startNumber + numbersQuantity;
    for (let i = startNumber; i < maxNumber; i++) {
      const b = this.boletoRepo.create({ number: i.toString(), price: 10.0, isReserved: false, sorteo: savedSorteo } as any);
      await this.boletoRepo.save(b as any);
    }

    return { sorteoId: (savedSorteo && savedSorteo.id) ? savedSorteo.id : null };
  }
}
