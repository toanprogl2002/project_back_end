// src/modules/reports/reports.controller.ts
import { Controller, Get, NotAcceptableException, Query, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportRequestDto, ReportFormat, ReportPeriod } from './dto/report-request.dto';
import { Transform } from 'class-transformer';
import { RequestWithUser } from '../categories/requestPost';
import { StatisticsPeriod, StatisticsRequestDto } from './dto/status.dto';
// import { RolesGuard } from '../shared/guards/roles.guard';
// import { Roles } from '../shared/decorators/roles.decorator';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('tasks')
  // @UseGuards(AuthGuard('jwt'))
  async getTaskReport(
    @Query(new ValidationPipe({ transform: true })) reportDto: ReportRequestDto,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.role === 'admin' && reportDto.userId ?
      reportDto.userId : req.user.userId;

    if (reportDto.format === ReportFormat.EXCEL) {
      throw new NotAcceptableException('For Excel format, please use /reports/tasks/excel endpoint');
    }

    return this.reportsService.getTaskReport(
      reportDto.period,
      reportDto.startDate,
      userId
    );
  }

  @Get('tasks/excel')
  // @UseGuards(AuthGuard('jwt'))
  async getTaskReportExcel(
    @Query() reportDto: ReportRequestDto,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ) {
    const userId = req.user.role === 'admin' && reportDto.userId ? reportDto.userId : req.user.userId || req.user.sub;
    const period = reportDto.period || ReportPeriod.WEEK;
    const periodName = period === ReportPeriod.WEEK ? 'week' : 'month';
    const date = reportDto.startDate ?
      new Date(reportDto.startDate).toISOString().split('T')[0] :
      new Date().toISOString().split('T')[0];

    const buffer = await this.reportsService.generateExcelReport(
      period,
      reportDto.startDate,
      userId
    );
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="bao-cao-${periodName}-${date}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
  // src/modules/admin/admin-statistics.controller.ts
  @Get('admin/statistics')
  async getStatistics(
    @Query() statisticsDto: StatisticsRequestDto,
    @Req() req: RequestWithUser
  ) {
    const period = statisticsDto.period || StatisticsPeriod.MONTH;
    if (req.user.role !== 'admin') {
      throw new NotAcceptableException('Only admin can access this endpoint');
    }

    let startDate = statisticsDto.startDate;
    let endDate = statisticsDto.endDate;

    if (period === StatisticsPeriod.DATE && !startDate) {
      const today = new Date();
      startDate = today.toISOString().split('T')[0];

      endDate = startDate;
    }

    return this.reportsService.getAdminStatistics(
      period,
      startDate,
      endDate
    );
  }

}