import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);
    const { firstName, lastName, email, password, organization } = body;

    // Make the request to your backend API, excluding the tenant field
    const response = await axios.post(
      `${process.env.API_URL}/user/register`,
      JSON.stringify({
        user: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          // dob: dob,
          password: password,
        },
        tenant: {
          name: organization,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // console.log('Response:', response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
      return NextResponse.json(
        { message: error.message, error: error.response?.data },
        { status: error.response?.status || 500 },
      );
    } else {
      console.error('Server error:', error);
      return NextResponse.json({ message: 'Internal Server Error', error: (error as Error).message }, { status: 500 });
    }
  }
}
