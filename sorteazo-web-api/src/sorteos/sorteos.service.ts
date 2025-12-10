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
import { Not } from 'typeorm';
import { UpdateBoletosInfoDto } from './dto/update-boletos.dto';
import { UpdatePremiosDto } from './dto/update-premios.dto';

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
      relations: ['organizador', 'premios', 'boletos', 'recordatorioConfig']
    });

    if (!sorteo) throw new NotFoundException(`Sorteo with id ${id} not found.`);

    return sorteo;
  }

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

    delete updated.organizador;

    return updated;
  }

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
      updatedSorteo.premios.forEach(premio => {
        delete premio.sorteo;
      });
    }

    delete updatedSorteo.organizador;

    return updatedSorteo;
  }

  async remove(idSorteo: string, idOrganizador: string) {

    const sorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador']
    });

    if (!sorteo) {
      throw new NotFoundException(`El sorteo con id ${idSorteo} no existe.`);
    }

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

  async getSorteoDashboard(raffleId: string, organizerId: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id: raffleId },
      relations: ['organizador', 'organizador.user', 'boletos'],
    });

    if (!sorteo) throw new NotFoundException('Raffle not found');

    const ownerId = sorteo.organizador.user?.id || sorteo.organizador.userId;

    if (ownerId !== organizerId) {
      throw new UnauthorizedException('You do not have permission to view this raffle dashboard');
    }

    const now = new Date();
    const endDate = new Date(sorteo.saleEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let collectedAmount = 0;
    let pendingAmount = 0;
    let soldCount = 0;
    let reservedCount = 0;
    let availableCount = 0;

    sorteo.boletos.forEach((ticket) => {
      if (ticket.status === EstadoBoleto.PAID) {
        collectedAmount += ticket.price;
        soldCount++;
      } else if (ticket.status === EstadoBoleto.PENDING_PAYMENT || ticket.status === EstadoBoleto.RESERVED) {
        pendingAmount += ticket.price;
        reservedCount++;
      } else if (ticket.status === EstadoBoleto.AVAILABLE) {
        availableCount++;
      }
    });

    return {
      sorteoId: sorteo.id,
      title: sorteo.title,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      financials: {
        collected: collectedAmount,
        pending: pendingAmount,
        totalExpected: collectedAmount + pendingAmount + (availableCount * sorteo.ticketPrice),
      },
      tickets: {
        sold: soldCount,
        reserved: reservedCount,
        available: availableCount,
        total: sorteo.numbersQuantity
      }
    };
  }

  async getDebtorsReport(raffleId: string, organizerId: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id: raffleId },
      relations: ['organizador', 'organizador.user', 'boletos', 'boletos.client', 'boletos.client.user'],
    });

    if (!sorteo) throw new NotFoundException('Raffle not found');

    const ownerId = sorteo.organizador.user?.id || sorteo.organizador.userId;

    if (ownerId !== organizerId) {
      throw new UnauthorizedException('You do not have permission to view this report');
    }

    const debtors = sorteo.boletos
      .filter(t => t.status === EstadoBoleto.PENDING_PAYMENT || t.status === EstadoBoleto.RESERVED)
      .map(t => ({
        ticketId: t.id,
        number: t.number,
        debtAmount: t.price,
        client: t.client ? {
          name: t.client.user?.name || 'Unknown User',
          phone: t.client.user?.phone || 'No Phone',
          email: t.client.user?.email
        } : 'Unknown Client',
        reservedAt: t.fechaReserva,
        paymentDeadline: t.paymentDeadline
      }));

    return debtors;
  }

  async getTicketStatusReport(raffleId: string, organizerId: string) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id: raffleId },
      relations: ['organizador', 'organizador.user', 'boletos'],
    });

    if (!sorteo) throw new NotFoundException('Raffle not found');

    const ownerId = sorteo.organizador.user?.id || sorteo.organizador.userId;

    if (ownerId !== organizerId) {
      throw new UnauthorizedException('Access denied or raffle not found');
    }

    const report = {
      sold: [] as string[],
      reserved: [] as string[],
      available: [] as string[]
    };

    sorteo.boletos.forEach(t => {
      if (t.status === EstadoBoleto.PAID) {
        report.sold.push(t.number);
      } else if (t.status === EstadoBoleto.AVAILABLE) {
        report.available.push(t.number);
      } else {
        report.reserved.push(t.number);
      }
    });

    return report;
  }

  async getHistoricalReport(organizerId: string) {
    const sorteos = await this.sorteoRepository.find({
      where: { organizador: { userId: organizerId } },
      relations: ['boletos'],
      order: { saleEndDate: 'DESC' }
    });

    return sorteos.map(sorteo => {
      let collectedAmount = 0;
      let pendingAmount = 0;
      let sold = 0;
      let unpaid = 0;
      let free = 0;

      sorteo.boletos.forEach(t => {
        if (t.status === EstadoBoleto.PAID) {
          collectedAmount += t.price;
          sold++;
        } else if (t.status === EstadoBoleto.AVAILABLE) {
          free++;
        } else {
          pendingAmount += t.price;
          unpaid++;
        }
      });

      return {
        id: sorteo.id,
        name: sorteo.title,
        drawDate: sorteo.raffleDateTime,
        status: new Date() > new Date(sorteo.raffleDateTime) ? 'FINISHED' : 'ACTIVE',
        financials: {
          collected: collectedAmount,
          pending: pendingAmount,
        },
        counts: {
          sold,
          unpaid,
          free
        }
      };
    });
  }
}