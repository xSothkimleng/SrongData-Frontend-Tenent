import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  try {
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
    // if (ids.length !== 3) {
    //   return NextResponse.json({ error: 'Bad Request: Incorrect IDs' }, { status: 400 });
    // }

    const [region, projectId, regionParentId] = ids;
    // console.log('ids', region, projectId, regionParentId);

    let endpoint: string = '';

    if (ids.length == 2) {
      endpoint = `${process.env.API_URL}/project/location/${region}/${projectId}`;
    } else if (ids.length == 3) {
      endpoint = `${process.env.API_URL}/project/location/${region}/${projectId}/${regionParentId}`;
    }

    // console.log('Endpoint:', endpoint);

    const response = await axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    // console.log('Response:', response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
