import { BadRequestException, Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICsvService } from './csv';
import { Services } from 'src/utils/constants';
@Controller('csv')
export class CsvController {
    constructor(
        @Inject(Services.CSV)
        private csvServices: ICsvService,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCSV(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // File validation (optional)
        if (file.mimetype !== 'text/csv') {
            throw new BadRequestException('Invalid file type, only CSV allowed');
        }
        // Process CSV and insert into DB
        await this.csvServices.processCSV(file.buffer);

        // Remove file after processing

        return {
            message: 'File processed and data inserted successfully',
        };
    }

}
