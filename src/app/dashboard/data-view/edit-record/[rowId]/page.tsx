'use client';
import EditResponse from '@/components/dashboard/EditResponse';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface EditRecordProps {
  params: {
    rowId: string;
  };
}

const EditRecord: React.FC<EditRecordProps> = ({ params }) => {
  const { rowId } = params;
  const [rowData, setRowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponseDetail = async (id: string) => {
    try {
      setLoading(true);
      const responseRes = await axios.get('/api/config', {
        params: { endpoint: `responses/detail/${id}` },
      });
      // console.log('Project response:', responseRes.data);
      setRowData(responseRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to fetch record details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rowId) {
      fetchResponseDetail(rowId);
    } else {
      console.error('No rowId provided');
      setError('No record ID provided');
      setLoading(false);
    }
  }, [rowId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Edit Record</h1>
      <EditResponse responseData={rowData} />
    </div>
  );
};

export default EditRecord;
