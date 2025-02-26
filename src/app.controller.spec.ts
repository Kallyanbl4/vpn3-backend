import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigService } from './config/app-config.service';
import { CacheService } from './common/cache/cache.service';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let configService: AppConfigService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppConfigService,
          useValue: {
            welcomeMessage: 'Hello World!',
            vpnServerHost: 'test-vpn-host',
          },
        },
        {
          provide: CacheService,
          useValue: {
            getOrSet: jest.fn(),
            createKey: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    configService = app.get<AppConfigService>(AppConfigService);
    cacheService = app.get<CacheService>(CacheService);
  });

  describe('getHello', () => {
    it('should return welcome message from config service', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });

  describe('getVpnStatus', () => {
    it('should return VPN status from cache service', async () => {
      // Мокируем метод getOrSet, чтобы он возвращал нужное значение
      jest.spyOn(cacheService, 'getOrSet').mockImplementation(async (key, factory) => {
        return 'VPN server at test-vpn-host is running';
      });
      
      const result = await appController.getVpnStatus();
      
      expect(result).toBe('VPN server at test-vpn-host is running');
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'vpn_status',
        expect.any(Function)
      );
    });
  });
});