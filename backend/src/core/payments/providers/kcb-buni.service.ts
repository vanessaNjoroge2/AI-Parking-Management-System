import axios from 'axios';
import { Injectable } from '@nestjs/common';
import type { AxiosResponse } from 'axios';

interface KcbAccessTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface KcbStkResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

@Injectable()
export class KcbBuniService {
  async getAccessToken(): Promise<string> {
    const clientId = process.env.KCB_CLIENT_ID;
    const clientSecret = process.env.KCB_CLIENT_SECRET;
    const baseUrl = process.env.KCB_BASE_URL;

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing KCB access token environment variables');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response: AxiosResponse<KcbAccessTokenResponse> = await axios.post(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  }

  async stkPush(data: {
    phone: string;
    amount: number;
    invoiceNumber: string;
  }): Promise<KcbStkResponse> {
    const token = await this.getAccessToken();
    const baseUrl = process.env.KCB_BASE_URL;
    const orgShortCode = process.env.KCB_ORG_SHORTCODE;
    const orgPassKey = process.env.KCB_PASSKEY;
    const callbackUrl = process.env.KCB_CALLBACK_URL;
    console.log('KCB_BASE_URL', process.env.KCB_BASE_URL);
    console.log('KCB_ORG_SHORTCODE', process.env.KCB_ORG_SHORTCODE);
    console.log('KCB_PASSKEY', process.env.KCB_PASSKEY);
    console.log('KCB_CALLBACK_URL', process.env.KCB_CALLBACK_URL);
    if (!baseUrl || !orgShortCode || !orgPassKey || !callbackUrl) {
      throw new Error('Missing KCB STK environment variables');
    }

    const payload = {
      phoneNumber: data.phone,
      amount: data.amount,
      invoiceNumber: data.invoiceNumber,
      orgShortCode,
      orgPassKey,
      callbackUrl,
      transactionDescription: 'Parking payment',
    };

    const response: AxiosResponse<KcbStkResponse> = await axios.post(
      `${baseUrl}/mm/api/request/1.0.0/stkpush`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }
}
