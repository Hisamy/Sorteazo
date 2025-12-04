import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { ReserveBoletoDto } from './dto/reserve-boleto.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Sorteo } from '../sorteos/entities/sorteo.entity';
import { Boleto } from './entities/boleto.entity';
import { Client } from './../users/entities/client.entity';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Sorteo)
    private sorteoRepository: Repository<Sorteo>,
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>
    ,private readonly httpService: HttpService
  ) { }

  private async notifyOrganizerOfReservation(sorteo: Sorteo, boletos: Boleto[], clientId: string) {
    const organizerEmail = sorteo.organizador?.user?.email;
    if (!organizerEmail) return;
    const payload = {
      template: 'generic',
      destinatarios: organizerEmail,
      titulo: 'Nuevas reservas de boletos',
      descripcion: `Se reservaron ${boletos.length} boletos en el sorteo "${sorteo.title}". Números: ${boletos.map(b => b.number).join(', ')}. Cliente ID: ${clientId}`,
      fechaEnvio: new Date().toISOString()
    };
    await this.sendNotification(payload);
  }

  private async notifyClientImmediate(clientEmail: string, sorteoTitle: string, reservedNumbers: string[], total: number) {
    if (!clientEmail) return;
    const payload = {
      template: 'generic',
      destinatarios: clientEmail,
      titulo: 'Reserva de boletos confirmada',
      descripcion: `Tu reserva en el sorteo "${sorteoTitle}" fue registrada. Números: ${reservedNumbers.join(', ')}. Total: $${total}`,
      fechaEnvio: new Date().toISOString()
    };
    await this.sendNotification(payload);
  }

  private async schedulePaymentReminder(clientEmail: string, paymentDeadlineIso: string, reservedNumbers: string[]) {
    if (!clientEmail || !paymentDeadlineIso) return;
    const payload = {
      template: 'generic',
      destinatarios: clientEmail,
      titulo: 'Recordatorio: pago pendiente',
      descripcion: `Tienes hasta el ${paymentDeadlineIso} para completar el pago de los boletos reservados: ${reservedNumbers.join(', ')}`,
      fechaEnvio: paymentDeadlineIso
    };
    await this.sendNotification(payload);
  }

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
      relations: ['boletos', 'organizador', 'organizador.user'],
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

    // notificar al organizador (no bloquea la reserva si falla)
    await this.notifyOrganizerOfReservation(sorteo, boletos, clientId);

    return {
      message: 'Boletos reservados exitosamente',
      reservedNumbers: boletos.map(b => b.number),
      total: boletos.reduce((sum, b) => sum + b.price, 0),
      sorteo: {
        id: sorteo.id,
        title: sorteo.title,
        organizerEmail: sorteo.organizador?.user?.email || null
      }
    };
  }

  update(id: number, updateBoletoDto: UpdateBoletoDto) {
    return `This action updates a #${id} boleto`;
  }

  remove(id: number) {
    return `This action removes a #${id} boleto`;
  }

  private getNotifyEndpoint() {
    const notificationsUrl = process.env.NOTIFICATIONS_URL || 'http://localhost:3000';
    return `${notificationsUrl}/notify`;
  }

  private async sendNotification(payload: Record<string, any>) {
    const url = this.getNotifyEndpoint();
    try {
      await lastValueFrom(this.httpService.post(url, payload));
      return true;
    } catch (err) {
      console.warn('Error enviando notificación:', err?.message || err);
      return false;
    }
  }
}
