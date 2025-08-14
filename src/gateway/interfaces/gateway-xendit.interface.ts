export type IVaResponse = {
  expiration_date: string;
  id: string;
  owner_id: string;
  external_id: string;
  merchant_code: string;
  account_number: string;
  bank_code: string;
  name: string;
  is_closed: boolean;
  expected_amount: number;
  is_single_use: boolean;
  status: string;
  currency: string;
  country: string;
};

export type IEwalletResponse = {
  id: string;
  business_id: string;
  reference_id: string;
  status: string;
  currency: string;
  charge_amount: number;
  capture_amount: number;
  payer_charged_currency: null;
  payer_charged_amount: null;
  refunded_amount: null;
  checkout_method: string;
  channel_code: string;
  channel_properties: {
    success_redirect_url?: string | null;
    mobile_numnber: string;
  };
  actions: {
    desktop_web_checkout_url: string;
    mobile_web_checkout_url: string;
    mobile_deeplink_checkout_url: null;
    qr_checkout_string: null;
  } | null;
  is_redirect_required: true;
  callback_url: string;
  created: string;
  updated: string;
  void_status: null;
  voided_at: null;
  capture_now: true;
  customer_id: null;
  customer: null;
  payment_method_id: null;
  failure_code: null;
  basket: null;
  metadata: null;
  shipping_information: null;
  payment_detail: {
    fund_source: null;
    source: null;
  };
};

export type IQrCodeResponse = {
  reference_id: string;
  type: string;
  currency: string;
  channel_code: string;
  amount: number;
  expires_at: string;
  metadata: null;
  business_id: string;
  id: string;
  created: string;
  updated: string;
  qr_string: string;
  status: string;
};

export type IRetailOutletResponse = {
  payment_request_id: string;
  country: string;
  currency: string;
  business_id: string;
  reference_id: string;
  created: string | Date;
  updated: string | Date;
  status: string;
  capture_method: string;
  channel_code: string;
  request_amount: number;
  channel_properties: {
    payer_name: string;
    expires_at: string | Date;
  };
  type: string;
  actions: {
    type: string;
    descriptor: string;
    value: string;
  }[];
};

export type IVaWebhookResponse = {
  updated: string;
  created: string;
  payment_id: string;
  callback_virtual_account_id: string;
  owner_id: string;
  external_id: string;
  account_number: string;
  bank_code: string;
  amount: number;
  transaction_timestamp: string;
  merchant_code: string;
  id: string;
};

export type IEWalletWebhookResponse = {
  data: {
    id: string;
    basket: null;
    status: string;
    actions: {
      mobile_web_checkout_url: string;
      desktop_web_checkout_url: string;
      mobile_deeplink_checkout_url: string;
    };
    created: string;
    updated: string;
    currency: string;
    metadata: {
      branch_code: string;
    };
    voided_at: null;
    capture_now: true;
    customer_id: null;
    callback_url: string;
    channel_code: string;
    failure_code: null;
    reference_id: string;
    charge_amount: 20000;
    capture_amount: 20000;
    checkout_method: string;
    payment_method_id: null;
    channel_properties: {
      success_redirect_url: string;
    };
    is_redirect_required: true;
  };
  event: string;
  created: string;
  business_id: string;
};

export type IQrCodeWebhookResponse = {
  event: string;
  created: string;
  business_id: string;
  data: {
    id: string;
    business_id: string;
    currency: string;
    amount: 1500;
    status: string;
    created: string;
    qr_id: string;
    qr_string: string;
    reference_id: string;
    type: string;
    channel_code: string;
    expires_at: string;
    metadata: {
      branch_code: string;
    };
    payment_detail: {
      receipt_id: string;
      source: string;
    };
  };
};

export type ICustomerIdXenditResponse = {
  type: string;
  date_of_registration: string | Date;
  email: string;
  mobile_number: string;
  phone_number: string;
  created: string | Date;
  updated: string | Date;
  description: string;
  hashed_phone_number: string;
  domicile_of_registration: string | null;
  kyc_documents: [];
  id: string;
  reference_id: string;
  metadata: null;
  individual_detail: {
    given_names: string;
    given_names_non_roman: null;
    surname: string;
    surname_non_roman: null;
    nationality: null;
    date_of_birth: null;
    place_of_birth: null;
    gender: null;
    employment: null;
  };
  business_detail: null;
  addresses: {
    country: string;
    street_line1: string;
    street_line2: null;
    city: string;
    province_state: null;
    postal_code: string;
    category: null;
    is_primary: false;
  }[];
  identity_accounts: [];
};

export type IPaylaterPlanResponse = {
  id: string;
  customer_id: string;
  channel_code: string;
  currency: string;
  amount: number;
  order_items: {
    type: string;
    reference_id: string;
    name: string;
    net_unit_amount: number;
    quantity: number;
    url: string;
    category: string;
    subcategory: null;
    description: null;
    metadata: null;
  }[];
  options: {
    downpayment_amount: number;
    installment_amount: number;
    interest_rate: number;
    total_amount: number;
    interval: string;
    interval_count: number;
    total_recurrence: number;
    description: string;
  }[];
  created: string | Date;
};

export type IPaylaterChargeResponse = {
  id: string;
  business_id: string;
  reference_id: string;
  customer_id: string;
  plan_id: string;
  currency: string;
  amount: number;
  channel_code: string;
  checkout_method: string;
  status: string;
  actions: {
    desktop_web_checkout_url: string;
    mobile_web_checkout_url: string;
    mobile_deeplink_checkout_url: string;
  };
  expires_at: string | Date;
  success_redirect_url: string;
  failure_redirect_url: string;
  callback_url: string;
  created: string | Date;
  updated: string | Date;
  order_items: {
    type: string;
    reference_id: string;
    name: string;
    net_unit_amount: number;
    quantity: number;
    url: string;
    category: string;
    subcategory: null;
    description: null;
    metadata: null;
  }[];
  voided_at: null;
  payment_method_id: null;
  metadata: null;
};

export type IPaylaterWebhookResponse = {
  event: string;
  data: {
    reference_id: string;
  };
};

export type IRetailOutletWebhookResponse = {
  created: string | Date;
  business_id: string;
  event: string;
  data: {
    type: string;
    status: string;
    country: string;
    created: string | Date;
    updated: string | Date;
    captures: {
      capture_id: string;
      capture_amount: number;
      capture_timestamp: string | Date;
    }[];
    currency: string;
    payment_id: string;
    business_id: string;
    channel_code: string;
    reference_id: string;
    capture_method: string;
    request_amount: number;
    payment_details: {
      remark: string;
    };
    payment_request_id: string;
  };
  api_version: string;
};

export type ITransactionResponse = {
  data: {
    id: string;
    product_id: string;
    type: string;
    status: string;
    channel_category: string;
    channel_code: string;
    reference_id: string;
    account_identifier: string;
    currency: string;
    amount: number;
    net_amount: number;
    net_amount_currency: string;
    cashflow: string;
    settlement_status: string;
    estimated_settlement_time: string;
    business_id: string;
    created: string;
    updated: string;
    fee: {
      xendit_fee: number;
      value_added_tax: number;
      xendit_withholding_tax: number;
      third_party_withholding_tax: number;
      status: string;
    };
    product_data: {
      capture_id: string;
      payment_request_id: string;
    };
  }[];
};
