import { Test, TestingModule } from '@nestjs/testing';
import { 
  INestApplication, 
  ValidationPipe, 
  CanActivate, 
  ExecutionContext, 
  HttpStatus 
} from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSorteoDto } from '../src/sorteos/dto/create-sorteo.dto';
import { SorteosModule } from '../src/sorteos/sorteos.module';
import { Sorteo } from '../src/sorteos/entities/sorteo.entity';
import { Boleto } from '../src/boletos/entities/boleto.entity';
import { Premio } from '../src/sorteos/entities/premio.entity';
import { Organizador } from '../src/users/entities/organizador.entity';
import { AuthGuard } from '@nestjs/passport';



// 1. --- Mocks de Repositorios ---
const mockSorteoRepository = {
  create: jest.fn(),
  save: jest.fn(),
};
const mockBoletoRepository = {
  create: jest.fn(),
};
const mockPremioRepository = {
  create: jest.fn(),
};
const mockOrganizadorRepository = {
  findOneBy: jest.fn(),
};

// 2. --- Mocks de Usuarios (para el Guard) ---
const mockOrganizadorUser = {
  sub: 'organizador-uuid-123',
  role: 'organizador',
};

const mockRegularUser = {
  sub: 'user-uuid-456',
  role: 'user', // Rol diferente a 'organizador'
};

// Variable global para controlar qué usuario está "logueado" en el test
let currentUser = mockOrganizadorUser;

// 3. --- Mock del Guard de Autenticación ---
// Simula el JwtAuthGuard, inyectando el 'currentUser' en el request
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = currentUser; // Asignamos el usuario mock
    return true;
  }
}

// 4. --- Inicio del Test Suite ---
describe('SorteosController (E2E) - POST /sorteos', () => {
  let app: INestApplication;
  let server: any; // Servidor HTTP para supertest

  // DTO de prueba base
  const createSorteoDto: CreateSorteoDto = {
    title: 'Sorteo E2E Test',
    ticketPrice: 50,
    numbersQuantity: 100,
    startNumber: 1,
    imageUrl: 'http://example.com/image.png',
    description: 'Descripción del sorteo E2E',
    paymentDeadline: new Date(Date.now() + 86400000),
    saleStartDate: new Date(),
    saleEndDate: new Date(),
    raffleDateTime: new Date(Date.now()),
    premios: [
      { name: 'Premio 1', place: 1, imageUrl: '', description: 'Primer lugar' },
      { name: 'Premio 2', place: 2, imageUrl: '', description: 'Segundo lugar' },
    ],
  };

  // --- Configuración (beforeAll) ---
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SorteosModule], // El módulo que quieres probar
    })
      // Sobrescribir los providers reales por nuestros mocks
      .overrideProvider(getRepositoryToken(Sorteo))
      .useValue(mockSorteoRepository)
      .overrideProvider(getRepositoryToken(Boleto))
      .useValue(mockBoletoRepository)
      .overrideProvider(getRepositoryToken(Premio))
      .useValue(mockPremioRepository)
      .overrideProvider(getRepositoryToken(Organizador))
      .useValue(mockOrganizadorRepository)
      // Sobrescribir el Guard de autenticación
      .overrideGuard(AuthGuard) 
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Aplicar el ValidationPipe global para probar DTOs
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true 
    }));

    await app.init();
    server = app.getHttpServer();
  });


  // --- Resetear Mocks (beforeEach) ---
  beforeEach(() => {
    // Limpiamos el historial de llamadas de todos los mocks
    jest.clearAllMocks();
    // Restauramos el usuario por defecto (organizador)
    currentUser = mockOrganizadorUser;
  });

  // --- Casos de Prueba ---

  it('debería CREAR un sorteo (201) si el usuario es "organizador" y el DTO es válido', async () => {
    // Arrange: Preparamos los mocks que el servicio usará
    const mockOrganizador = { userId: mockOrganizadorUser.sub, name: 'Org Test' };
    const expectedSavedSorteo = { id: 1, ...createSorteoDto, organizador: mockOrganizador };

    // Simular que findOneBy encuentra al organizador
    mockOrganizadorRepository.findOneBy.mockResolvedValue(mockOrganizador);
    
    // Simular los 'create' (solo devuelven el objeto)
    mockBoletoRepository.create.mockImplementation((dto) => dto);
    mockPremioRepository.create.mockImplementation((dto) => dto);
    mockSorteoRepository.create.mockImplementation((dto) => dto);

    // Simular que 'save' devuelve el sorteo guardado con ID
    mockSorteoRepository.save.mockResolvedValue(expectedSavedSorteo);

    // Act (Actuar)
    const response = await request(server)
      .post('/sorteos')
      .send(createSorteoDto)
      .expect(HttpStatus.CREATED); // Assert (Verificar estado)

    // Assert (Verificar respuesta y mocks)
    expect(response.body.id).toEqual(expectedSavedSorteo.id);
    expect(response.body.title).toEqual(createSorteoDto.title);
    expect(response.body.organizador.userId).toEqual(mockOrganizadorUser.sub);
    
    // Verificar que los mocks fueron llamados como se esperaba
    expect(mockOrganizadorRepository.findOneBy).toHaveBeenCalledWith({ userId: mockOrganizadorUser.sub });
    expect(mockBoletoRepository.create).toHaveBeenCalledTimes(createSorteoDto.numbersQuantity);
    expect(mockPremioRepository.create).toHaveBeenCalledTimes(createSorteoDto.premios.length);
    expect(mockSorteoRepository.save).toHaveBeenCalled();
  });

  it('debería fallar (401 Unauthorized) si el usuario NO tiene el rol "organizador"', async () => {
    // Arrange: Cambiamos al usuario que no tiene permisos
    currentUser = mockRegularUser;

    // Act
    const response = await request(server)
      .post('/sorteos')
      .send(createSorteoDto)
      .expect(HttpStatus.UNAUTHORIZED); // Assert (Verificar estado)

    // Assert (Verificar mensaje de error)
    expect(response.body.message).toContain('Organizador rol required');
    
    // Verificar que el servicio NUNCA fue llamado
    expect(mockOrganizadorRepository.findOneBy).not.toHaveBeenCalled();
    expect(mockSorteoRepository.save).not.toHaveBeenCalled();
  });

  it('debería fallar (400 Bad Request) si el DTO es inválido (ej. falta el título)', async () => {
    // Arrange
    const invalidDto: any = { ...createSorteoDto };
    delete invalidDto.title; // Hacemos el DTO inválido

    // Act
    const response = await request(server)
      .post('/sorteos')
      .send(invalidDto)
      .expect(HttpStatus.BAD_REQUEST); // Assert (Verificar estado)

    // Assert (Verificar mensaje de error del ValidationPipe)
    // (El mensaje exacto puede variar según la configuración de tu pipe)
    expect(response.body.message).toEqual(expect.arrayContaining([
      "title must be a string", // o el mensaje que tengas en tu DTO
    ]));

    // Verificar que el servicio NUNCA fue llamado
    expect(mockSorteoRepository.save).not.toHaveBeenCalled();
  });

  it('debería fallar (404 Not Found) si el organizador (usuario) no se encuentra en la BD', async () => {
    // Arrange: El usuario está autenticado (organizador), pero el servicio no lo encuentra
    
    // Simular que findOneBy NO encuentra al organizador
    mockOrganizadorRepository.findOneBy.mockResolvedValue(null);

    // Act
    const response = await request(server)
      .post('/sorteos')
      .send(createSorteoDto)
      .expect(HttpStatus.NOT_FOUND); // Assert (Verificar estado)

    // Assert (Verificar mensaje de error del servicio)
    expect(response.body.message).toContain(`Organizador con userId ${mockOrganizadorUser.sub} no encontrado`);

    // Verificar que el 'save' nunca se llamó
    expect(mockSorteoRepository.save).not.toHaveBeenCalled();
  });
});