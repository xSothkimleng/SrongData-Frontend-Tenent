import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  const u = new URL(req.url);
  const endpoint = u.searchParams.get('endpoint') as string;
  const url = new URL(`${process.env.API_URL}/${endpoint}`);

  try {
    const response = await axios.get(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token?.accessToken}`,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(`Error in GET request to :`, url);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { body, endpoint } = (await req.json()) as { body: object; endpoint: string };
  const url = new URL(`${process.env.API_URL}/${endpoint}`);

  try {
    const response = await axios.post(
      url.toString(),
      { ...body },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.accessToken}`,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return NextResponse.json({ error: `Failed to fetch ${endpoint}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { body, endpoint } = (await req.json()) as { body: object; endpoint: string };
  const url = new URL(`${process.env.API_URL}/${endpoint}`);

  try {
    const response = await axios.put(
      url.toString(),
      { ...body },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.accessToken}`,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error updating ${endpoint}:`, error);
    return NextResponse.json({ error: `Failed to update ${endpoint}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { endpoint } = (await req.json()) as { endpoint: string };
  const url = new URL(`${process.env.API_URL}/${endpoint}`);

  try {
    const response = await axios.delete(
      url.toString(), 
      {
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token?.accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error deleting at ${endpoint}:`, error);
    return NextResponse.json({ error: `Failed to delete at ${endpoint}` }, { status: 500 });
  }
}
