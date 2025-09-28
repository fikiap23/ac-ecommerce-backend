import { Prisma } from '@prisma/client';

export const selectOrderProductWithRelations: Prisma.OrderProductSelect = {
  id: true,
  uuid: true,
  serviceType: true,
  packageType: true,
  bundleGroupId: true,
  bundleName: true,
  minusPrice: true,
  deviceId: true,
  name: true,
  category: true,
  description: true,
  price: true,
  quantity: true,
  discount: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  orderProductId: true,
  orderId: true,
  orderProductImage: true,
};

export const selectGeneralOrder: Prisma.OrderSelect = {
  id: true,
  uuid: true,
  trackId: true,
  name: true,
  email: true,
  phoneNumber: true,
  paymentMethod: true,
  deliveryService: true,
  totalWeight: true,
  cashback: true,
  subTotalPay: true,
  exchangePoint: true,
  voucherDiscount: true,
  deliveryFee: true,
  totalPayment: true,
  customerId: true,
  voucherId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  expiredAt: true,
  orderAddress: true,
  discountBundle: true,
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      name: true,
      category: true,
      description: true,
      price: true,
      quantity: true,
      discount: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      orderProductId: true,
      orderId: true,
      bundleGroupId: true,
      sourcePackageType: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,
      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,
      orderProductImage: {
        select: {
          url: true,
        },
      },
    },
  },
  orderVoucher: true,
  orderCallbackPayment: true,
};

export const selectGeneralListOrders: Prisma.OrderSelect = {
  id: true,
  voucherId: true,
  exchangePoint: true,
  customerId: true,
  paymentMethod: true,
  uuid: true,
  createdAt: true,
  trackId: true,
  name: true,
  discountBundle: true,
  orderAddress: {
    select: {
      address: true,
    },
  },
  orderCallbackPayment: {
    select: {
      externalId: true,
      referenceId: true,
      qrReferenceId: true,
      paylaterReferenceId: true,
      retailOutletReferenceId: true,
    },
  },
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      quantity: true,
      name: true,
      price: true,
      sourcePackageType: true,
      bundleGroupId: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,
      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,
    },
  },
  totalPayment: true,
  netAmount: true,
  isNetAmountCalculated: true,
  status: true,
  expiredAt: true,
};

export const selectGeneralTrackOrder: Prisma.OrderSelect = {
  id: true,
  name: true,
  voucherId: true,
  exchangePoint: true,
  customerId: true,
  paymentMethod: true,
  uuid: true,
  trackId: true,
  createdAt: true,
  status: true,
  discountBundle: true,
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      quantity: true,
      name: true,
      price: true,
      bundleGroupId: true,
      sourcePackageType: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,
      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,
      orderProductImage: {
        select: {
          uuid: true,
          url: true,
        },
      },
    },
  },
  totalPayment: true,
  expiredAt: true,
};

export const selectGeneralRecentTransaction: Prisma.OrderSelect = {
  name: true,
  createdAt: true,
  totalPayment: true,
};

export const selectOrderCreate: Prisma.OrderSelect = {
  id: true,
  uuid: true,
  trackId: true,
  name: true,
  email: true,
  phoneNumber: true,
  paymentMethod: true,
  deliveryService: true,
  cashback: true,
  subTotalPay: true,
  exchangePoint: true,
  voucherDiscount: true,
  deliveryFee: true,
  totalPayment: true,
  customerId: true,
  voucherId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  orderAddress: true,
  discountBundle: true,
};

export const selectTrackIdAndStatus: Prisma.OrderSelect = {
  id: true,
  name: true,
  status: true,
  totalPayment: true,
  paymentMethod: true,
  discountBundle: true,
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      name: true,
      price: true,
      quantity: true,
      bundleGroupId: true,
      sourcePackageType: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,
      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,
      orderProductImage: {
        select: {
          url: true,
        },
      },
    },
  },
  orderCallbackPayment: {
    select: {
      va: true,
      desktopCheckoutUrl: true,
      mobileCheckoutUrl: true,
      deepLinkCheckoutUrl: true,
      qrCheckoutString: true,
      qrString: true,
      retailOutletCode: true,
      paylaterDesktopWebCheckoutUrl: true,
      paylaterMobileWebCheckoutUrl: true,
      paylaterMobileDeeplinkCheckoutUrl: true,
    },
  },
  voucherId: true,
  expiredAt: true,
  exchangePoint: true,
  customerId: true,
};

export const selectOrderByUuid: Prisma.OrderSelect = {
  // identifiers
  id: true,
  uuid: true,
  trackId: true,
  createdAt: true,
  updatedAt: true,

  // customer & voucher
  customerId: true,
  voucherId: true,
  exchangePoint: true,

  // contact
  name: true,
  email: true,
  phoneNumber: true,

  // payment & shipping
  paymentMethod: true,
  deliveryService: true,
  totalWeight: true,

  // money
  cashback: true,
  subTotalPay: true,
  voucherDiscount: true,
  deliveryFee: true,
  totalPayment: true,
  xenditFee: true,
  xenditFeeVat: true,
  netAmount: true,
  discountBundle: true,
  isNetAmountCalculated: true,

  // status & timing
  status: true,
  scheduledAt: true,
  expiredAt: true,

  // assignment
  driverId: true,
  driverName: true,
  technicianId: true,
  technicianName: true,

  // NEW service-complete fields
  task: true,
  remarks: true,
  freonBefore: true,
  freonAfter: true,
  tempBefore: true,
  tempAfter: true,
  currentBefore: true,
  currentAfter: true,

  // notes
  notes: true,

  // address
  orderAddress: { select: { address: true } },
  recipientAddress: true,

  // images (NEW relation)
  images: {
    select: {
      uuid: true,
      url: true,
      isMain: true,
      createdAt: true,
    },
  },

  // order items
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      name: true,
      quantity: true,
      price: true,

      // denormalized bundle/variant snapshots (if you store them)
      bundleGroupId: true,
      sourcePackageType: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,

      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,

      orderProductImage: {
        select: {
          uuid: true,
          url: true,
        },
      },
    },
  },
};

export const selectGeneralTrackOrderUuid: Prisma.OrderSelect = {
  id: true,
  name: true,
  voucherId: true,
  exchangePoint: true,
  customerId: true,
  paymentMethod: true,
  uuid: true,
  trackId: true,
  createdAt: true,
  status: true,
  recipientAddress: true,
  orderAddress: true,
  discountBundle: true,
  orderProduct: {
    select: {
      id: true,
      uuid: true,
      serviceType: true,
      packageType: true,
      deviceId: true,
      quantity: true,
      name: true,
      price: true,
      bundleGroupId: true,
      sourcePackageType: true,
      bundleName: true,
      minusPrice: true,
      bundleImage: true,
      variantId: true,
      variantUuid: true,
      variantName: true,
      variantCode: true,
      variantImage: true,

      orderProductImage: {
        select: {
          uuid: true,
          url: true,
        },
      },
    },
  },
  totalPayment: true,
  expiredAt: true,
};

export const selectOrderProductDevice: Prisma.OrderProductSelect = {
  uuid: true,
  name: true,
  variantName: true,
  variantCode: true,
  variantImage: true,
  bundleImage: true,
  orderProductImage: true,
  deviceId: true,
  createdAt: true,
};
