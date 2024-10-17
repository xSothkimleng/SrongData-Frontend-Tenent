import useUserStore from '@/store/useUserStore';
import { hasRequiredPermissions } from '@/utils/checkPermissions';

const useCheckFeatureAuthorization = (permissionCode: number) => {
  const userData = useUserStore(state => state.userData);
  // console.log('userData in Feature check', userData);

  if (!userData) {
    return false;
  }

  return hasRequiredPermissions(userData.permissions, permissionCode);
};

export default useCheckFeatureAuthorization;
