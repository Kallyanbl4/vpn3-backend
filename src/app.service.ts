import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

/**
 * Сервис приложения для предоставления базовой информации и статуса VPN.
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Возвращает приветственное сообщение для проверки работоспособности приложения.
   * @returns {string} Приветственное сообщение
   */
  getHello(): string {
    this.logger.log('Returning welcome message');
    return this.configService.get<string>('WELCOME_MESSAGE') || 'Hello World!';
  }

  /**
   * Асинхронно возвращает статус VPN-сервера, используя кэширование.
   * @returns {Promise<string>} Статус VPN-сервера
   */
  async getVpnStatus(): Promise<string> {
    const cacheKey = 'vpn_status';
    const cachedStatus = await this.cacheManager.get<string>(cacheKey);

    if (cachedStatus) {
      this.logger.log('Returning cached VPN status');
      return cachedStatus;
    }

    // Пример: здесь может быть вызов внешней команды OpenVPN
    const vpnHost = this.configService.get<string>('VPN_SERVER_HOST') || 'unknown';
    const status = `VPN server at ${vpnHost} is running`; // Заменить на реальную логику
    const ttl = this.configService.get<number>('REDIS_TTL') || 300; // 5 минут по умолчанию

    await this.cacheManager.set(cacheKey, status, ttl);
    this.logger.log(`Cached VPN status for ${vpnHost}`);
    return status;
  }
}