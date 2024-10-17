import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest) {
  try {
    // console.log('Edit User...');
    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the encoded IDs from the dynamic route parameter
    const encodedIds = req.nextUrl.pathname.split('/').pop();

    if (!encodedIds) {
      return NextResponse.json({ error: 'Bad Request: Missing IDs' }, { status: 400 });
    }

    const ids = decodeURIComponent(encodedIds).split('/');

    const [userId] = ids;

    const body = await req.json();
    const { first_name, last_name, roles } = body;

    // console.log('roleId:', userId);
    // console.log('first_name:', first_name);
    // console.log('last_name:', last_name);
    // console.log('roles:', roles);

    const response = await axios.put(
      `${process.env.API_URL}/user/info/update/${userId}`,
      JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        roles: roles,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    // console.log('Response:', response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
