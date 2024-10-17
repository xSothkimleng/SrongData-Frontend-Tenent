// utils/apiClient.ts
import axios, { AxiosInstance } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
const baseURL = process.env.API_URL;

// Function to create an Axios instance with token
export async function createApiClient(req: GetServerSidePropsContext['req']): Promise<AxiosInstance> {
  const token = await getToken({ req, secret });
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

// Function to create an Axios instance without token
export function createPublicApiClient(): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
