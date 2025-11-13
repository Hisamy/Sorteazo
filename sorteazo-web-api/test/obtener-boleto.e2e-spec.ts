import { Test, TestingModule } from '@nestjs/testing';
import { 
  INestApplication, 
  ValidationPipe, 
  CanActivate, 
  ExecutionContext, 
  HttpStatus 
} from '@nestjs/common';
import request from 'supertest';
import { Sorteo } from '../src/sorteos/entities/sorteo.entity';
import { Boleto } from '../src/boletos/entities/boleto.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { BoletosModule } from '../src/boletos/boletos.module';

// 1. --- Mocks de Repositorios ---
const mockSorteoRepository = {
  findOne: jest.fn(),
};

const mockBoletoRepository = {
  find: jest.fn(),
};

// 2. --- Mocks de Usuarios ---
const mockUser = {
  sub: 'user-uuid-001',
  role: 'user',
};

let currentUser = mockUser;

// 3. --- Mock del Guard de Autenticación ---
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = currentUser;
    return true;
  }
}

// 4. --- Inicio del Test Suite ---
describe('BoletosController (E2E) - GET /boletos/:sorteoId', () => {
  let app: INestApplication;
  let server: any;

  const mockBoletos = [
    { id: 'b1', number: 1, price: 50, isReserved: false },
    { id: 'b2', number: 2, price: 50, isReserved: true },
  ];

  const mockSorteo = {
    id: 's1',
    title: 'Sorteo de Prueba',
    boletos: mockBoletos,
  };

  // --- Configuración del módulo ---
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BoletosModule],
    })
      .overrideProvider(getRepositoryToken(Sorteo))
      .useValue(mockSorteoRepository)
      .overrideProvider(getRepositoryToken(Boleto))
      .useValue(mockBoletoRepository)
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    currentUser = mockUser;
  });

  // --- Casos de prueba ---

  it('debería OBTENER boletos por ID de sorteo (200)', async () => {
    mockSorteoRepository.findOne.mockResolvedValue(mockSorteo);

    const response = await request(server)
      .get(`/boletos/${mockSorteo.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([
      { id: 'b1', number: 1, price: 50, isReserved: false },
      { id: 'b2', number: 2, price: 50, isReserved: true },
    ]);
    expect(mockSorteoRepository.findOne).toHaveBeenCalledWith({
      where: { id: mockSorteo.id },
      relations: ['boletos'],
    });
  });

  it('debería retornar 404 si el sorteo no existe', async () => {
    mockSorteoRepository.findOne.mockResolvedValue(null);

    const response = await request(server)
      .get('/boletos/sorteo-inexistente')
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.message).toContain('No existe un sorteo con ese ID');
    expect(mockSorteoRepository.findOne).toHaveBeenCalled();
  });

  it('debería retornar 400 si el ID no es válido (formato incorrecto)', async () => {
    const response = await request(server)
      .get('/boletos/')
      .expect(HttpStatus.NOT_FOUND); 

    expect(response.body.message).toBeDefined();
  });
});