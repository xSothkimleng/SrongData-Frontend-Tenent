import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest) {
  try {
    // console.log('Editing...');

    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // console.log('Token:', token);

    const encodedIds = req.nextUrl.pathname.split('/').pop();

    if (!encodedIds) {
      return NextResponse.json({ error: 'Bad Request: Missing IDs' }, { status: 400 });
    }

    // get id
    const ids = decodeURIComponent(encodedIds).split('/');
    const [projectId] = ids;
    // get body data
    const body = await req.json();
    const { name, description, indicators, project_location, questions, users } = body;
    // console.log('project Detail', body);

    // console.log('Project ID:', projectId);
    // console.log('name:', name);
    // console.log('description:', description);
    // console.log('indicators:', indicators);
    // console.log('project_location:', project_location);
    // console.log('questions:', questions);
    // console.log('users:', users);

    const response = await axios.put(
      `${process.env.API_URL}/project/edit/${projectId}`,
      JSON.stringify({
        name: name,
        description: description,
        indicators: indicators,
        project_location: project_location,
        questions: questions,
        users: users,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    // console.log('project response', response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
