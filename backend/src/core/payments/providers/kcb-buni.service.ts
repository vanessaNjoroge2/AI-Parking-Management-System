import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KcbBuniService {
  async getAccessToken() {
    const clientId = process.env.KCB_CLIENT_ID!;
    const clientSecret = process.env.KCB_CLIENT_SECRET!;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      `${process.env.KCB_BASE_URL}/token`,
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
  }) {
    const token = await this.getAccessToken();

    const payload = {
      phoneNumber: data.phone,
      amount: data.amount,
      invoiceNumber: data.invoiceNumber,
      orgShortCode: process.env.KCB_ORG_SHORTCODE,
      orgPassKey: process.env.KCB_PASSKEY,
      callbackUrl: process.env.KCB_CALLBACK_URL,
      transactionDescription: 'Parking payment',
    };

    const response = await axios.post(
      `${process.env.KCB_BASE_URL}/mm/api/request/1.0.0/stkpush`,
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
