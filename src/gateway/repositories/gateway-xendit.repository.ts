import { Injectable } from '@nestjs/common';
import axios from 'axios';
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
import { CustomError } from 'helpers/http.helper';
import {
  ICustomerIdXenditResponse,
  IEwalletResponse,
  IPaylaterChargeResponse,
  IPaylaterPlanResponse,
  IQrCodeResponse,
  IRetailOutletResponse,
  ITransactionResponse,
  IVaResponse,
} from '../interfaces/gateway-xendit.interface';

@Injectable()
export class GatewayXenditRepository {
  private readonly baseUrl = process.env.XENDIT_URL;
  private readonly headers = {
    Authorization: `Basic ${Buffer.from(
      `${process.env.XENDIT_API_KEY}:`,
    ).toString('base64')}`,
  };

  isEwallet(methodCode: string): boolean {
    const ewalletCodes = ['ID_DANA', 'ID_SHOPEEPAY'];
    return ewalletCodes.includes(methodCode.toUpperCase());
  }

  isVa(methodCode: string): boolean {
    const vaCodes = [
      'BCA',
      'BRI',
      'MANDIRI',
      'BNI',
      'BJB',
      'BSI',
      'CIMB',
      'PERMATA',
    ];
    return vaCodes.includes(methodCode.toUpperCase());
  }

  isQRCode(methodCode: string): boolean {
    const qrCodeCodes = ['QR_CODE'];
    return qrCodeCodes.includes(methodCode.toUpperCase());
  }

  isPaylater(methodCode: string): boolean {
    const paylaterCodes = ['ID_AKULAKU', 'ID_KREDIVO'];
    return paylaterCodes.includes(methodCode.toUpperCase());
  }

  isRetailOutlet(methodCode: string): boolean {
    const retailOutletCodes = ['INDOMARET', 'ALFAMART'];
    return retailOutletCodes.includes(methodCode.toUpperCase());
  }

  isCash(methodCode: string): boolean {
    const cashCodes = ['BAYAR_DIKASIR'];
    return cashCodes.includes(methodCode.toUpperCase());
  }

  async httpPostCreateVa(dto: CreateVaDto): Promise<IVaResponse> {
    const url = `${this.baseUrl}/callback_virtual_accounts`;

    try {
      const response = await axios.post(
        url,
        { ...dto, is_closed: true, is_single_use: true },
        { headers: this.headers },
      );

      return response.data as IVaResponse;
    } catch (err) {
      console.error('Xendit VA Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error creating VA',
        statusCode: 500,
      });
    }
  }

  async httpPatchVa(id: string, dto: UpdateVaDto): Promise<IVaResponse> {
    const url = `${this.baseUrl}/callback_virtual_accounts/${id}`;

    try {
      const response = await axios.patch(url, dto, { headers: this.headers });

      return response.data as IVaResponse;
    } catch (err) {
      console.error('Xendit VA Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error updating VA',
        statusCode: 500,
      });
    }
  }

  async httpPostChargeEwallet(
    dto: CreateEWalletDto,
  ): Promise<IEwalletResponse> {
    const url = `${this.baseUrl}/ewallets/charges`;

    try {
      const response = await axios.post(url, dto, {
        headers: this.headers,
      });

      return response.data as IEwalletResponse;
    } catch (err) {
      console.error('Xendit Ewallet Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error creating Ewallet',
        statusCode: 500,
      });
    }
  }

  async httpPostQrCode(dto: CreateQrCodeDto): Promise<IQrCodeResponse> {
    const url = `${this.baseUrl}/qr_codes`;

    try {
      const response = await axios.post(
        url,
        {
          ...dto,
          type: 'DYNAMIC',
          currency: 'IDR',
        },
        {
          headers: {
            ...this.headers,
            'api-version': '2022-07-31',
          },
        },
      );

      return response.data as IQrCodeResponse;
    } catch (err) {
      console.error('Xendit QrCode Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error creating QrCode',
        statusCode: 500,
      });
    }
  }

  async httpPostCustomer(
    dto: CreateCustomerIdXenditDto,
  ): Promise<ICustomerIdXenditResponse> {
    const url = `${this.baseUrl}/customers`;

    try {
      const response = await axios.post(
        url,
        {
          ...dto,
          type: 'INDIVIDUAL',
        },
        {
          headers: {
            ...this.headers,
            'API-VERSION': '2020-10-31',
          },
        },
      );

      return response.data as ICustomerIdXenditResponse;
    } catch (err) {
      console.error(
        'Xendit Customer Id Xendit Error:',
        err?.response?.data || err,
      );
      throw new CustomError({
        message: 'Error creating Customer Id Xendit',
        statusCode: 500,
      });
    }
  }

  async httpPostPaylaterPlan(
    dto: CreatePaylaterPlan,
  ): Promise<IPaylaterPlanResponse> {
    const url = `${this.baseUrl}/paylater/plans`;

    try {
      const response = await axios.post(
        url,
        {
          ...dto,
          currency: 'IDR',
        },
        {
          headers: this.headers,
        },
      );

      return response.data as IPaylaterPlanResponse;
    } catch (err) {
      console.error('Xendit Paylater Plan Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error creating Paylater Plan',
        statusCode: 500,
      });
    }
  }

  async httpPostPaylaterCharge(
    dto: CreatePaylaterCharge,
  ): Promise<IPaylaterChargeResponse> {
    const url = `${this.baseUrl}/paylater/charges`;

    try {
      const response = await axios.post(
        url,
        {
          ...dto,
          checkout_method: 'ONE_TIME_PAYMENT',
        },
        {
          headers: this.headers,
        },
      );

      return response.data as IPaylaterChargeResponse;
    } catch (err) {
      console.error(
        'Xendit Paylater Charge Error:',
        err?.response?.data || err,
      );
      throw new CustomError({
        message: 'Error creating Paylater Charge',
        statusCode: 500,
      });
    }
  }

  async httpPostRetailOutlet(
    dto: CreateRetailOutletDto,
  ): Promise<IRetailOutletResponse> {
    const url = `${this.baseUrl}/v3/payment_requests`;

    try {
      const response = await axios.post(
        url,
        {
          reference_id: dto.reference_id,
          type: 'PAY',
          country: 'ID',
          currency: 'IDR',
          request_amount: dto.request_amount,
          channel_code: dto.channel_code,
          channel_properties: dto.channel_properties,
        },
        {
          headers: {
            ...this.headers,
            'api-version': '2024-11-11',
          },
        },
      );

      return response.data as IRetailOutletResponse;
    } catch (err) {
      console.error('Xendit Retail Outlet Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error creating Retail Outlet',
        statusCode: 500,
      });
    }
  }

  async httpGetTransactions(
    dto: QueryListTransactionsDto,
  ): Promise<ITransactionResponse> {
    const url = `${this.baseUrl}/transactions?created[gte]=${dto.startDate}&created[lte]=${dto.endDate}&channel_categories=EWALLET&channel_categories=RETAIL_OUTLET&channel_categories=QR_CODE&channel_categories=PAYLATER&channel_categories=VIRTUAL_ACCOUNT`;

    try {
      const response = await axios.get(url, {
        headers: this.headers,
      });

      return response.data as ITransactionResponse;
    } catch (err) {
      console.error('Xendit Transaction Error:', err?.response?.data || err);
      throw new CustomError({
        message: 'Error getting Transaction',
        statusCode: 500,
      });
    }
  }
}
