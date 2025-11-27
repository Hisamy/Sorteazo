import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Boleto } from '../boletos/entities/boleto.entity';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Comprobante } from './entities/comprobante.entity';
import { EstadoPago, TipoPago } from './enums/pagos.enum';
import { EstadoBoleto } from '../boletos/enums/boleto.enum';

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

    if (boleto.client?.userId !== userId) {
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

    boleto.status = EstadoBoleto.PENDING_PAYMENT;
    await this.boletoRepository.save(boleto);

    return savedPago;
  }

  async confirmarPago(pagoId: string, organizadorId: string) {
    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: ['boleto', 'boleto.sorteo', 'boleto.sorteo.organizador'],
    });

    if (!pago) throw new NotFoundException(`Payment with ID ${pagoId} not found.`);
    if (pago.boleto.sorteo.organizador.userId !== organizadorId) {
      throw new ForbiddenException('You are not authorized to manage this payment.');
    }
    if (pago.status !== EstadoPago.PENDING) {
      throw new ConflictException('This payment has already been processed.');
    }

    pago.status = EstadoPago.PAID;
    pago.boleto.status = EstadoBoleto.PAID;

    await this.boletoRepository.save(pago.boleto);
    return await this.pagoRepository.save(pago);
  }

  async rechazarPago(pagoId: string, organizadorId: string) {
    const pago = await this.pagoRepository.findOne({
      where: { id: pagoId },
      relations: ['boleto', 'boleto.sorteo', 'boleto.sorteo.organizador'],
    });

    if (!pago) throw new NotFoundException(`Payment with ID ${pagoId} not found.`);
    if (pago.boleto.sorteo.organizador.userId !== organizadorId) {
      throw new ForbiddenException('You are not authorized to manage this payment.');
    }
    if (pago.status !== EstadoPago.PENDING) {
      throw new ConflictException('This payment has already been processed.');
    }

    pago.status = EstadoPago.REJECTED;

    const boleto = pago.boleto;
    boleto.status = EstadoBoleto.AVAILABLE; 
    boleto.client = null;

    await this.boletoRepository.save(boleto);
    return await this.pagoRepository.save(pago);
  }

  async simulateFullOnlinePayment(boletoId: string, userId: string) {
    const boleto = await this.boletoRepository.findOne({
      where: { id: boletoId },
      relations: ['client', 'pago'],
    });

    if (!boleto) {
      throw new NotFoundException(`El boleto con ID ${boletoId} no existe.`);
    }

    if (boleto.client?.userId !== userId) {
      throw new ConflictException('Este boleto no está reservado a tu nombre.');
    }

    if (boleto.pago) {
      throw new ConflictException('Este boleto ya tiene un pago registrado.');
    }

    const newPago = this.pagoRepository.create({
      boleto: boleto, 
      amount: boleto.price,
      paymentMethod: TipoPago.ONLINE,
      status: EstadoPago.PAID, 
      lastCardDigits: '4242', 
      cardType: 'VISA CREDIT', 
    });

    const savedPago = await this.pagoRepository.save(newPago);

    boleto.status = EstadoBoleto.PAID;

    await this.boletoRepository.save(boleto);

    return {
      message: 'Simulación de pago exitosa',
      pago: savedPago,
      boletoStatus: boleto.status
    };
  }

  findAll() {
    return `This action returns all pagos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
