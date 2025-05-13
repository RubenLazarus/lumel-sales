import { IsNotEmpty } from 'class-validator';

export class UploadCSVDto {
    @IsNotEmpty()
    file: Express.Multer.File;
}