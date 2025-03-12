// src/modules/shared/services/excel.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
@Injectable()
export class ExcelService {

  private getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Chưa bắt đầu';
      case 1:
        return 'Đang thực hiện';
      case 2:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }

  async generateTaskReport(data: any[], period: string, startDate: Date): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Task Report');

    // Add title row with period information
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `Báo cáo công việc ${period === 'week' ? 'tuần' : 'tháng'} từ ${startDate.toLocaleDateString('vi-VN')}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add headers
    worksheet.addRow(['STT', 'Tên công việc', 'Tên Danh mục', 'Ngày bắt đầu', "Ngày kết thúc", 'Ngày kết thúc dự kiến', 'Ngày hoàn thành', 'Trạng thái']);

    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Populate data rows
    data.forEach((task, index) => {
      const startDate = task.startDate ? new Date(task.startDate) : null;
      const endDate = task.endDate ? new Date(task.endDate) : null;
      const completedDate = task.completedDate ? new Date(task.completedDate) : null;
      const plannedDays = task.endDate && task.startDate ? Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
      worksheet.addRow([
        index + 1,
        task.name,
        task.category?.name || 'N/A',
        startDate ? startDate.toLocaleDateString('vi-VN') : '',
        endDate ? endDate.toLocaleDateString('vi-VN') : '',
        plannedDays ? plannedDays : '',
        completedDate ? completedDate.toLocaleDateString('vi-VN') : '',
        this.getStatusLabel(task.status),
      ]);

      const rowIndex = index + 3;
      if (task.status === 2) {
        worksheet.getRow(rowIndex).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6FFE6' },
          };
        });
      } else if (task.endDate && new Date(task.endDate) < new Date() && task.status !== 2) {
        worksheet.getRow(rowIndex).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE6E6' },
          };
        });
      }
    });

    // Generate a Buffer
    const arrayBuffer: ArrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);
    return buffer;
  }

}