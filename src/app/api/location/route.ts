import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;

const locationEndpoints = {
  provinces: `${process.env.API_URL}/location/provinces`,
  districts: `${process.env.API_URL}/location/districts`,
  communes: `${process.env.API_URL}/location/communes`,
  villages: `${process.env.API_URL}/location/villages`,
} as const;

type Endpoint = keyof typeof locationEndpoints;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  const url = new URL(req.url);
  const endpoint = url.searchParams.get('endpoint') as Endpoint;

  if (!locationEndpoints[endpoint]) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  try {
    const response = await axios.get(locationEndpoints[endpoint], {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token?.accessToken}`, 
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${endpoint}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { filter, endpoint } = (await req.json()) as { filter: string[]; endpoint: Endpoint };

  if (!locationEndpoints[endpoint]) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  try {
    const response = await axios.post(
      locationEndpoints[endpoint],
      { filter },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.accessToken}`, // Assuming you have an accessToken in the token object
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${endpoint}` }, { status: 500 });
  }
}
