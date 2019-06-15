import { Platform } from 'react-native';
import { CodedError, EventEmitter, Subscription } from '@unimodules/core';
import { QueryResponse, Purchase, PurchaseState, ResponseCode, ErrorCode } from './InAppPurchases.types';
import ExpoInAppPurchases from './ExpoInAppPurchases';

const errors = {
  ALREADY_CONNECTED: 'Already connected to App Store',
  ALREADY_DISCONNECTED: 'Already disconnected from App Store',
  NOT_CONNECTED: 'Must be connected to App Store',
};

const PURCHASES_UPDATED_EVENT = 'Expo.purchasesUpdated';
const eventEmitter = new EventEmitter(ExpoInAppPurchases);

let connected = false;
let purchaseUpdatedSubscription: Subscription;

export {
  PurchaseState,
  ResponseCode,
  ErrorCode,
}

export async function connectAsync(): Promise<QueryResponse> {
  if (connected) {
    throw new ConnectionError(errors.ALREADY_CONNECTED);
  }

  const result = await ExpoInAppPurchases.connectAsync();
  connected = true;
  return result;
}

export async function getProductsAsync(itemList: string[]): Promise<QueryResponse> {
  if (!connected) {
    throw new ConnectionError(errors.NOT_CONNECTED);
  }

  return await ExpoInAppPurchases.getProductsAsync(itemList);
}

export async function getPurchaseHistoryAsync(refresh?: boolean): Promise<QueryResponse> {
  if (!connected) {
    throw new ConnectionError(errors.NOT_CONNECTED);
  }

  return await ExpoInAppPurchases.getPurchaseHistoryAsync(refresh);
}

export async function purchaseItemAsync(itemId: string, oldItem?: string): Promise<void> {
  if (!connected) {
    throw new ConnectionError(errors.NOT_CONNECTED);
  }

  await ExpoInAppPurchases.purchaseItemAsync(itemId, oldItem);
}

export async function setPurchaseListener(callback: (result) => void): Promise<void> {
  if (purchaseUpdatedSubscription) {
    purchaseUpdatedSubscription.remove();
  }

  purchaseUpdatedSubscription = eventEmitter.addListener<QueryResponse>(PURCHASES_UPDATED_EVENT, result => {
    callback(result);
  });
}

export async function finishTransactionAsync(purchase: Purchase, consumeItem: boolean): Promise<void> {
  if (!connected) {
    throw new ConnectionError(errors.NOT_CONNECTED);
  }
  if (purchase.acknowledged) return;

  const transactionId = Platform.OS === 'android' ? purchase.purchaseToken : purchase.orderId;
  await ExpoInAppPurchases.finishTransactionAsync(transactionId, consumeItem);
}

export async function getBillingResponseCodeAsync(): Promise<number> {
  if (!connected) {
    return ResponseCode.ERROR;
  }
  if (!ExpoInAppPurchases.getBillingResponseCodeAsync) {
    return ResponseCode.OK;
  }

  return await ExpoInAppPurchases.getBillingResponseCodeAsync();
}

export async function disconnectAsync(): Promise<void> {
  if (!connected) {
    throw new ConnectionError(errors.ALREADY_DISCONNECTED);
  }
  await ExpoInAppPurchases.disconnectAsync();
  connected = false;
}

class ConnectionError extends CodedError {
  constructor(message: string) {
    super('ERR_IN_APP_PURCHASES_CONNECTION', message);
  }
}