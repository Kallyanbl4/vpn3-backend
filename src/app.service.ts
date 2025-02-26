// src/app.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from './config/app-config.service';
import { CacheService } from './common/cache/cache.service';

/**
 * Сервис, предоставляющий основную информацию о приложении и статусе VPN.
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly VPN_CACHE_KEY = 'vpn_status';

  constructor(
    private readonly configService: AppConfigService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Возвращает приветственное сообщение для проверки работоспособности приложения.
   */
  getHello(): string {
    this.logger.log('Returning welcome message');
    return this.configService.welcomeMessage;
  }

  /**
   * Асинхронно получает статус VPN-сервера с кэшированием.
   */
  async getVpnStatus(): Promise<string> {
    this.logger.log('Getting VPN status');
    
    return this.cacheService.getOrSet(
      this.VPN_CACHE_KEY,
      async () => {
        const vpnHost = this.configService.vpnServerHost;
        this.logger.log(`Fetching VPN status for host: ${vpnHost}`);
        return this.fetchVpnStatus(vpnHost);
      }
    );
  }

  /**
   * Получает статус VPN из внешнего сервиса (заглушка).
   * @param host Хост VPN-сервера
   */
  private async fetchVpnStatus(host: string): Promise<string> {
    this.logger.log(`Actually fetching VPN status for: ${host}`);
    
    // В реальном приложении здесь будет HTTP-запрос к VPN-серверу
    // Сейчас это просто заглушка
    
    // Симуляция задержки сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `VPN server at ${host} is running`;
  }
}