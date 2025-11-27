import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { PagosController } from '../src/pagos/pagos.controller'; 
import { PagosService } from '../src/pagos/pagos.service';
import { AuthGuard } from '@nestjs/passport';

describe('PagosController (E2E)', () => {
  let app: INestApplication;
  
  // 1. Mock del Servicio: Definimos qué debe responder el servicio sin ir a la BD
  const mockPagosService = {
    create: jest.fn(),
    simulateFullOnlinePayment: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // 2. Mock del Usuario: Variable dinámica para cambiar entre 'client' y otros roles
  let mockUser = { sub: 'user-uuid-123', role: 'client' };

  // 3. Mock del AuthGuard: Para saltarnos la validación real de JWT
  const mockAuthGuard = {
    canActivate: (context) => {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser; // Inyectamos el usuario simulado
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
          useValue: mockPagosService,
        },
      ],
    })
    .overrideGuard(AuthGuard('jwt')) // Sobrescribimos el guard real
    .useValue(mockAuthGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    
    // Importante: Habilitar validaciones globales si las usas en main.ts (DTOS)
    app.useGlobalPipes(new ValidationPipe({ transform: true })); 
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Resetear mocks antes de cada test
    jest.clearAllMocks();
    mockUser = { sub: 'user-uuid-123', role: 'client' }; // Reset usuario a cliente
  });

  // --- SECCIÓN DE TESTS ---

  describe('POST /pagos/transfer', () => {
    const boletoId = '550e8400-e29b-41d4-a716-446655440000'; 

    it('Debe crear un pago por transferencia exitosamente con archivo', async () => {
      mockPagosService.create.mockResolvedValue({
        id: 'pago-id-1',
        status: 'PENDIENTE',
        comprobante: { imageUrl: '/uploads/fake.jpg' }
      });

      const fileBuffer = Buffer.from('fake-image-content');

      return request(app.getHttpServer())
        .post('/pagos/transfer')
        .field('boletoId', boletoId)
        .field('paymentMethod', 'TRANSFERENCIA') // <--- AGREGA ESTA LÍNEA
        .attach('comprobantePago', fileBuffer, 'recibo.jpg') 
        .expect(201)
        // ... resto del test
    });

    it('Debe fallar si no se adjunta el archivo (400 Bad Request)', async () => {
      return request(app.getHttpServer())
        .post('/pagos/transfer')
        .send({ 
            boletoId,
            paymentMethod: 'TRANSFERENCIA' // <--- AGREGA ESTO TAMBIÉN AQUÍ
        }) 
        .expect(400)
        .expect((res) => {
          // Ahora sí pasará la validación del DTO y llegará a tu check del archivo
          expect(res.body.message).toContain('Payment receipt file is required');
        });
    });

    it('Debe fallar si el usuario no es role "client" (401 Unauthorized)', async () => {
      mockUser = { sub: 'admin-id', role: 'admin' };
      const fileBuffer = Buffer.from('fake');

      return request(app.getHttpServer())
        .post('/pagos/transfer')
        .field('boletoId', boletoId)
        .field('paymentMethod', 'TRANSFERENCIA') // <--- Y AQUÍ TAMBIÉN
        .attach('comprobantePago', fileBuffer, 'recibo.jpg')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Solo los clientes pueden registrar pagos');
        });
    });

    it('Debe fallar si el boletoId no es un UUID válido (400 Bad Request)', async () => {
        const fileBuffer = Buffer.from('fake');
        return request(app.getHttpServer())
          .post('/pagos/transfer')
          .field('boletoId', 'id-invalido-123') 
          .attach('comprobantePago', fileBuffer, 'recibo.jpg')
          .expect(400); // Falla por ValidationPipe @IsUUID
    });
  });

  describe('POST /pagos/simulate-online', () => {
    const boletoId = '550e8400-e29b-41d4-a716-446655440000';

    it('Debe simular el pago online exitosamente', async () => {
      mockPagosService.simulateFullOnlinePayment.mockResolvedValue({
        message: 'Pago simulado',
        boletoStatus: 'PAGADO'
      });

      return request(app.getHttpServer())
        .post('/pagos/simulate-online') // Asegúrate que la ruta coincida con tu controller
        .send({ boletoId })
        .expect(201)
        .expect((res) => {
          expect(res.body.boletoStatus).toBe('PAGADO');
          expect(mockPagosService.simulateFullOnlinePayment).toHaveBeenCalledWith(
            boletoId, 
            'user-uuid-123'
          );
        });
    });
  });

  describe('GET /pagos', () => {
    it('Debe retornar lista de pagos', async () => {
      mockPagosService.findAll.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/pagos')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /pagos/:id', () => {
    it('Debe retornar un pago específico', async () => {
      mockPagosService.findOne.mockResolvedValue({ id: 1 });
      return request(app.getHttpServer())
        .get('/pagos/1')
        .expect(200);
    });
  });
});