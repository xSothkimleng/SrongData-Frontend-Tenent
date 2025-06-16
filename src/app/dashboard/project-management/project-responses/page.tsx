'use client';
import DataView from '@/components/dashboard/data-view';
import { useSearchParams } from 'next/navigation';

type projectDetailType = {
  id: string;
  name: {
    en?: string;
    km?: string;
  };
};

const ProjectResponsesPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const nameEn = searchParams.get('nameEn') || '';
  const nameKm = searchParams.get('nameKm') || '';

  // Show error if missing required fields
  if (!id || (!nameEn && !nameKm)) {
    return <div>Error: Project ID and at least one Name field is required.</div>;
  }

  // Construct the details object directly
  const singleProjectDetail: projectDetailType = {
    id,
    name: {
      en: nameEn,
      km: nameKm,
    },
  };

  return <DataView singleProjectDetail={singleProjectDetail} singleProjectView={true} />;
};

export default ProjectResponsesPage;
