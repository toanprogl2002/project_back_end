import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CacheService } from '../services';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) { }

  // Set dữ liệu cache
  @Post('set')
  async setCache(
    @Body() body: { key: string; value: any; ttl?: number },
  ) {
    await this.cacheService.set(body.key, body.value, body.ttl);
    return { message: `Đã lưu cache key: ${body.key}` };
  }

  // Get dữ liệu từ cache
  @Get('get/:key')
  async getCache(@Param('key') key: string) {
    const value = await this.cacheService.get(key);
    return { key, value };
  }

  // Update dữ liệu trong cache (chỉ đơn giản gọi lại set)
  @Post('update')
  async updateCache(
    @Body() body: { key: string; value: any; ttl?: number },
  ) {
    await this.cacheService.set(body.key, body.value, body.ttl);
    return { message: `Đã cập nhật cache key: ${body.key}` };
  }

  // Xóa key khỏi cache
  @Delete('delete/:key')
  async deleteCache(@Param('key') key: string) {
    await this.cacheService.del(key);
    return { message: `Đã xoá cache key: ${key}` };
  }
}
