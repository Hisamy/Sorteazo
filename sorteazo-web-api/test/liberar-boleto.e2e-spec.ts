import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from './../src/app.module';

import { Boleto } from './../src/boletos/entities/boleto.entity';
import { Sorteo } from './../src/sorteos/entities/sorteo.entity';
import { User } from './../src/users/entities/user.entity';
import { Organizador } from './../src/users/entities/organizador.entity';
import { Client } from './../src/users/entities/client.entity';

import { EstadoBoleto } from './../src/boletos/enums/boleto.enum';

describe('Release Boletos Feature (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  
  // Auth Data
  let organizadorCookie: string;
  let clientCookie: string; // Used to simulate a user who reserved the ticket

  // Entities
  let organizadorUser: User;
  let clientUser: User;
  let boletoToRelease: Boleto;
  let boletoOther: Boleto;

  // Repositories
  let boletoRepo: Repository<Boleto>;
  let sorteoRepo: Repository<Sorteo>;
  let userRepo: Repository<User>;

  // Test Helpers
  const timestamp = Date.now();
  const organizadorEmail = `org-release-${timestamp}@test.com`;
  const clientEmail = `client-release-${timestamp}@test.com`;
  const password = 'Password123!'; 

  jest.setTimeout(40000); // DB operations can be slow in tests

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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. SETUP USERS (Organizer & Client)
  it('SETUP: Debe registrar y loguear al ORGANIZADOR y al CLIENTE', async () => {
    // --- Register/Login Organizer ---
    await request(app.getHttpServer())
      .post('/users/register/organizador')
      .send({
        name: 'Admin Release',
        email: organizadorEmail,
        password: password,
        phone: `33${Math.floor(10000000 + Math.random() * 90000000)}`,
        adminName: 'Super Admin'
      })
      .expect(201);

    const loginOrg = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: organizadorEmail, password: password })
      .expect(200);

    const cookiesOrg = loginOrg.headers['set-cookie'];
    if (cookiesOrg) {
        organizadorCookie = cookiesOrg.find((c) => c.startsWith('access_token=')).split(';')[0];
    }
    organizadorUser = await userRepo.findOne({ where: { email: organizadorEmail } });

    // --- Register Client (To hold the reservation) ---
    await request(app.getHttpServer())
      .post('/users/register/client')
      .send({
        name: 'Client Reserver',
        email: clientEmail,
        password: password,
        phone: `55${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: 'Calle Falsa 123',
        zipCode: '12345'
      })
      .expect(201);
      
    clientUser = await userRepo.findOne({ where: { email: clientEmail } });

    // Ensure Roles exist in specific tables (Manual Fix for E2E consistency)
    const orgExists = await dataSource.query(`SELECT user_id FROM organizadores WHERE user_id = '${organizadorUser.id}'`);
    if (orgExists.length === 0) {
        await dataSource.query(`INSERT INTO organizadores (user_id, admin_name) VALUES ('${organizadorUser.id}', 'Admin Forced')`);
    }
    const clientExists = await dataSource.query(`SELECT user_id FROM clients WHERE user_id = '${clientUser.id}'`);
    if (clientExists.length === 0) {
        await dataSource.query(`INSERT INTO clients (user_id, adress, zip_code) VALUES ('${clientUser.id}', 'Forced Address', '00000')`);
    }
  });

  // 2. SETUP DATA (Sorteo & Reserved Boleto)
  it('SETUP: Debe crear Sorteo y un Boleto RESERVADO', async () => {
    const orgEntity = await dataSource.getRepository(Organizador).findOneBy({ userId: organizadorUser.id });

    // Create Sorteo
    const sorteo = await sorteoRepo.save(sorteoRepo.create({
      title: 'Sorteo Release Test',
      ticketPrice: 50,
      numbersQuantity: 50,
      startNumber: 0,
      imageUrl: 'https://placehold.co/100x100',
      description: 'Testing release logic',
      paymentDeadlineDays: 2, // <--- ADD THIS LINE (Required by your DB Schema)
      paymentDeadline: new Date(Date.now() + 86400000),
      saleStartDate: new Date(),
      saleEndDate: new Date(Date.now() + 86400000),
      raffleDateTime: new Date(Date.now() + 172800000),
      organizador: orgEntity
    }));

    // Create a Boleto that is ALREADY RESERVED
    boletoToRelease = await boletoRepo.save(boletoRepo.create({
      number: '00005',
      price: 50,
      status: EstadoBoleto.RESERVED,
      isReserved: true,
      fechaReserva: new Date(),
      paymentDeadline: new Date(Date.now() + 3600000), 
      sorteo: sorteo
    }));

    // Manually assign the client to the boleto using SQL to ensure relation is set
    await dataSource.query(
        `UPDATE boletos SET client_id = '${clientUser.id}' WHERE id = '${boletoToRelease.id}'`
    );

    // Verify setup
    const check = await boletoRepo.findOne({ 
        where: { id: boletoToRelease.id }, 
        relations: ['client'] 
    });
    expect(check.isReserved).toBe(true);
    expect(check.client).toBeDefined();
    expect(check.client.userId).toBe(clientUser.id);
  });

  describe('PATCH /boletos/release (Feature Test)', () => {
    
    it('Debe fallar si NO se envían IDs (400)', async () => {
      await request(app.getHttpServer())
        .patch('/boletos/release')
        .set('Cookie', organizadorCookie)
        .send({}) // Empty body
        .expect(400);
    });

    it('Debe liberar los boletos exitosamente (200) y limpiar la BD', async () => {
      console.log('🔓 Intentando liberar boleto ID:', boletoToRelease.id);

      const res = await request(app.getHttpServer())
        .patch('/boletos/release')
        .set('Cookie', organizadorCookie)
        .send({
          boletoIds: [boletoToRelease.id]
        })
        .expect(200);

      // 1. Check Response
      expect(res.body.message).toContain('liberados exitosamente');
      expect(res.body.count).toBe(1);
      expect(res.body.releasedIds).toContain(boletoToRelease.id);

      // 2. Check Database State
      const boletoInDb = await boletoRepo.findOne({
        where: { id: boletoToRelease.id },
        relations: ['client']
      });

      console.log('🔍 Estado del boleto post-release:', {
        isReserved: boletoInDb.isReserved,
        status: boletoInDb.status,
        client: boletoInDb.client
      });

      // Verify specific fields are reset
      expect(boletoInDb.isReserved).toBe(false);
      expect(boletoInDb.status).toBe(EstadoBoleto.AVAILABLE);
      expect(boletoInDb.client).toBeNull();
      expect(boletoInDb.fechaReserva).toBeNull();
      expect(boletoInDb.paymentDeadline).toBeNull();
    });

    it('Debe fallar si se intenta liberar un boleto que ya está libre (401/404)', async () => {
       // Since we just released it, trying again should fail 
       // (Our service logic throws Unauthorized if list is empty after filtering)
       
       await request(app.getHttpServer())
        .patch('/boletos/release')
        .set('Cookie', organizadorCookie)
        .send({
          boletoIds: [boletoToRelease.id]
        })
        .expect(401); 
    });
  });
});