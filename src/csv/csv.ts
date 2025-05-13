export interface ICsvService{

    processCSV(buffer: Buffer): Promise<any>;
}