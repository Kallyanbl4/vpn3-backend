import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Main application controller handling HTTP requests.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a welcome message.
   * @returns {string} Welcome message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Returns the current VPN server status.
   * @returns {Promise<string>} VPN status
   */
  @Get('vpn-status')
  async getVpnStatus(): Promise<string> {
    return this.appService.getVpnStatus();
  }
}