import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    generateSnapshot: jest.fn().mockResolvedValue({
      message: 'Snapshot guardado correctamente',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('generate snapshot', () => {
    it('should call service and return response', async () => {
      const result = await appController.generateSnapshot('UC_TEST_ID');

      expect(result).toEqual({
        message: 'Snapshot guardado correctamente',
      });

      expect(mockAppService.generateSnapshot).toHaveBeenCalledWith('UC_TEST_ID');
    });
  });
});