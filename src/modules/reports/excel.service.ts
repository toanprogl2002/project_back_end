// src/modules/shared/services/excel.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {

  // async generateTaskReport(data: any[], period: string, startDate: Date): Promise<Buffer> {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Task Report');

  //   // Add title row with period information
  //   worksheet.mergeCells('A1:G1');
  //   worksheet.getCell('A1').value = `Báo cáo công việc ${period === 'week' ? 'tuần' : 'tháng'} từ ${startDate.toLocaleDateString('vi-VN')}`;
  //   worksheet.getCell('A1').font = { size: 16, bold: true };
  //   worksheet.getCell('A1').alignment = { horizontal: 'center' };

  //   // Add headers
  //   worksheet.addRow(['STT', 'Tên công việc', 'Danh mục', 'Ngày bắt đầu', 'Ngày kết thúc dự kiến', 'Ngày hoàn thành', 'Trạng thái']);

  //   // Style header row
  //   worksheet.getRow(2).eachCell((cell) => {
  //     cell.font = { bold: true };
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFD3D3D3' } // Light gray background
  //     };
  //     cell.border = {
  //       top: { style: 'thin' },
  //       left: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       right: { style: 'thin' }
  //     };
  //   });

  //   // Add data rows
  //   data.forEach((task, index) => {
  //     const startDate = task.start_date ? new Date(task.start_date) : null;
  //     const endDate = task.end_date ? new Date(task.end_date) : null;
  //     const completedDate = task.completed_date ? new Date(task.completed_date) : null;

  //     worksheet.addRow([
  //       index + 1,
  //       task.name,
  //       task.category?.name || 'N/A',
  //       startDate ? startDate.toLocaleDateString('vi-VN') : '',
  //       endDate ? endDate.toLocaleDateString('vi-VN') : '',
  //       completedDate ? completedDate.toLocaleDateString('vi-VN') : '',
  //       this.getStatusLabel(task.status)
  //     ]);

  //     // Add color coding based on task status
  //     const rowIndex = index + 3; // +3 because we have a title row and header row
  //     if (task.status === 2) { // Completed
  //       worksheet.getRow(rowIndex).eachCell((cell) => {
  //         cell.fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FFE6FFE6' } // Light green
  //         };
  //       });
  //     } else if (task.end_date && new Date(task.end_date) < new Date() && task.status !== 2) {
  //       worksheet.getRow(rowIndex).eachCell((cell) => {
  //         cell.fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FFFFE6E6' } // Light red (overdue)
  //         };
  //       });
  //     }
  //   });

  //   // Add a summary section
  //   const rowCount = worksheet.rowCount;
  //   worksheet.addRow([]);

  //   // Calculate metrics
  //   const completedTasks = data.filter(task => task.status === 2).length;
  //   const onTimeTasks = data.filter(task =>
  //     task.status === 2 && task.completed_date && task.end_date &&
  //     new Date(task.completed_date) <= new Date(task.end_date)
  //   ).length;

  //   const totalTasks = data.length;

  //   // Add summary metrics
  //   worksheet.addRow(['Tổng số công việc:', totalTasks]);
  //   worksheet.addRow(['Công việc đã hoàn thành:', completedTasks]);
  //   worksheet.addRow(['Công việc hoàn thành đúng hạn:', onTimeTasks]);
  //   worksheet.addRow(['Tỷ lệ hoàn thành:', totalTasks > 0 ? `${(completedTasks / totalTasks * 100).toFixed(2)}%` : '0%']);

  //   // Format totals section
  //   for (let i = rowCount + 2; i <= rowCount + 5; i++) {
  //     worksheet.getCell(`A${i}`).font = { bold: true };
  //   }

  //   // Auto-fit columns
  //   // worksheet.columns.forEach(column => {
  //   //   let maxLength = 0;
  //   //   column.eachCell({ includeEmpty: true }, cell => {
  //   //     const columnLength = cell.value ? cell.value.toString().length : 10;
  //   //     if (columnLength > maxLength) {
  //   //       maxLength = columnLength;
  //   //     }
  //   //   });
  //   //   column.width = maxLength + 2;
  //   // });
  //   const buffer: Buffer = await workbook.xlsx.writeBuffer();
  //   return buffer;
  // }

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
}