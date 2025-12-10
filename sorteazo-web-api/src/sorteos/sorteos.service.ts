import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sorteo } from './entities/sorteo.entity';
import { Boleto } from '../boletos/entities/boleto.entity';
import { EstadoBoleto } from '../boletos/enums/boleto.enum';
import { Organizador } from '../users/entities/organizador.entity';
import { Premio } from './entities/premio.entity';
import { relative } from 'path';
import { Not, Repository } from 'typeorm';

import { UpdateBoletosInfoDto } from './dto/update-boletos.dto';
import { UpdatePremiosDto } from './dto/update-premios.dto';

@Injectable()
export class SorteosService {
  constructor(
    @InjectRepository(Sorteo) private readonly sorteoRepository: Repository<Sorteo>,
    @InjectRepository(Boleto) private readonly boletoRepository: Repository<Boleto>,
    @InjectRepository(Premio) private readonly premioRepository: Repository<Premio>,
    @InjectRepository(Organizador) private readonly organizadorRepository: Repository<Organizador>
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
      savedSorteo.premios = savedSorteo.premios.map(({ sorteo: _, ...premio }) => premio as Premio);
    }
    if (savedSorteo.boletos) {
      savedSorteo.boletos = savedSorteo.boletos.map(({ sorteo: _, ...boleto }) => boleto as Boleto);
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
      relations: ['organizador', 'premios', 'boletos', 'recordatorioConfig']
    });

    if (!sorteo) throw new NotFoundException(`Sorteo with id ${id} not found.`);

    return sorteo;
  }

  /**
   * Actualiza la informacion basica de un sorteo (fechas, titulo, descripcion y dias para para pagar).
   * @param idSorteo ID del sorteo a modificar.
   * @param updateSorteoDto Objeto que contiene la informacion nueva para el sorteo.
   * @param idOrganizador ID del organizador del sorteo. (usado para validacion).
   * @param files Imagen representativa del sorteo.
   * @returns 
   */
  async updateBasicInfo(
    idSorteo: string,
    updateSorteoDto: UpdateSorteoDto,
    idOrganizador: string,
    files?: { imagenSorteo?: Express.Multer.File[] }
  ) {

    const existingSorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador'],
    });

    if (!existingSorteo) {
      throw new NotFoundException(`Sorteo con ID ${idSorteo} no encontrado.`);
    }

    if (existingSorteo.organizador.userId !== idOrganizador) {
      throw new UnauthorizedException('No tienes permisos para modificar este sorteo.');
    }

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

    const allowedUpdates: Partial<Sorteo> = {};

    if (updateSorteoDto.title !== undefined)
      allowedUpdates.title = updateSorteoDto.title;

    if (updateSorteoDto.description !== undefined)
      allowedUpdates.description = updateSorteoDto.description;

    if (updateSorteoDto.paymentDeadlineDays !== undefined)
      allowedUpdates.paymentDeadlineDays = updateSorteoDto.paymentDeadlineDays;

    const imagenSorteoFile = files?.imagenSorteo?.[0];

    if (imagenSorteoFile) {
      allowedUpdates.imageUrl = `/uploads/${imagenSorteoFile.filename}`;
    } else if (updateSorteoDto.imageUrl !== undefined) {
      allowedUpdates.imageUrl = updateSorteoDto.imageUrl;
    }

    if (updateSorteoDto.saleStartDate !== undefined)
      allowedUpdates.saleStartDate = saleStart;

    if (updateSorteoDto.saleEndDate !== undefined)
      allowedUpdates.saleEndDate = saleEnd;

    if (updateSorteoDto.raffleDateTime !== undefined)
      allowedUpdates.raffleDateTime = raffleDT;

    const sorteoToUpdate = this.sorteoRepository.merge(
      existingSorteo,
      allowedUpdates,
    );

    const updated = await this.sorteoRepository.save(sorteoToUpdate);

    const { organizador, ...sorteoSinOrganizador } = updated;

    return sorteoSinOrganizador;
  }

  /**
   * Actualiza los boletos del sorteo (cantidad de boletos, precio por unidad y numero de inicio de los mismos)
   * @param idSorteo ID del sorteo con los boletos a modificar.
   * @param updateBoletosInfoDto Objeto con los datos necesarios para la actualizacion.
   * @param idOrganizador ID del organizador del sorteo (usado para validacion).
   * @returns 
   */
  async updateBoletosInfo(
    idSorteo: string,
    updateBoletosInfoDto: UpdateBoletosInfoDto,
    idOrganizador: string
  ) {
    const existingSorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador'],
    });

    if (!existingSorteo) {
      throw new NotFoundException(`Sorteo con ID ${idSorteo} no encontrado.`);
    }

    if (existingSorteo.organizador.userId !== idOrganizador) {
      throw new UnauthorizedException('No tienes permisos para modificar este sorteo.');
    }

    const boletosVendidos = await this.boletoRepository.count({
      where: {
        sorteo: { id: idSorteo },
        isReserved: true
      }
    });

    if (boletosVendidos > 0) {
      throw new ConflictException(`No se pueden regenerar los boletos. Ya hay ${boletosVendidos} boletos vendidos o apartados.`);
    }

    const newTicketPrice = updateBoletosInfoDto.ticketPrice ?? existingSorteo.ticketPrice;
    const newNumbersQuantity = updateBoletosInfoDto.numbersQuantity ?? existingSorteo.numbersQuantity;
    const newStartNumber = updateBoletosInfoDto.startNumber ?? existingSorteo.startNumber;

    const structureChanged = (updateBoletosInfoDto.numbersQuantity !== undefined && updateBoletosInfoDto.numbersQuantity !== existingSorteo.numbersQuantity) ||
      (updateBoletosInfoDto.startNumber !== undefined && updateBoletosInfoDto.startNumber !== existingSorteo.startNumber);

    if (structureChanged) {
      await this.boletoRepository.delete({ sorteo: { id: idSorteo } });

      const newBoletos: Boleto[] = [];

      let maxNumber: number = newStartNumber + newNumbersQuantity;

      for (let i = newStartNumber; i < maxNumber; i++) {
        const boleto: Boleto = this.boletoRepository.create({
          number: i.toString(),
          price: newTicketPrice,
          sorteo: existingSorteo
        });
        newBoletos.push(boleto);
      }

      await this.boletoRepository.save(newBoletos);

    } else if (updateBoletosInfoDto.ticketPrice !== undefined && updateBoletosInfoDto.ticketPrice !== existingSorteo.ticketPrice) {

      await this.boletoRepository.update(
        { sorteo: { id: idSorteo } },
        { price: newTicketPrice }
      );
    }

    const updates: Partial<Sorteo> = {
      ticketPrice: newTicketPrice,
      numbersQuantity: newNumbersQuantity,
      startNumber: newStartNumber
    };

    const sorteoToUpdate = this.sorteoRepository.merge(existingSorteo, updates);
    const updated = await this.sorteoRepository.save(sorteoToUpdate);

    const { organizador, ...sorteoSinOrganizador } = updated;

    return sorteoSinOrganizador;
  }

  /**
   * Actualiza los premios del sorteo si el mismo no cuenta ya con boletos vendidos.
   * @param idSorteo ID del sorteo con los boletos a modificar.
   * @param updatePremiosDto Objeto con la informacion de los premios.
   * @param idOrganizador ID del organizador del sorteo (usado para validacion).
   * @param files Imagenes de los premios a guardar.
   * @returns 
   */
  async updatePremios(
    idSorteo: string,
    updatePremiosDto: UpdatePremiosDto,
    idOrganizador: string,
    files?: { imagenesPremios?: Express.Multer.File[] }
  ) {
        const existingSorteo = await this.sorteoRepository.findOne({
          where: { id: idSorteo },
          relations: ['organizador', 'premios'],
        });

        if (!existingSorteo) {
          throw new NotFoundException(`Sorteo con ID ${idSorteo} no encontrado.`);
        }

        if (existingSorteo.organizador.userId !== idOrganizador) {
          throw new UnauthorizedException('No tienes permisos para modificar este sorteo.');
        }

        const boletosVendidos = await this.boletoRepository.count({
          where: {
            sorteo: { id: idSorteo },
            isReserved: true
          }
        });

        if (boletosVendidos > 0) {
          throw new ConflictException(`No se pueden actualizar los premios. Ya hay ${boletosVendidos} boletos vendidos o apartados.`);
        }

        await this.premioRepository.delete({ sorteo: { id: idSorteo } });

        const newPremios: Premio[] = [];
        const premiosData = updatePremiosDto.premios || [];

        premiosData.forEach((p, index) => {
          const imagenPremioUrl = files?.imagenesPremios?.[index]
            ? `/uploads/${files.imagenesPremios[index].filename}`
            : p.imageUrl || '';

      const premio: Premio = this.premioRepository.create({
        name: p.name,
        place: p.place,
        imageUrl: imagenPremioUrl,
        description: p.description || '',
        sorteo: existingSorteo
      });
      newPremios.push(premio);
    });

    const savedPremios = await this.premioRepository.save(newPremios);

    existingSorteo.premios = savedPremios;
    const updatedSorteo = await this.sorteoRepository.save(existingSorteo);

    if (updatedSorteo.premios) {
      updatedSorteo.premios = updatedSorteo.premios.map(({ sorteo: _, ...premio }) => premio as Premio);
    }

    const { organizador, ...sorteoSinOrganizador } = updatedSorteo;

    return sorteoSinOrganizador;
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
        status: Not(EstadoBoleto.AVAILABLE)
      }
    });

    if (boletosVendidos > 0) {
      throw new ConflictException(`No se puede eliminar el sorteo debido a que cuenta con ${boletosVendidos} boletos comprados o reservados.`);
    }

    await this.sorteoRepository.remove(sorteo);
  }
}
