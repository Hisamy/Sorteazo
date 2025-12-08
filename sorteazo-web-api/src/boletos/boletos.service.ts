import { Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { ReserveBoletoDto } from './dto/reserve-boleto.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Sorteo } from '../sorteos/entities/sorteo.entity';
import { Boleto } from './entities/boleto.entity';
import { Client } from './../users/entities/client.entity';
import { EstadoBoleto } from './enums/boleto.enum';
import { ReleaseBoletoDto } from './dto/release-boleto.dto';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Sorteo)
    private sorteoRepository: Repository<Sorteo>,
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>
  ) { }
  create(createBoletoDto: CreateBoletoDto) {
    return 'This action adds a new boleto';
  }

  async findAllBySorteoForClient(id: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id },
      relations: ['boletos'],
    });

    if (!sorteo) {
      throw new NotFoundException('No existe un sorteo con ese ID');
    }

    return sorteo.boletos.map((boleto) => ({
      id: boleto.id,
      number: boleto.number,
      price: boleto.price,
      isReserved: boleto.isReserved,
    }));
  }

  /*
  TODO: Anadir paginacion
  */
  async findAllBySorteoForOrganizador(idSorteo: string, idOrganizador: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: {
        id: idSorteo,
        organizador: { userId: idOrganizador }
      },
      relations: [
        'boletos',
        'boletos.client',
        'boletos.client.user',
        'boletos.pago',
        'boletos.pago.comprobante'
      ],
    });

    if (!sorteo) {
      throw new NotFoundException('No existe un sorteo con ese ID o no cuentas con los permisos para acceder a él.');
    }

    return sorteo.boletos.map((boleto) => ({
      id: boleto.id,
      number: boleto.number,
      price: boleto.price,
      isReserved: boleto.isReserved,
      client: boleto.client
        ? {
          name: boleto.client.user?.name,
          phoneNumber: boleto.client.user?.phone
        }
        : null,
      payment: boleto.pago
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} boleto`;
  }

  async reserveBoletos(reserveBoletoDto: ReserveBoletoDto, clientId: string) {
    const { sorteoId, numbers } = reserveBoletoDto;

    if (!numbers || numbers.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos un boleto');
    }

    const sorteo = await this.sorteoRepository.findOne({
      where: { id: sorteoId },
      relations: ['boletos'],
    });

    if (!sorteo) {
      throw new NotFoundException('No existe un sorteo con ese ID');
    }
    const boletos = await this.boletoRepository.find({
      where: {
        sorteo: { id: sorteoId },
        number: In(numbers),
      },
    });

    if (boletos.length !== numbers.length) {
      throw new BadRequestException('Algunos numeros no existen en este sorteo');
    }

    const alreadyReserved = boletos.filter(boleto => boleto.isReserved);
    if (alreadyReserved.length > 0) {
      throw new ConflictException(
        `Los siguientes números ya están reservados: ${alreadyReserved.map(b => b.number).join(', ')}`
      );
    }

    const clientRef = new Client();
    clientRef.userId = clientId;

    const now = new Date();

    const paymentDeadline = new Date(now.getTime() + sorteo.paymentDeadlineDays * 24 * 60 * 60 * 1000);

    const saleEndDate = typeof sorteo.saleEndDate === 'string'
      ? new Date(sorteo.saleEndDate + 'T23:59:59.999')  // Agregar hora para forzar interpretación local
      : new Date(
        sorteo.saleEndDate.getFullYear(),
        sorteo.saleEndDate.getMonth(),
        sorteo.saleEndDate.getDate(),
        23, 59, 59, 999
      );

    const finalDeadline = paymentDeadline < saleEndDate ? paymentDeadline : saleEndDate;

    boletos.forEach(boleto => {
      boleto.isReserved = true;
      boleto.client = clientRef;
      boleto.fechaReserva = now;
      boleto.paymentDeadline = finalDeadline;
    });

    await this.boletoRepository.save(boletos);

    return {
      message: 'Boletos reservados exitosamente',
      reservedNumbers: boletos.map(b => b.number),
      total: boletos.reduce((sum, b) => sum + b.price, 0),
    };
  }

  async releaseBoletos(releaseBoletoDto: ReleaseBoletoDto, organizerUserId: string) {
    const { boletoIds } = releaseBoletoDto;

    const boletos = await this.boletoRepository.find({
      where: {
        id: In(boletoIds),
      },
      relations: ['sorteo', 'sorteo.organizador', 'pago'],
    });

    if (!boletos || boletos.length === 0) {
      throw new NotFoundException('No se encontraron los boletos solicitados');
    }

    const boletosToRelease = boletos.filter(boleto => {
      const isOwner = boleto.sorteo?.organizador?.userId === organizerUserId;
      const isReserved = boleto.isReserved || boleto.status !== EstadoBoleto.AVAILABLE;
      const isPayed = boleto.status === EstadoBoleto.PAID;

      if (isPayed) {
        throw new BadRequestException(`Ticket with ID ${boleto.id} has been already payed.`);
      }
      
      return isOwner && isReserved;
    });

    if (boletosToRelease.length === 0) {
      throw new UnauthorizedException('You don\'t have permission to release the selected tickets or they are not reserved.');
    }

    boletosToRelease.forEach(boleto => {
      boleto.isReserved = false;
      boleto.status = EstadoBoleto.AVAILABLE;
      boleto.client = null;
      boleto.fechaReserva = null;
      boleto.paymentDeadline = null;
      boleto.pago = null; 
    });

    await this.boletoRepository.save(boletosToRelease);

    return {
      message: 'Boletos liberados exitosamente',
      count: boletosToRelease.length,
      releasedIds: boletosToRelease.map(b => b.id)
    };
  }

  update(id: number, updateBoletoDto: UpdateBoletoDto) {
    return `This action updates a #${id} boleto`;
  }

  remove(id: number) {
    return `This action removes a #${id} boleto`;
  }
}
