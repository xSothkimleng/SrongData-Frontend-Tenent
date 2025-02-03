import axios from "axios";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Parse the request body
    const body = await req.json();
    // console.log('Request body:', body);
    const {
      card_type,
      four_digits,
      expiry_month,
      expiry_year,
      month_number,
      id,
    } = body;
    console.log("duma send purchase here");
    // Make the request to your backend API, excluding the tenant field
    const response = await axios.post(
      `${process.env.API_URL}/subscription/purchase`,
      JSON.stringify({
        subscription_id: id,
        card_type: card_type,
        four_digits: four_digits,
        expiry_month: expiry_month,
        expiry_year: expiry_year,
        month_number: month_number,
        is_save: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    console.log("Response:", response.data);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      return NextResponse.json(
        { message: error.message, error: error.response?.data },
        { status: error.response?.status || 500 },
      );
    } else {
      console.error("Server error:", error);
      return NextResponse.json(
        { message: "Internal Server Error", error: (error as Error).message },
        { status: 500 },
      );
    }
  }
}
