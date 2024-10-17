import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest) {
  try {
    // console.log('Approve Request API');
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
    if (ids.length !== 3) {
      return NextResponse.json({ error: 'Bad Request: Incorrect IDs' }, { status: 400 });
    }

    const [projectId, requestId, status] = ids;
    // console.log('Approving request:', projectId, requestId, status);
    // console.log('Status:', typeof status);

    let approved;
    let isDeleted;

    if (status === '0') {
      // approved
      approved = true;
      isDeleted = true;
    } else if (status == '1') {
      // rejected
      approved = false;
      isDeleted = false;
    } else if (status === '2') {
      // edit
      approved = true;
      isDeleted = false;
    } else if (status === '3') {
      // delete
      approved = false;
      isDeleted = true;
    }

    // console.log('Approved:', approved);
    // console.log('IsDeleted:', isDeleted);

    const response = await axios.put(
      `${process.env.API_URL}/responses/approve-request/${projectId}/${requestId}`,
      JSON.stringify({
        approved: approved,
        isdeleted: isDeleted,
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
