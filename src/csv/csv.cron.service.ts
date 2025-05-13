import { Inject, Injectable, Logger } from "@nestjs/common";
import { Services } from "src/utils/constants";
import { ICsvService } from "./csv";
import { Cron, CronExpression } from "@nestjs/schedule";
import { join } from "path";
import * as fs from 'fs'

@Injectable()
export class CsvCronService {
    private readonly logger = new Logger(CsvCronService.name);

    constructor(@Inject(Services.CSV)
    private csvServices: ICsvService,) { }
      // 🕒 Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const csvDirectory = join(__dirname, '..', '..', 'uploads');
    const csvFiles = fs.readdirSync(csvDirectory).filter(file => file.endsWith('.csv'));

    for (const file of csvFiles) {
      try {
        this.logger.log(`Processing file: ${file}`);
        const filePath = join(csvDirectory, file);
        const fileBuffer = fs.readFileSync(filePath);

        // 🗃️ Process CSV ingestion
        await this.csvServices.processCSV(fileBuffer);

        // ✅ Move to processed folder
        fs.renameSync(filePath,join(csvDirectory, 'processed', file));
        this.logger.log(`File processed and moved to 'processed' folder: ${file}`);
      } catch (error) {
        this.logger.error(`Failed to process file ${file}: ${error.message}`);
      }
    }
  }
}