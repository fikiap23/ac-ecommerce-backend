import { GatewayStorageBucketRepository } from '../repositories/gateway-storage-bucket.repository';
import { Injectable } from '@nestjs/common';
import {
  CreateBulkFileStorageBucketDto,
  CreateFileStorageBucketDto,
} from '../dto/gateway-storage-bucket.dto';
import {
  CreateCustomerIdXenditDto,
  CreateEWalletDto,
  CreatePaylaterCharge,
  CreatePaylaterPlan,
  CreateQrCodeDto,
  CreateRetailOutletDto,
  CreateVaDto,
  QueryListTransactionsDto,
  UpdateVaDto,
} from '../dto/gateway-xendit.dto';
import { GatewayXenditRepository } from '../repositories/gateway-xendit.repository';
import {
  ICustomerIdXenditResponse,
  IEwalletResponse,
  IPaylaterChargeResponse,
  IPaylaterPlanResponse,
  IQrCodeResponse,
  IRetailOutletResponse,
  IVaResponse,
} from '../interfaces/gateway-xendit.interface';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayStorageBucketRepository: GatewayStorageBucketRepository,
    private readonly gatewayXenditRepository: GatewayXenditRepository,
  ) {}

  async httpPostFile(dto: CreateFileStorageBucketDto): Promise<void> {
    await this.gatewayStorageBucketRepository.httpPostFile(dto);
  }

  async httpPostBulkFiles(
    dto: CreateBulkFileStorageBucketDto[],
  ): Promise<void> {
    await this.gatewayStorageBucketRepository.httpPostBulkFiles(dto);
  }

  async httpDeleteFiles(dto: string[]): Promise<void> {
    await this.gatewayStorageBucketRepository.httpDeleteBulkFiles(dto);
  }

  async httpPostCreateVa(dto: CreateVaDto): Promise<IVaResponse> {
    return await this.gatewayXenditRepository.httpPostCreateVa(dto);
  }

  async httpPatchVa(id: string, dto: UpdateVaDto): Promise<IVaResponse> {
    return await this.gatewayXenditRepository.httpPatchVa(id, dto);
  }

  async httpPostChargeEwallet(
    dto: CreateEWalletDto,
  ): Promise<IEwalletResponse> {
    return await this.gatewayXenditRepository.httpPostChargeEwallet(dto);
  }

  async httpPostQrCode(dto: CreateQrCodeDto): Promise<IQrCodeResponse> {
    return await this.gatewayXenditRepository.httpPostQrCode(dto);
  }

  async httpPostCustomerXendit(
    dto: CreateCustomerIdXenditDto,
  ): Promise<ICustomerIdXenditResponse> {
    return await this.gatewayXenditRepository.httpPostCustomer(dto);
  }

  async httpPostPaylaterPlan(
    dto: CreatePaylaterPlan,
  ): Promise<IPaylaterPlanResponse> {
    return await this.gatewayXenditRepository.httpPostPaylaterPlan(dto);
  }

  async httpPostPaylaterCharge(
    dto: CreatePaylaterCharge,
  ): Promise<IPaylaterChargeResponse> {
    return await this.gatewayXenditRepository.httpPostPaylaterCharge(dto);
  }

  async httpPostRetailOutlet(
    dto: CreateRetailOutletDto,
  ): Promise<IRetailOutletResponse> {
    return await this.gatewayXenditRepository.httpPostRetailOutlet(dto);
  }

  async httpGetTransactions(dto: QueryListTransactionsDto) {
    return await this.gatewayXenditRepository.httpGetTransactions(dto);
  }
}
