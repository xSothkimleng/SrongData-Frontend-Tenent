'use client';
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

  console.log('Editing record with ID:', rowId);

  const fetchResponseDetail = async (id: string) => {
    try {
      setLoading(true);
      const responseRes = await axios.get('/api/config', {
        params: { endpoint: `responses/detail/${id}` },
      });
      console.log('Project response:', responseRes.data);
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
      {rowData && (
        <div>
          {/* Access specific properties instead of rendering the whole object */}
          <p>Message: {rowData.message}</p>

          {/* If you want to display the data object, you can stringify it or access specific fields */}
          <div>
            <h3>Record Data:</h3>
            <pre>{JSON.stringify(rowData.data, null, 2)}</pre>
          </div>

          {/* Or if you know the structure of rowData.data, access specific fields */}
          {rowData.data && (
            <div>
              <p>ID: {rowData.data.id}</p>
              <p>User: {rowData.data.user}</p>
              <p>Province: {rowData.data.province}</p>
              <p>District: {rowData.data.district}</p>
              <p>Commune: {rowData.data.commune}</p>
              {/* Add other fields as needed */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditRecord;
