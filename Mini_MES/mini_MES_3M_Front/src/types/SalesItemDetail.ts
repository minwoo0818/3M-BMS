export interface SalesItemDetailViewDto {
    partnerId: number;
    partnerName: string;
    itemName: string;
    itemCode: string;
    price: number;
    color: string;
    classification: string;
    coatingMethod: string;
    remark: string;
    imagePath: string | null;
    operations: Array<{
        operationId: number;
        code: string;
        name: string;
        description: string;
        standardTime: number;
    }>;
}

export interface PartnerSelectResponseDto {
    partnerId: number;
    partnerName: string;
}

export interface SalesItemRegisterData {
    partnerId: number;
    itemName: string;
    itemCode: string;
    price: number;
    color: string;
    classification: string;
    coatingMethod: string;
    remark: string;
    operationIds: number[];
}