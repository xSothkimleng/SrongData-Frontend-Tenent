import { LongLat } from '@/types/locations';
import { setCookie } from '@/utils/cookies';

export const requestLocation = async (): Promise<LongLat | null> => {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported.');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCookie('lat', latitude.toString(), 1 / 24);
        setCookie('long', longitude.toString(), 1 / 24);
        console.log('Location saved:', latitude, longitude);

        // Do reverse geocoding in a separate async function
        (async () => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
              headers: {
                'User-Agent': 'YourAppName/1.0 (you@example.com)',
              },
            });
            const data = await res.json();
            const address = data.address || {};

            if (address.state) setCookie('province', address.state, 1 / 24);
            if (address.town) setCookie('city', address.town, 1 / 24);
            if (address.village) setCookie('district', address.village, 1 / 24);
            if (address.neighbourhood || address.hamlet) setCookie('commune', address.neighbourhood || address.hamlet, 1);
            console.log('Address info saved:', address);
          } catch (err) {
            console.error('Error during reverse geocoding:', err);
          }

          resolve({ long: longitude, lat: latitude });
        })();
      },
      error => {
        console.warn('Location access denied or error:', error.message);
        resolve(null);
      },
    );
  });
};
