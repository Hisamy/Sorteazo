import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sorteo } from './entities/sorteo.entity';
import { Boleto } from '../boletos/entities/boleto.entity';
import { Organizador } from '../users/entities/organizador.entity';
import { Premio } from './entities/premio.entity';
import { relative } from 'path';
import { Not } from 'typeorm';

@Injectable()
export class SorteosService {
  constructor(
    @InjectRepository(Sorteo) private readonly sorteoRepository,
    @InjectRepository(Boleto) private readonly boletoRepository,
    @InjectRepository(Premio) private readonly premioRepository,
    @InjectRepository(Organizador) private readonly organizadorRepository
  ) { }

  async create(
    createSorteoDto: CreateSorteoDto,
    idOrganizador: string,
    files?: { imagenSorteo?: Express.Multer.File[], imagenesPremios?: Express.Multer.File[] }
  ) {
    const organizador = await this.organizadorRepository.findOneBy({ userId: idOrganizador });
    if (!organizador) throw new NotFoundException("There is not an Organizador at the database.")
    const boletos: Boleto[] = [];
    const premios: Premio[] = [];

    let maxNumber: number = createSorteoDto.startNumber + createSorteoDto.numbersQuantity;
    for (let i = createSorteoDto.startNumber; i < maxNumber; i++) {
      const boleto: Boleto = this.boletoRepository.create({
        number: i.toString(),
        price: createSorteoDto.ticketPrice
      })
      boletos.push(boleto);
    }

    const imagenSorteoUrl = files?.imagenSorteo?.[0]
      ? `/uploads/${files.imagenSorteo[0].filename}`
      : createSorteoDto.imageUrl || '';

    if (createSorteoDto.premios && Array.isArray(createSorteoDto.premios)) {
      createSorteoDto.premios.forEach((p, index) => {
        const imagenPremioUrl = files?.imagenesPremios?.[index]
          ? `/uploads/${files.imagenesPremios[index].filename}`
          : p.imageUrl || '';

        const premio: Premio = this.premioRepository.create({
          name: p.name,
          place: p.place,
          imageUrl: imagenPremioUrl,
          description: p.description || ''
        })
        premios.push(premio)
      })
    }

    const sorteo: Sorteo = this.sorteoRepository.create({
      title: createSorteoDto.title,
      ticketPrice: createSorteoDto.ticketPrice,
      numbersQuantity: createSorteoDto.numbersQuantity,
      startNumber: createSorteoDto.startNumber,
      imageUrl: imagenSorteoUrl,
      description: createSorteoDto.description,
      paymentDeadlineDays: createSorteoDto.paymentDeadlineDays,
      saleStartDate: createSorteoDto.saleStartDate,
      saleEndDate: createSorteoDto.saleEndDate,
      raffleDateTime: createSorteoDto.raffleDateTime,
      organizador: organizador,
      boletos: boletos
    });

    premios.forEach(premio => {
      premio.sorteo = sorteo;
    });
    boletos.forEach(boleto => {
      boleto.sorteo = sorteo;
    });

    sorteo.premios = premios;

    const savedSorteo = await this.sorteoRepository.save(sorteo);

    if (savedSorteo.premios) {
      savedSorteo.premios.forEach(premio => {
        delete premio.sorteo;
      });
    }
    if (savedSorteo.boletos) {
      savedSorteo.boletos.forEach(boleto => {
        delete boleto.sorteo;
      });
    }

    return savedSorteo;
  }

  async findAll() {
    return await this.sorteoRepository.find({
      relations: ['organizador', 'premios']
    });
  }

  async findAllByOrganizador(idOrganizador: string) {
    const sorteos = await this.sorteoRepository.find({
      where: {
        organizador: {
          userId: idOrganizador
        }
      },
      relations: ['organizador', 'premios']
    });

    if (!sorteos) throw new NotFoundException(`Sorteos for organizador with id ${idOrganizador} not found.`);

    return sorteos;
  }

  async findOne(id: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id },
      relations: ['organizador', 'premios', 'boletos']
    });

    if (!sorteo) throw new NotFoundException(`Sorteo with id ${id} not found.`);

    return sorteo;
  }

  async update(
    idSorteo: string,
    updateSorteoDto: UpdateSorteoDto,
    idOrganizador: string,
    files?: { imagenSorteo?: Express.Multer.File[] } // <<-- ACEPTA EL ARCHIVO
  ) {

    const existingSorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador'],
    }); 
    
    const saleStart: Date = updateSorteoDto.saleStartDate
      ? new Date(updateSorteoDto.saleStartDate)
      : existingSorteo.saleStartDate;

    const saleEnd: Date = updateSorteoDto.saleEndDate
      ? new Date(updateSorteoDto.saleEndDate)
      : existingSorteo.saleEndDate;

    const raffleDT: Date = updateSorteoDto.raffleDateTime
      ? new Date(updateSorteoDto.raffleDateTime)
      : existingSorteo.raffleDateTime;


    if (saleStart >= saleEnd) {
      throw new BadRequestException("La fecha de inicio NO puede ser posterior o igual a la fecha fin.");
    }

    if (saleEnd >= raffleDT) {
      throw new BadRequestException("La fecha de fin de venta debe ser ANTES del sorteo.");
    }

    // ------------------------
    // Armamos solo los campos permitidos
    // ------------------------
    const allowedUpdates: Partial<Sorteo> = {};

    if (updateSorteoDto.title !== undefined)
      allowedUpdates.title = updateSorteoDto.title;
    
    if (updateSorteoDto.description !== undefined)
      allowedUpdates.description = updateSorteoDto.description;

    if (updateSorteoDto.paymentDeadlineDays !== undefined)
      allowedUpdates.paymentDeadlineDays = updateSorteoDto.paymentDeadlineDays;

    // Lógica de Imagen (Similar a CREATE)
    const imagenSorteoFile = files?.imagenSorteo?.[0]; // Obtener el archivo

    if (imagenSorteoFile) {
      // Si se subió un nuevo archivo, usamos su URL
      allowedUpdates.imageUrl = `/uploads/${imagenSorteoFile.filename}`;
    } else if (updateSorteoDto.imageUrl !== undefined) {
      // Si el DTO tiene un valor explícito (para limpiar o mantener una URL)
      allowedUpdates.imageUrl = updateSorteoDto.imageUrl;
    }

    // Asignamos las fechas convertidas solo si se proporcionaron en el DTO
    if (updateSorteoDto.saleStartDate !== undefined)
      allowedUpdates.saleStartDate = saleStart;

    if (updateSorteoDto.saleEndDate !== undefined)
      allowedUpdates.saleEndDate = saleEnd;

    if (updateSorteoDto.raffleDateTime !== undefined)
      allowedUpdates.raffleDateTime = raffleDT;

    // MERGE y SAVE...
    const sorteoToUpdate = this.sorteoRepository.merge(
      existingSorteo,
      allowedUpdates,
    );

    const updated = await this.sorteoRepository.save(sorteoToUpdate);

    delete updated.organizador;

    return updated;
  }


  async remove(idSorteo: string, idOrganizador: string) {

    const sorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador']
    });

    if (!sorteo) {
      throw new NotFoundException(`El sorteo con id ${idSorteo} no existe.`);
    }

    console.log(sorteo.organizador.userId);
    console.log(idOrganizador);

    if (sorteo.organizador.userId !== idOrganizador) {
      throw new NotFoundException(`No tienes permisos para modificar este recurso.`);
    }

    const boletosVendidos = await this.boletoRepository.count({
      where: {
        sorteo: { id: idSorteo },
        isReserved: true
      }
    });

    if (boletosVendidos > 0) {
      throw new ConflictException(`No se puede eliminar el sorteo debido a que cuenta con ${boletosVendidos} boletos comprados o reservados.`);
    }

    await this.sorteoRepository.remove(sorteo);
  }
}
