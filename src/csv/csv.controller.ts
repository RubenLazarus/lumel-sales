import { BadRequestException, Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICsvService } from './csv';
import { Services } from 'src/utils/constants';
import { AppLogger } from 'src/common/logger';
@Controller('csv')
export class CsvController {
    constructor(
        @Inject(Services.CSV)
        private csvServices: ICsvService,
        private readonly logger: AppLogger,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCSV(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // File validation
        if (file.mimetype !== 'text/csv') {
            throw new BadRequestException('Invalid file type, only CSV allowed');
        }
        // Process CSV and insert into DB
        await this.csvServices.processCSV(file.buffer);

        return {
            success: true,
            message: 'File processed and data inserted successfully',
        };
    }

}
