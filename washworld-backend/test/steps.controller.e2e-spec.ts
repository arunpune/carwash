import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { StepsService } from 'src/steps/steps.service';

describe('Step Controller (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let token: string;
  let user: User;
  let stepsService: StepsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = moduleFixture.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    stepsService = moduleFixture.get<StepsService>(StepsService);

    // Sign up
    const userDTO = new CreateUserDto('test', 'user', 'testuser7@mail.com', '12345');
    user = await userService.create(userDTO);

    // Log in
    const loginDTO = new LoginDto('testuser7@mail.com', '12345');
    const loginResponse = await authService.login(loginDTO);
    token = loginResponse.token;

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('/steps (GET)', () => {
    it('should return 200 and an array of steps', async () => {
      const response = await request(app.getHttpServer()).get('/steps').set('Authorization', token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/steps (POST)', () => {
    it('should return 400 status code if invalid data', async () => {
      const invalidStep = { name: false };
      const response = await request(app.getHttpServer())
        .post('/steps')
        .send(invalidStep)
        .set('Authorization', token);
      expect(response.statusCode).toBe(400);
    });

    it('should return 201 and the new step after creation', async () => {
      const validStep = {
        name: 'TestStep',
        order: 999,
        description: 'This is a test step',
        duration: 60,
      };
      const response = await request(app.getHttpServer())
        .post('/steps')
        .send(validStep)
        .set('Authorization', token);

      expect(response.statusCode).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();

      // delete the step at the end of the test
      await stepsService.remove(response.body.id);
    });
  });

  afterAll(async () => {
    await userService.remove(user.id);
    await app.close();
  });
});
