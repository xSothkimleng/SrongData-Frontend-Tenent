import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const endpoint = u.searchParams.get("endpoint") as string;
  const url = new URL(`${process.env.API_WEB_URL}/${endpoint}`);

  try {
    const acc_token = cookies().get("survey_access_token")?.value;

    if (!acc_token) {
      throw new Error("Access token not found in cookies");
    }

    const response = await axios.get(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${acc_token}`,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error(`Error in GET request to :`, url);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const { body, endpoint } = (await req.json()) as {
    body: object;
    endpoint: string;
  };

  console.log("endpoint: ", endpoint);

  console.log("body: ", body);

  const url = new URL(`${process.env.API_WEB_URL}/${endpoint}`);

  try {
    const acc_token = cookies().get("survey_access_token")?.value;

    if (!acc_token) {
      throw new Error("Access token not found in cookies");
    }

    const response = await axios.post(
      url.toString(),
      { ...body },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${acc_token}`,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${endpoint}` },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const { body, endpoint } = (await req.json()) as {
    body: object;
    endpoint: string;
  };
  const url = new URL(`${process.env.API_WEB_URL}/${endpoint}`);

  try {
    const acc_token = cookies().get("survey_access_token")?.value;

    if (!acc_token) {
      throw new Error("Access token not found in cookies");
    }
    const response = await axios.put(
      url.toString(),
      { ...body },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${acc_token}`,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error updating ${endpoint}:`, error);
    return NextResponse.json(
      { error: `Failed to update ${endpoint}` },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = (await req.json()) as { endpoint: string };
  const url = new URL(`${process.env.API_WEB_URL}/${endpoint}`);

  try {
    const acc_token = cookies().get("survey_access_token")?.value;

    if (!acc_token) {
      throw new Error("Access token not found in cookies");
    }
    const response = await axios.delete(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${acc_token}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`Error deleting at ${endpoint}:`, error);
    return NextResponse.json(
      { error: `Failed to delete at ${endpoint}` },
      { status: 500 },
    );
  }
}
