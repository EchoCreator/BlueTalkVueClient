import request from "@/utils/request";

export const getVouchersService = () => {
  return request.get("/user/voucher/getVouchers");
};

export const pickupVoucherService = (voucherId) => {
  return request.post("/user/voucher/pickupVoucher?voucherId=" + voucherId);
};
