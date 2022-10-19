import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { StoreService } from './store.service';

import { AroundStoreDto } from './dto/around-store';
import { CreateStoreDto } from './dto/create-store';
import { keyCheck } from 'src/auth/keyCheck-decorators';
import { keyPipe } from 'src/auth/keyPipes';
import { Store } from 'src/entities/store.entity';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async findAll(): Promise<Store[]> {
    return await this.storeService.findAll();
  }
  @Get(':store_id')
  async fineOne(@Param('store_id') store_id: string) {
    return await this.storeService.getStoreById(store_id);
  }
  @HttpCode(200)
  @Post('around')
  async aroundStore(@Body() aroundStoreDto: AroundStoreDto) {
    return await this.storeService.aroundStore(aroundStoreDto);
  }

  @HttpCode(200)
  @Post('around2')
  async aroundStore2(@Body() aroundStoreDto: AroundStoreDto) {
    return await this.storeService.aroundStore2(aroundStoreDto);
  }

  // @Post('around2')
  // async aroundStore2(@Body() aroundStoreDto: AroundStoreDto) {
  //   return await this.storeService.aroundStore2(aroundStoreDto);
  // }

  // @Post('around2')
  // async aroundStore3(@Body() aroundStoreDto: AroundStoreDto) {
  //   return await this.storeService.aroundStore2(aroundStoreDto);
  // }

  //dev
  // @Post()
  // async create(@Body() createStoreDto: CreateStoreDto, @keyCheck(keyPipe) key) {
  //   return await this.storeService.create(createStoreDto);
  // }

  // @Delete(':id')
  // deleteStore(@Param('id') id: string, @keyCheck(keyPipe) key) {
  //   return this.storeService.deleteStore(id);
  // }
}
