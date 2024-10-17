import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resetToken, password } = body;

    console.log('Request body email:', resetToken);
    console.log('Request optCode:', password);

    const response = await axios.put(`${process.env.API_URL}/user/reset-password`, {
      reset_token: resetToken,
      password: password,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
