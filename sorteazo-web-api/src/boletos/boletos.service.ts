import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sorteo } from '../sorteos/entities/sorteo.entity';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Sorteo)
    private sorteoRepository: Repository <Sorteo>,
  ){}
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

  update(id: number, updateBoletoDto: UpdateBoletoDto) {
    return `This action updates a #${id} boleto`;
  }

  remove(id: number) {
    return `This action removes a #${id} boleto`;
  }
}
