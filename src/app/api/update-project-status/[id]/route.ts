import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest) {
  try {
    // console.log('Edit role');
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

    const [projectId] = ids;
    // console.log('Project ID:', projectId);

    const response = await axios.put(
      `${process.env.API_URL}/project/update-status/${projectId}`,
      {},
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
