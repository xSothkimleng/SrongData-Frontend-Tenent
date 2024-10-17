'use client';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const useFetchUserDetails = () => {
  const { data: session } = useSession();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      try {
        // console.log('fetching user...');
        const response = await axios.get(`/api/get-user-profile`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch user details');
        } else {
          // console.log('response fetch user', response.data.data);
          return response.data.data;
        }
      } catch (error) {
        console.log('error fetch user', error);
        return null;
      }
    },
    enabled: !!session,
  });

  return { data, isLoading, isError, refetch };
};

export default useFetchUserDetails;
