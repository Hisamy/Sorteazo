import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Boleto } from '../boletos/entities/boleto.entity';
import { Comprobante } from './entities/comprobante.entity';
import { EstadoPago, TipoPago } from './enums/pagos.enum';
import { CreatePagoDto } from './dto/create-pago.dto';
import { EstadoBoleto } from '../boletos/enums/boleto.enum';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Boleto)
    private readonly boletoRepository: Repository<Boleto>,
    @InjectRepository(Comprobante)
    private readonly comprobanteRepository: Repository<Comprobante>,
  ) {}

  async create(createPagoDto: CreatePagoDto, userId: string, file: Express.Multer.File) {
    const { boletoId, paymentMethod } = createPagoDto;

    const boleto = await this.boletoRepository.findOne({
      where: { id: boletoId },
      relations: ['client', 'pago'],
    });

    if (!boleto) {
      throw new NotFoundException(`Ticket with ID ${boletoId} not found.`);
    }

    if (!boleto.client || boleto.client.userId !== userId) {
      throw new ConflictException('This ticket is not reserved under your name.');
    }

    if (boleto.pago) {
      throw new ConflictException('This ticket already has an associated payment.');
    }

    if (paymentMethod === TipoPago.TRANSFER && !file) {
      throw new BadRequestException('A receipt is required for transfer payments.');
    }

    let comprobantePago: Comprobante | null = null;
    if (file) {
      const newComprobante = this.comprobanteRepository.create({
        imageUrl: `/uploads/${file.filename}`,
      });
      comprobantePago = await this.comprobanteRepository.save(newComprobante);
    }
    
    const newPago = this.pagoRepository.create({
      boleto: boleto,
      amount: boleto.price,
      paymentMethod,
      status: EstadoPago.PENDING, 
      comprobante: comprobantePago || undefined,
    });

    const savedPago = await this.pagoRepository.save(newPago);

    await this.boletoRepository.update(boleto.id, { 
      status: EstadoBoleto.PENDING_PAYMENT 
    });

    return savedPago;
  }

  async confirmPayment(pagoId: string, organizadorId: string) {
    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: ['boleto', 'boleto.sorteo', 'boleto.sorteo.organizador']
    });

    if (!pago) throw new NotFoundException(`Payment with ID ${pagoId} not found.`);
    
    if (!pago.boleto) {
       throw new ConflictException('Inconsistency: Payment exists but has no linked Ticket.');
    }

    const organizador = pago.boleto.sorteo?.organizador;

    if (!organizador) {
       throw new ConflictException('Incomplete data: Ticket has no organizer associated.');
    }

    const orgIdFromDb = organizador.userId || (organizador as any).user?.id || (organizador as any).id;

    if (orgIdFromDb !== organizadorId) {
      throw new ForbiddenException('You are not authorized to manage this payment.');
    }
    
    if (pago.status !== EstadoPago.PENDING) {
      throw new ConflictException('This payment has already been processed.');
    }

    // Actualizar estado del pago
    pago.status = EstadoPago.PAID;
    await this.pagoRepository.save(pago);

    // Actualizar estado del boleto - limpiar deadline ya que está pagado
    const boleto = await this.boletoRepository.findOne({ where: { id: pago.boleto.id } });
    if (boleto) {
      boleto.status = EstadoBoleto.PAID;
      boleto.paymentDeadline = null; // Ya no hay deadline, está pagado
      await this.boletoRepository.save(boleto);
    }

    return pago;
  }

  async rejectPayment(pagoId: string, organizadorId: string) {
    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: ['boleto', 'boleto.sorteo', 'boleto.sorteo.organizador']
    });

    if (!pago) throw new NotFoundException(`Payment with ID ${pagoId} not found.`);

    const organizador = pago.boleto?.sorteo?.organizador;

    if (!organizador) {
        throw new ConflictException('Incomplete data: Ticket has no organizer associated.');
    }

    const orgIdFromDb = organizador.userId || (organizador as any).user?.id || (organizador as any).id;

    if (orgIdFromDb !== organizadorId) {
      throw new ForbiddenException('You are not authorized to manage this payment.');
    }

    if (pago.status !== EstadoPago.PENDING) {
      throw new ConflictException('This payment has already been processed.');
    }

    // Actualizar estado del pago
    pago.status = EstadoPago.REJECTED;
    await this.pagoRepository.save(pago);

    // Actualizar estado del boleto - volver a disponible y limpiar todos los datos
    const boleto = await this.boletoRepository.findOne({ where: { id: pago.boleto.id } });
    if (boleto) {
      boleto.status = EstadoBoleto.AVAILABLE;
      boleto.client = null;
      boleto.fechaReserva = null;
      boleto.paymentDeadline = null;
      await this.boletoRepository.save(boleto);
    }

    return pago;
  }

  // async createOnlinePayment(boletoId: string, userId: string) {
  //   const boleto = await this.boletoRepository.findOne({
  //     where: { id: boletoId },
  //     relations: ['client', 'pago'],
  //   });

  //   if (!boleto) throw new NotFoundException(`Ticket with ID ${boletoId} not found.`);
  //   if (!boleto.client || boleto.client.userId !== userId) throw new ConflictException('This ticket is not reserved under your name.');
  //   if (boleto.pago) throw new ConflictException('This ticket already has an associated payment attempt.');

  //   const simulatedClientSecret = `pi_${crypto.randomUUID()}_secret`;

  //   const newPago = this.pagoRepository.create({
  //     boleto: boleto,
  //     amount: boleto.price,
  //     paymentMethod: TipoPago.ONLINE,
  //     status: EstadoPago.PENDING,
  //   });
    
  //   const savedPago = await this.pagoRepository.save(newPago);

  //   await this.boletoRepository.update(boleto.id, { 
  //     status: EstadoBoleto.PENDING_PAYMENT 
  //   });

  //   return {
  //     message: 'Payment intent created successfully (simulated).',
  //     clientSecret: simulatedClientSecret,
  //     pagoId: savedPago.id
  //   };
  // }

  async simulateFullOnlinePayment(boletoId: string, userId: string) {
    const boleto = await this.boletoRepository.findOne({
      where: { id: boletoId },
      relations: ['client', 'pago'],
    });

    if (!boleto) throw new NotFoundException(`El boleto con ID ${boletoId} no existe.`);

    if (!boleto.client || boleto.client.userId !== userId) {
      throw new ConflictException('Este boleto no está reservado a tu nombre.');
    }

    if (boleto.pago) throw new ConflictException('Este boleto ya tiene un pago registrado.');

    const newPago = this.pagoRepository.create({
      boleto: boleto,
      amount: boleto.price,
      paymentMethod: TipoPago.ONLINE,
      status: EstadoPago.PAID, 
      lastCardDigits: '4242',
      cardType: 'VISA',
    });

    const savedPago = await this.pagoRepository.save(newPago);

    // Actualizar boleto a pagado y limpiar deadline
    const boletoToUpdate = await this.boletoRepository.findOne({ where: { id: boleto.id } });
    if (boletoToUpdate) {
      boletoToUpdate.status = EstadoBoleto.PAID;
      boletoToUpdate.paymentDeadline = null; // Ya no hay deadline, está pagado
      await this.boletoRepository.save(boletoToUpdate);
    }

    return {
      message: 'Pago simulado con éxito. El boleto ha sido pagado.',
      pago: savedPago,
      boletoStatus: EstadoBoleto.PAID
    };
  }

  // async handleSimulatedPaymentSuccess(pagoId: string) {
  //   const pago = await this.pagoRepository.findOne({
  //     where: { id: pagoId },
  //     relations: ['boleto'],
  //   });

  //   if (!pago) {
  //     throw new NotFoundException(`Payment with ID ${pagoId} not found.`);
  //   }

  //   if (pago.paymentMethod !== TipoPago.ONLINE) {
  //     throw new BadRequestException('This action is only for online payments.');
  //   }

  //   if (pago.status !== EstadoPago.PENDING) {
  //     return pago;
  //   }

  //   pago.status = EstadoPago.PAID;
    
  //   await this.pagoRepository.save(pago);
  //   await this.boletoRepository.update(pago.boleto.id, { 
  //     status: EstadoBoleto.PAID 
  //   });

  //   return pago;
  // }

  // findAll() {
  //   return `This action returns all pagos`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} pago`;
  // }

  // update(id: number, updatePagoDto: UpdatePagoDto) {
  //   return `This action updates a #${id} pago`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pago`;
  // }
}