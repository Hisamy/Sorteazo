import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from './../src/app.module';

import { Boleto } from './../src/boletos/entities/boleto.entity';
import { Sorteo } from './../src/sorteos/entities/sorteo.entity';
import { User } from './../src/users/entities/user.entity';
import { Client } from './../src/users/entities/client.entity';
import { Organizador } from './../src/users/entities/organizador.entity';
import { Pago } from './../src/pagos/entities/pago.entity';

import { EstadoBoleto } from './../src/boletos/enums/boleto.enum';
import { TipoPago, EstadoPago } from './../src/pagos/enums/pagos.enum';

describe('Pagos Module (E2E Real Flow)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  
  let clientCookie: string;
  let organizadorCookie: string;

  let clientUser: User;
  let organizadorUser: User;
  let boletoTransfer: Boleto;
  let boletoOnline: Boleto;

  let boletoRepo: Repository<Boleto>;
  let sorteoRepo: Repository<Sorteo>;
  let userRepo: Repository<User>;
  let pagoRepo: Repository<Pago>;

  const timestamp = Date.now();
  const clientEmail = `client-${timestamp}@test.com`;
  const organizadorEmail = `org-${timestamp}@test.com`;
  const validPhoneClient = `55${Math.floor(10000000 + Math.random() * 90000000)}`;
  const validPhoneOrg = `33${Math.floor(10000000 + Math.random() * 90000000)}`;
  const password = 'Password123!'; 

  let pagoTransferId: string;

  jest.setTimeout(40000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    dataSource = app.get(DataSource);
    boletoRepo = dataSource.getRepository(Boleto);
    sorteoRepo = dataSource.getRepository(Sorteo);
    userRepo = dataSource.getRepository(User);
    pagoRepo = dataSource.getRepository(Pago);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('SETUP: Debe registrar y loguear al CLIENTE', async () => {
    await request(app.getHttpServer())
      .post('/users/register/client')
      .send({
        name: 'Cliente Test Pagos',
        email: clientEmail,
        password: password,
        phone: validPhoneClient,
        address: 'Calle Pruebas 123',
        zipCode: '85000'
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: clientEmail, password: password })
      .expect(200);

    const cookies = res.headers['set-cookie'];
    if (cookies) {
        const token = cookies.find((c) => c.startsWith('access_token='));
        if (token) clientCookie = token.split(';')[0];
    }
    
    clientUser = await userRepo.findOne({ 
        where: { email: clientEmail }
    });
  });

  it('SETUP: Debe registrar y loguear al ORGANIZADOR', async () => {
    await request(app.getHttpServer())
      .post('/users/register/organizador')
      .send({
        name: 'Organizador Master',
        email: organizadorEmail,
        password: password,
        phone: validPhoneOrg,
        adminName: 'El Admin Responsable'
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: organizadorEmail, password: password })
      .expect(200);

    const cookies = res.headers['set-cookie'];
    if (cookies) {
        const token = cookies.find((c) => c.startsWith('access_token='));
        if (token) organizadorCookie = token.split(';')[0];
    }

    organizadorUser = await userRepo.findOne({ where: { email: organizadorEmail } });
  });

  it('SETUP: Debe crear Sorteo y Boletos en BD', async () => {
    if (!clientUser || !organizadorUser) throw new Error('Variables de usuario indefinidas');

    const clientId = clientUser.id; 
    const organizadorId = organizadorUser.id;

    const orgExists = await dataSource.query(`SELECT user_id FROM organizadores WHERE user_id = '${organizadorId}'`);
    if (orgExists.length === 0) {
        await dataSource.query(
            `INSERT INTO organizadores (user_id, admin_name) VALUES ('${organizadorId}', 'Admin Forced')`
        );
    }

    const clientExists = await dataSource.query(`SELECT user_id FROM clients WHERE user_id = '${clientId}'`);
    if (clientExists.length === 0) {
        await dataSource.query(
            `INSERT INTO clients (user_id, adress, zip_code) VALUES ('${clientId}', 'Forced Address', '00000')`
        );
    }

    const orgEntity = await dataSource.getRepository(Organizador).findOneBy({ userId: organizadorId });

    const sorteo = await sorteoRepo.save(sorteoRepo.create({
      title: 'Sorteo E2E Pagos',
      ticketPrice: 100,
      numbersQuantity: 100,
      startNumber: 0,
      imageUrl: 'https://placehold.co/600x400',
      description: 'Test de integración pagos',
      paymentDeadline: new Date(Date.now() + 86400000),
      saleStartDate: new Date(),
      saleEndDate: new Date(Date.now() + 86400000),
      raffleDateTime: new Date(Date.now() + 172800000),
      organizador: orgEntity
    }));

    boletoTransfer = await boletoRepo.save(boletoRepo.create({
      number: '00010',
      price: 100,
      status: EstadoBoleto.RESERVED,
      sorteo: sorteo
    }));

    // Boleto para la prueba de confirmación
    const boletoConfirm = await boletoRepo.save(boletoRepo.create({
      number: '00015',
      price: 100,
      status: EstadoBoleto.RESERVED,
      sorteo: sorteo
    }));

    boletoOnline = await boletoRepo.save(boletoRepo.create({
      number: '00020',
      price: 100,
      status: EstadoBoleto.RESERVED,
      sorteo: sorteo
    }));

    await dataSource.query(
        `UPDATE boletos SET client_id = '${clientId}' WHERE id IN ('${boletoTransfer.id}', '${boletoConfirm.id}', '${boletoOnline.id}')`
    );
    
    (global as any).boletoConfirm = boletoConfirm;
  });

  describe('POST /pagos/transfer', () => {
    it('Debe permitir al cliente subir comprobante (201)', async () => {
      const fileBuffer = Buffer.from('fake-image-content');

      const res = await request(app.getHttpServer())
        .post('/pagos/transfer')
        .set('Cookie', clientCookie) 
        .field('boletoId', boletoTransfer.id)
        .field('paymentMethod', TipoPago.TRANSFER)
        .attach('comprobantePago', fileBuffer, 'recibo.jpg')
        .expect(201);

      pagoTransferId = res.body.id;

      expect(res.body.status).toBe(EstadoPago.PENDING);
      expect(res.body.comprobante).toBeDefined();
    });

    it('Debe fallar si falta el archivo (400)', async () => {
      await request(app.getHttpServer())
        .post('/pagos/transfer')
        .set('Cookie', clientCookie)
        .send({ 
          boletoId: boletoTransfer.id, 
          paymentMethod: TipoPago.TRANSFER 
        })
        .expect(400);
    });
  });

  describe('PATCH /pagos/:id/confirm (Flujo Organizador)', () => {
    it('Debe permitir al organizador aprobar el pago', async () => {
      const boletoConfirm = (global as any).boletoConfirm;
      
      console.log('🎫 Boleto a usar para confirmación:', boletoConfirm.id);
      
      // Verificar si ya tiene pago asociado
      const pagosExistentes = await pagoRepo.find({
        where: { boleto: { id: boletoConfirm.id } }
      });
      console.log('💰 Pagos existentes para este boleto:', pagosExistentes.length);
      
      // Crear un pago pendiente para este boleto
      const fileBuffer = Buffer.from('fake-receipt-for-confirm');
      
      const pagoRes = await request(app.getHttpServer())
        .post('/pagos/transfer')
        .set('Cookie', clientCookie)
        .field('boletoId', boletoConfirm.id)
        .field('paymentMethod', TipoPago.TRANSFER)
        .attach('comprobantePago', fileBuffer, 'recibo-confirm.jpg');

      console.log('📋 Status de creación de pago:', pagoRes.status);
      console.log('📄 Body de creación:', JSON.stringify(pagoRes.body, null, 2));

      if (pagoRes.status !== 201) {
        throw new Error(`Failed to create payment: ${pagoRes.status} - ${JSON.stringify(pagoRes.body)}`);
      }

      const pagoIdToConfirm = pagoRes.body.id;
      
      // Verificar usando el repository
      const pagoAntes = await pagoRepo.findOne({ 
        where: { id: pagoIdToConfirm },
        relations: ['boleto', 'boleto.sorteo', 'boleto.sorteo.organizador']
      });
      
      console.log('🔍 Pago antes de confirmar:', {
        id: pagoAntes?.id,
        status: pagoAntes?.status,
        sorteoOrganizadorId: pagoAntes?.boleto?.sorteo?.organizador?.userId
      });
      console.log('👤 Organizador intentando confirmar:', organizadorUser.id);
      
      expect(pagoAntes).toBeDefined();
      expect(pagoAntes.status).toBe(EstadoPago.PENDING);

      // Confirmar el pago
      const res = await request(app.getHttpServer())
          .patch(`/pagos/${pagoIdToConfirm}/confirm`)
          .set('Cookie', organizadorCookie);

      console.log('🔄 Status de confirmación:', res.status);
      console.log('📝 Body de confirmación:', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(EstadoPago.PAID);

      // Verificar usando repository
      const boletoActualizado = await boletoRepo.findOne({
        where: { id: boletoConfirm.id }
      });
      expect(boletoActualizado.status).toBe(EstadoBoleto.PAID);
    });
  });

  describe('POST /pagos/simulate-online', () => {
    it('Debe simular pago online y aprobar inmediatamente', async () => {
      const res = await request(app.getHttpServer())
          .post('/pagos/simulate-online')
          .set('Cookie', clientCookie)
          .send({ boletoId: boletoOnline.id })
          .expect(201);

      // Verificar la respuesta
      expect(res.body.message).toBeDefined();
      expect(res.body.boletoStatus).toBe(EstadoBoleto.PAID);
      expect(res.body.pago).toBeDefined();
      expect(res.body.pago.status).toBe(EstadoPago.PAID);
      
      const pagoId = res.body.pago.id;

      // Verificar usando repositories en lugar de queries raw
      const pagoGuardado = await pagoRepo.findOne({
        where: { id: pagoId },
        relations: ['boleto']
      });
      
      expect(pagoGuardado).toBeDefined();
      expect(pagoGuardado.status).toBe(EstadoPago.PAID);
      expect(pagoGuardado.paymentMethod).toBe(TipoPago.ONLINE);
      
      const boletoActualizado = await boletoRepo.findOne({
        where: { id: boletoOnline.id }
      });
      expect(boletoActualizado.status).toBe(EstadoBoleto.PAID);
    });
  });
});