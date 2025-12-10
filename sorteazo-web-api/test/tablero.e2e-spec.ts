import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from './../src/app.module';

// Entities
import { Boleto } from './../src/boletos/entities/boleto.entity';
import { Sorteo } from './../src/sorteos/entities/sorteo.entity';
import { User } from './../src/users/entities/user.entity';
import { Organizador } from './../src/users/entities/organizador.entity';

// Enums
import { EstadoBoleto } from './../src/boletos/enums/boleto.enum';

describe('Sorteo Reports & Dashboard (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Auth Tokens/Cookies & IDs
  let organizadorCookie: string;
  let organizadorId: string;
  let clientUserId: string;

  // Repositories
  let boletoRepo: Repository<Boleto>;
  let sorteoRepo: Repository<Sorteo>;
  let userRepo: Repository<User>;
  let orgRepo: Repository<Organizador>;

  // Test Data References
  let testSorteo: Sorteo;

  // Helper variables for data generation
  const timestamp = Date.now();
  const orgEmail = `admin-dash-${timestamp}@test.com`;
  const clientEmail = `buyer-dash-${timestamp}@test.com`;
  const password = 'Password123!'; 

  jest.setTimeout(60000); 

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
    orgRepo = dataSource.getRepository(Organizador);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. SETUP USUARIOS (Organizador y Cliente)
  it('SETUP: Debe registrar y loguear al Organizador y Cliente', async () => {
    // --- 1. Register Organizer ---
    // Usamos datos dinámicos similares a tu test funcional para evitar el 400 Bad Request
    const orgData = {
      name: 'Report Admin',
      email: orgEmail,
      password: password,
      phone: `33${Math.floor(10000000 + Math.random() * 90000000)}`, // Generar teléfono válido
      adminName: 'Dashboard Master'
    };

    await request(app.getHttpServer())
      .post('/users/register/organizador')
      .send(orgData)
      .expect((res) => {
        // Loguear error si falla para debug
        if (res.status !== 201) {
            console.error('❌ Error registrando Organizador:', res.body);
        }
      })
      .expect(201);

    // --- 2. Login Organizer ---
    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: orgEmail, password: password })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error('No se recibieron cookies en el login');
    
    organizadorCookie = cookies.find((c) => c.startsWith('access_token=')).split(';')[0];
    
    const orgUser = await userRepo.findOne({ where: { email: orgEmail } });
    if (!orgUser) throw new Error('El usuario Organizador no se guardó en la BD');
    organizadorId = orgUser.id;

    // --- 3. Register Client (For Debtors Report) ---
    const clientData = {
      name: 'John Debtor',
      email: clientEmail,
      password: password,
      phone: `55${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: 'Calle Falsa 123',
      zipCode: '12345'
    };

    await request(app.getHttpServer())
      .post('/users/register/client')
      .send(clientData)
      .expect((res) => {
        if (res.status !== 201) {
            console.error('❌ Error registrando Cliente:', res.body);
        }
      })
      .expect(201);

    const clientUser = await userRepo.findOne({ where: { email: clientEmail } });
    if (!clientUser) throw new Error('El usuario Cliente no se guardó en la BD');
    clientUserId = clientUser.id;

    // Manual DB Fix: Asegurar que existan en sus tablas específicas si el registro es asíncrono o incompleto
    // Usamos ON CONFLICT DO NOTHING (o verifcamos existencia) para evitar duplicados
    const orgExists = await dataSource.query(`SELECT * FROM organizadores WHERE user_id = '${organizadorId}'`);
    if(orgExists.length === 0) {
        await dataSource.query(`INSERT INTO organizadores (user_id, admin_name) VALUES ('${organizadorId}', 'Fix Admin')`);
    }

    const clientExists = await dataSource.query(`SELECT * FROM clients WHERE user_id = '${clientUserId}'`);
    if(clientExists.length === 0) {
        await dataSource.query(`INSERT INTO clients (user_id, adress, zip_code) VALUES ('${clientUserId}', 'Fix Address', '00000')`);
    }
  });

  // 2. SETUP DATOS (Sorteo y Boletos)
  it('SETUP: Debe crear Sorteo y Boletos (Pagados, Apartados y Libres)', async () => {
    // Verificamos que los IDs existan antes de proceder para evitar el error "uuid: undefined"
    expect(organizadorId).toBeDefined();
    expect(clientUserId).toBeDefined();

    const organizadorEntity = await orgRepo.findOneBy({ userId: organizadorId });

    // --- Create Sorteo ---
    testSorteo = await sorteoRepo.save(sorteoRepo.create({
      title: 'Gran Sorteo Reportes',
      ticketPrice: 100, 
      numbersQuantity: 10,
      startNumber: 1,
      imageUrl: 'https://placehold.co/100',
      description: 'Test de finanzas',
      paymentDeadlineDays: 5,
      saleStartDate: new Date(),
      saleEndDate: new Date(Date.now() + 100000000), 
      raffleDateTime: new Date(Date.now() + 200000000),
      organizador: organizadorEntity
    }));

    // --- Create Mixed Boletos ---
    
    // 1. Boletos PAGADOS (Sold)
    await boletoRepo.save(boletoRepo.create({
      number: '1', price: 100, status: EstadoBoleto.PAID, isReserved: true, sorteo: testSorteo
    }));
    await boletoRepo.save(boletoRepo.create({
      number: '2', price: 100, status: EstadoBoleto.PAID, isReserved: true, sorteo: testSorteo
    }));

    // 2. Boleto APARTADO (Reserved/Pending)
    const boletoReserved = await boletoRepo.save(boletoRepo.create({
      number: '3', 
      price: 100, 
      status: EstadoBoleto.PENDING_PAYMENT, 
      isReserved: true, 
      fechaReserva: new Date(),
      paymentDeadline: new Date(Date.now() + 86400000),
      sorteo: testSorteo
    }));

    // Asignación manual segura
    await dataSource.query(`UPDATE boletos SET client_id = '${clientUserId}' WHERE id = '${boletoReserved.id}'`);

    // 3. Boleto LIBRE
    await boletoRepo.save(boletoRepo.create({
      number: '4', price: 100, status: EstadoBoleto.AVAILABLE, isReserved: false, sorteo: testSorteo
    }));
  });

  // --- TESTS DE REPORTES ---

  describe('GET /sorteos/:id/reports/dashboard', () => {
    it('Debe devolver los cálculos financieros correctos', async () => {
      // Validar que el sorteo se creó antes de llamar
      if (!testSorteo) throw new Error('Test Sorteo no inicializado');

      const res = await request(app.getHttpServer())
        .get(`/sorteos/${testSorteo.id}/reports/dashboard`) // Asegúrate que esta ruta coincide con tu Controller (EN/ES)
        .set('Cookie', organizadorCookie)
        .expect(200);

      const data = res.body;

      // Pagados: 2 boletos de $100 = $200
      expect(data.financials.collected).toBe(200);
      
      // Pendientes: 1 boleto de $100 = $100
      expect(data.financials.pending).toBe(100);

      expect(data.tickets.sold).toBe(2);
      expect(data.tickets.reserved).toBe(1);
    });

    it('Debe fallar (401) si falta la cookie', async () => {
        await request(app.getHttpServer())
          .get(`/sorteos/${testSorteo.id}/reports/dashboard`)
          .expect(401);
    });
  });

  describe('GET /sorteos/:id/reports/debtors', () => {
    it('Debe listar SOLO los boletos apartados con info del cliente', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/${testSorteo.id}/reports/debtors`)
        .set('Cookie', organizadorCookie)
        .expect(200);

      const debtors = res.body;
      expect(debtors.length).toBe(1); // Boleto #3
      expect(debtors[0].number).toBe('3');
      expect(debtors[0].client.name).toBe('John Debtor');
    });
  });

  describe('GET /sorteos/:id/reports/ticket-status', () => {
    it('Debe devolver arrays clasificados', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/${testSorteo.id}/reports/ticket-status`)
        .set('Cookie', organizadorCookie)
        .expect(200);

      const map = res.body;
      expect(map.sold).toContain('1');
      expect(map.sold).toContain('2');
      expect(map.reserved).toContain('3');
      expect(map.available).toContain('4');
    });
  });

  describe('GET /sorteos/organizer/reports/historical', () => {
    it('Debe devolver histórico', async () => {
      const res = await request(app.getHttpServer())
        .get('/sorteos/organizer/reports/historical') // Ajusta ruta EN/ES
        .set('Cookie', organizadorCookie)
        .expect(200);

      const history = res.body;
      const mySorteo = history.find(s => s.id === testSorteo.id);
      
      expect(mySorteo).toBeDefined();
      expect(mySorteo.financials.collected).toBe(200);
    });
  });
});