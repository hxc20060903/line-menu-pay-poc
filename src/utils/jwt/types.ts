export type ConfirmToken = { orderId: string; action: 'confirm'; amount: number };
export type CancelToken = { orderId: string; action: 'cancel' };
