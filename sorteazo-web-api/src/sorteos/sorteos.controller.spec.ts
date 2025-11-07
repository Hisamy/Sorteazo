import { Test, TestingModule } from '@nestjs/testing';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';

describe('SorteosController', () => {
  let controller: SorteosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SorteosController],
      providers: [SorteosService],
    }).compile();

    controller = module.get<SorteosController>(SorteosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
