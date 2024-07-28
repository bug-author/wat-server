import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateArchiveDTO } from './create-archive-dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('archive-candidate')
  @UseInterceptors(FileInterceptor('image'))
  createArchive(
    @Body() body: CreateArchiveDTO,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.appService.storeDataInCache(body, imageFile);
  }

  @Post('verify')
  test2(@Body() body: { token: string; cacheKey: string }) {
    return this.appService.verifyAndArchive(body.token, body.cacheKey);
  }
}
