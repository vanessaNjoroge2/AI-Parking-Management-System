import axios from 'axios';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    const callbackUrl = process.env.KCB_CALLBACK_URL?.trim();

    if (!baseUrl || !orgShortCode || !orgPassKey || !callbackUrl) {
      throw new Error('Missing KCB STK environment variables');
    }

    if (
      !/^https?:\/\//.test(callbackUrl) ||
      callbackUrl.includes('your-domain.com')
    ) {
      throw new BadRequestException(
        'KCB callback URL is not configured with a real reachable URL',
      );
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

    let response: AxiosResponse<KcbStkResponse>;
    try {
      response = await axios.post(
        `${baseUrl}/mm/api/request/1.0.0/stkpush`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const providerMessage =
          typeof error.response?.data === 'object' && error.response?.data
            ? (error.response.data as {
                message?: string;
                ResponseDescription?: string;
                errorMessage?: string;
              })
            : undefined;

        throw new ServiceUnavailableException(
          providerMessage?.message ||
            providerMessage?.ResponseDescription ||
            providerMessage?.errorMessage ||
            'KCB STK push request failed',
        );
      }

      throw error;
    }

    return response.data;
  }
}
