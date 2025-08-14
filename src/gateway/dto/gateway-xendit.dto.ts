import { PartialType } from '@nestjs/mapped-types';

export class CreateVaDto {
  external_id: string;
  bank_code: string;
  name: string;
  is_closed?: boolean;
  expected_amount: number;
  is_single_use?: boolean;
  expiration_date: Date | string;
}

export class UpdateVaDto extends PartialType(CreateVaDto) {}

export class CreateEWalletDto {
  reference_id: string;
  currency?: string;
  amount: number;
  checkout_method?: string;
  channel_code: string;
  channel_properties: {
    mobile_number?: string;
    success_redirect_url?: string;
  };
}

export class CreateQrCodeDto {
  reference_id: string;
  type?: string;
  currency?: string;
  amount: number;
  expires_at: string | Date;
}

export class CreateCustomerIdXenditDto {
  reference_id: string;
  individual_detail: {
    given_names: string;
    surname: string;
  };
  email: string;
  mobile_number: string;
  addresses: {
    street_line1: string;
    city: string;
    postal_code: string;
    country: string;
  }[];
}

export class CreatePaylaterPlan {
  customer_id: string;
  channel_code: string;
  amount: number;
  order_items: {
    type: 'PHYSICAL_PRODUCT';
    reference_id: string;
    name: string;
    net_unit_amount: number;
    quantity: number;
    url: string;
    category: string;
  }[];
}

export class CreatePaylaterCharge {
  plan_id: string;
  reference_id: string;
  success_redirect_url: string;
  failure_redirect_url: string;
}

export class CreateRetailOutletDto {
  reference_id: string;
  request_amount: number;
  channel_code: string;
  channel_properties: {
    payer_name: string;
    expires_at: string | Date;
  };
}

export class QueryListTransactionsDto {
  startDate: string;
  endDate: string;
}
