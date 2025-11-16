import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { ReserveBoletoDto } from './dto/reserve-boleto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Sorteo } from '../sorteos/entities/sorteo.entity';
import { Boleto } from './entities/boleto.entity';
import { Client } from '../users/entities/client.entity';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Sorteo)
    private sorteoRepository: Repository<Sorteo>,
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>,
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
        'boletos.pago'
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
      client_id: boleto.client?.userId,
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

    // Marcar como reservados y asignar cliente
    const clientRef = new Client();
    clientRef.userId = clientId;

    boletos.forEach(boleto => {
      boleto.isReserved = true;
      boleto.client = clientRef;
    });

    await this.boletoRepository.save(boletos);

    return {
      message: 'Boletos reservados exitosamente',
      reservedNumbers: boletos.map(b => b.number),
      total: boletos.reduce((sum, b) => sum + b.price, 0),
    };
  }

  update(id: number, updateBoletoDto: UpdateBoletoDto) {
    return `This action updates a #${id} boleto`;
  }

  remove(id: number) {
    return `This action removes a #${id} boleto`;
  }
}
