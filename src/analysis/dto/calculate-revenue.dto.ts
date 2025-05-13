import { IsString, IsOptional, IsDateString } from 'class-validator';
import { RevenuePeriod, RevenueType } from 'src/utils/enum';

export class RevenueQueryDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    type: RevenueType;

    @IsOptional()
    @IsString()
    period?: RevenuePeriod;
}