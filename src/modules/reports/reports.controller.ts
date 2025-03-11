// src/modules/reports/reports.controller.ts
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportRequestDto, ReportFormat, ReportPeriod } from './dto/report-request.dto';
// import { RolesGuard } from '../shared/guards/roles.guard';
// import { Roles } from '../shared/decorators/roles.decorator';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('tasks')
  async getTaskReport(
    @Query() reportDto: ReportRequestDto,
    @Req() req
  ) {
    const userId = req.user.role === 'admin' && reportDto.userId ?
      reportDto.userId :
      req.user.userId || req.user.sub;

    if (reportDto.format === ReportFormat.EXCEL) {
      throw new Error('For Excel format, please use /reports/tasks/excel endpoint');
    }

    return this.reportsService.getTaskReport(
      reportDto.period,
      reportDto.startDate,
      userId
    );
  }
}
// @Get('tasks/excel')
// async getTaskReportExcel(
//   @Query() reportDto: ReportRequestDto,
//   @Req() req,
//   @Res() res: Response
// ) {
//   const userId = req.user.role === 'admin' && reportDto.userId ?
//     reportDto.userId :
//     req.user.userId || req.user.sub;

//   const period = reportDto.period || ReportPeriod.WEEK;
//   const periodName = period === ReportPeriod.WEEK ? 'tuan' : 'thang';
//   const date = reportDto.startDate ?
//     new Date(reportDto.startDate).toISOString().split('T')[0] :
//     new Date().toISOString().split('T')[0];

//   const buffer = await this.reportsService.generateExcelReport(
//     period,
//     reportDto.startDate,
//     userId
//   );

//   res.set({
//     'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'Content-Disposition': `attachment; filename="bao-cao-${periodName}-${date}.xlsx"`,
//     'Content-Length': buffer.length,
//   });

//   res.end(buffer);
// }

// @Get('admin/tasks')
// // @UseGuards(RolesGuard)
// // @Roles('admin')
// async getAdminTaskReport(
//   @Query() reportDto: ReportRequestDto
// ) {
//   return this.reportsService.getTaskReport(
//     reportDto.period,
//     reportDto.startDate,
//     reportDto.userId // Allow admin to see any user's report
//   );
// }

// @Get('admin/tasks/excel')
// // @UseGuards(RolesGuard)
// // @Roles('admin')
// async getAdminTaskReportExcel(
//   @Query() reportDto: ReportRequestDto,
//   @Res() res: Response
// ) {
//   const period = reportDto.period || ReportPeriod.WEEK;
//   const periodName = period === ReportPeriod.WEEK ? 'tuan' : 'thang';
//   const date = reportDto.startDate ?
//     new Date(reportDto.startDate).toISOString().split('T')[0] :
//     new Date().toISOString().split('T')[0];

//   const userIdSuffix = reportDto.userId ? `-user-${reportDto.userId.substring(0, 8)}` : '';

//   const buffer = await this.reportsService.generateExcelReport(
//     period,
//     reportDto.startDate,
//     reportDto.userId
//   );

//   res.set({
//     'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'Content-Disposition': `attachment; filename="bao-cao-${periodName}-${date}${userIdSuffix}.xlsx"`,
//     'Content-Length': buffer.length,
//   });

//   res.end(buffer);
// }