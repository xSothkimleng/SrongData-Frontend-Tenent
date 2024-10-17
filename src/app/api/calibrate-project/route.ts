import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse the request body
    const body = await req.json();
    // console.log('Request body:', body);

    const { projectId, province, district, commune, village } = body;
    // console.log('Project:', projectId, 'Province:', province, 'District:', district, 'Commune:', commune, 'Village:', village);

    // Make the request to your backend API, excluding the tenant field
    const response = await axios.post(
      `${process.env.API_URL}/project/calibrate`,
      JSON.stringify({
        project_id: projectId,
        province: province,
        district: district,
        commune: commune,
        village: village,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    // console.log('Response Calibrate:', response.data);

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
