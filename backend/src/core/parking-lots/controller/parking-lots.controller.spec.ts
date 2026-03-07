import { Test, TestingModule } from '@nestjs/testing';
import { ParkingLotsController } from './parking-lots.controller';

describe('ParkingLotsController', () => {
  let controller: ParkingLotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingLotsController],
    }).compile();

    controller = module.get<ParkingLotsController>(ParkingLotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
