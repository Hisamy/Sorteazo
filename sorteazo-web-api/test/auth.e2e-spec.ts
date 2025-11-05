import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let clientCookie: string;
  let clientId: string;
  let organizadorId: string;

  const clientEmail = `client-${Date.now()}@test.com`;
  const organizadorEmail = `organizer-${Date.now()}@test.com`;

  const clientDto = {
    name: 'Test Client',
    email: clientEmail,
    password: 'Password123!',
    address: '123 Main St',
    zipCode: '90210',
  };

  const organizadorDto = {
    name: 'Test Organizer Name',
    adminName: 'Test Organizer',
    email: organizadorEmail,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  }, 10000);

  it('/users/register/client (POST) - Registra un cliente', () => {
    return request(app.getHttpServer())
      .post('/users/register/client')
      .send(clientDto)
      .expect(201)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.email).toEqual(clientDto.email);
        expect(res.body.id).toBeDefined();
        expect(res.body.password).toBeUndefined();
        clientId = res.body.id;
      });
  });

  it('/users/register/organizador (POST) - Registra un organizador', () => {
    return request(app.getHttpServer())
      .post('/users/register/organizador')
      .send(organizadorDto)
      .expect(201)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.email).toEqual(organizadorDto.email);
        expect(res.body.id).toBeDefined();
        organizadorId = res.body.id;
      });
  });

  it('/users/profile/me (GET) - Falla sin cookie (Unauthorized)', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .expect(401);
  });

  it('/users/login (POST) - Inicia sesión y obtiene la cookie', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: clientDto.email,
        password: clientDto.password,
      })
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual('Successful Login');
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();

        const accessTokenCookie = cookies.find((cookie) =>
          cookie.startsWith('access_token='),
        );
        expect(accessTokenCookie).toBeDefined();

        clientCookie = accessTokenCookie.split(';')[0];
        expect(clientCookie).toContain('access_token=');
      });
  });

  it('/users/profile/me (GET) - Accede al perfil con cookie (Authorized)', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Cookie', clientCookie)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.id).toEqual(clientId);
        expect(res.body.email).toEqual(clientDto.email);
        expect(res.body.role).toEqual('client');
      });
  });

  it('/users/:id (GET) - Accede a un recurso con cookie (Authorized)', () => {
    return request(app.getHttpServer())
      .get(`/users/${clientId}`)
      .set('Cookie', clientCookie)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toEqual(clientId);
        expect(res.body.email).toEqual(clientDto.email);
        expect(res.body.password).toBeFalsy();
      });
  });

  it('/users/logout (POST) - Cierra sesión y limpia la cookie', () => {
    return request(app.getHttpServer())
      .post('/users/logout')
      .set('Cookie', clientCookie)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual('Successful Logout');

        const cookies = res.headers['set-cookie'];
        const clearedCookie = cookies.find((cookie) =>
          cookie.startsWith('access_token=;'),
        );
        expect(clearedCookie).toBeDefined();
        expect(clearedCookie).toContain(
          'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );
      });
  });

  it('/users/profile/me (GET) - Falla después de logout (Unauthorized)', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .expect(401);
  });
});