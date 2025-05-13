import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';
import { RevenueQueryDto } from './dto/calculate-revenue.dto';
import { Services } from 'src/utils/constants';
import { IAnalysisService } from './analysis';

@Controller('analysis')
export class AnalysisController {
    constructor(
         @Inject(Services.ANALYSIS)
                private readonly analysisService: IAnalysisService,
       ) {}
    @Get('revenue')
    async calculateRevenue(@Query() query: RevenueQueryDto) {
        try {
            const result = await this.analysisService.calculateRevenue(query);
            if(!result){
                return {
                    success:false,
                    data:null
                }
            }
            return{
                success:true,
                data:result
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
