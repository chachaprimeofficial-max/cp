import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { GroupBuyService } from './group-buy.service';
import { CreateGroupBuyDto } from './dto/create-group-buy.dto';

@Controller('group-buy')
@UseGuards(JwtAuthGuard)
export class GroupBuyController {
  constructor(private readonly service: GroupBuyService) {}

  @Get('open') open() { return this.service.listOpen(); }
  @Get('mine') mine(@Req() req: any) { return this.service.mine(req.user.sub); }
  @Post() create(@Req() req: any, @Body() dto: CreateGroupBuyDto) { return this.service.create(req.user.sub, dto); }
  @Post(':groupNumber/join') join(@Req() req: any, @Param('groupNumber') groupNumber: string) { return this.service.join(groupNumber, req.user.sub); }

  @Get('admin/list')
  @UseGuards(AdminGuard)
  adminList() { return this.service.listAdmin(); }

  @Post('admin/expire')
  @UseGuards(AdminGuard)
  expire() { return this.service.expireFailedGroups(); }
}
