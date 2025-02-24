import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

/**
 * Service providing basic application information and VPN status.
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns a welcome message to check application health.
   * @returns {string} Welcome message
   */
  getHello(): string {
    this.logger.log('Returning welcome message');
    return this.configService.get<string>('WELCOME_MESSAGE') || 'Hello World!';
  }

  /**
   * Asynchronously retrieves the VPN server status with caching.
   * @returns {Promise<string>} VPN server status
   */
  async getVpnStatus(): Promise<string> {
    const cacheKey = 'vpn_status';
    const cachedStatus = await this.cacheManager.get<string>(cacheKey);

    if (cachedStatus) {
      this.logger.log('Returning cached VPN status');
      return cachedStatus;
    }

    const vpnHost = this.configService.get<string>('VPN_SERVER_HOST') || 'unknown';
    const status = await this.fetchVpnStatus(vpnHost); // Заменить на реальную логику
    const ttl = this.configService.get<number>('REDIS_TTL') || 300;

    await this.cacheManager.set(cacheKey, status, ttl);
    this.logger.log(`Cached VPN status for ${vpnHost}`);
    return status;
  }

  /**
   * Fetches VPN status from an external service (placeholder).
   * @param {string} host VPN server host
   * @returns {Promise<string>} VPN status
   */
  private async fetchVpnStatus(host: string): Promise<string> {
    // Placeholder: Implement real VPN status check (e.g., HTTP request)
    return `VPN server at ${host} is running`;
  }
}