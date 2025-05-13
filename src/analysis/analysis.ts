import { RevenueQueryDto } from "./dto/calculate-revenue.dto";

export interface IAnalysisService{

    calculateRevenue(query: RevenueQueryDto): Promise<any>;
}