import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // 🔥 generar snapshot por canal
  @Get('generate-snapshot/:channelId')
  generateSnapshot(@Param('channelId') channelId: string) {
    return this.appService.generateSnapshot(channelId);
  }

  // 📊 traer snapshots
  @Get('snapshots')
  getSnapshots() {
    return this.appService.findAllSnapshots();
  }
}