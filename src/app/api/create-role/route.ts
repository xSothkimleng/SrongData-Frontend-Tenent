import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { permission } from 'process';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role_name, role_description } = body;

    const response = await axios.post(
      `${process.env.API_URL}/role/create`,
      JSON.stringify({
        role_name: role_name,
        role_description: role_description,
        permissions: ['65e5f4bc1daef38943a147df'],
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    // console.log('project', response.data);

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
