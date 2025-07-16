import React from 'react';

const MetadataDisplayContent = ({ selectedLog }) => {
  if (!selectedLog) return null;

  const formatValue = value => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleString();
  };

  const renderChangedFields = changedFields => {
    return Object.entries(changedFields).map(([fieldName, changes]) => (
      <div key={fieldName} className='mb-4 p-3 bg-gray-50 rounded-lg'>
        <h4 className='font-semibold mb-2 text-gray-700 capitalize'>{fieldName.replace('_', ' ')}:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <div className='p-2 bg-red-50 border border-red-200 rounded'>
            <span className='text-xs text-red-600 font-medium'>Old Value:</span>
            <pre className='mt-1 text-sm text-gray-700 whitespace-pre-wrap'>{formatValue(changes.old)}</pre>
          </div>
          <div className='p-2 bg-green-50 border border-green-200 rounded'>
            <span className='text-xs text-green-600 font-medium'>New Value:</span>
            <pre className='mt-1 text-sm text-gray-700 whitespace-pre-wrap'>{formatValue(changes.new)}</pre>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className='space-y-6'>
      {/* Basic Information */}
      <div>
        <h3 className='text-lg font-semibold mb-3 text-gray-800'>Basic Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <span className='font-medium text-gray-600'>Activity ID:</span>
            <p className='text-sm text-gray-800 font-mono'>{selectedLog.id}</p>
          </div>
          <div>
            <span className='font-medium text-gray-600'>Type:</span>
            <p className='text-sm text-gray-800'>{selectedLog.type}</p>
          </div>
          <div>
            <span className='font-medium text-gray-600'>Action:</span>
            <p className='text-sm text-gray-800'>{selectedLog.action}</p>
          </div>
          <div>
            <span className='font-medium text-gray-600'>Created At:</span>
            <p className='text-sm text-gray-800'>{formatDate(selectedLog.created_at)}</p>
          </div>
        </div>
      </div>

      <hr className='border-gray-200' />

      {/* User Information */}
      <div>
        <h3 className='text-lg font-semibold mb-3 text-gray-800'>User Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <span className='font-medium text-gray-600'>Name:</span>
            <p className='text-sm text-gray-800'>
              {selectedLog.created_by.first_name} {selectedLog.created_by.last_name}
            </p>
          </div>
          <div>
            <span className='font-medium text-gray-600'>Email:</span>
            <p className='text-sm text-gray-800'>{selectedLog.created_by.email}</p>
          </div>
          <div className='md:col-span-2'>
            <span className='font-medium text-gray-600'>User ID:</span>
            <p className='text-sm text-gray-800 font-mono'>{selectedLog.created_by.id}</p>
          </div>
        </div>
      </div>

      <hr className='border-gray-200' />

      {/* Metadata */}
      <div>
        <h3 className='text-lg font-semibold mb-3 text-gray-800'>Metadata</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <span className='font-medium text-gray-600'>Project ID:</span>
            <p className='text-sm text-gray-800 font-mono'>{selectedLog.metadata.project_id}</p>
          </div>
          <div>
            <span className='font-medium text-gray-600'>Updated At:</span>
            <p className='text-sm text-gray-800'>{formatDate(selectedLog.metadata.updated_at)}</p>
          </div>
          <div className='md:col-span-2'>
            <span className='font-medium text-gray-600'>Updated By:</span>
            <p className='text-sm text-gray-800 font-mono'>{selectedLog.metadata.updated_by}</p>
          </div>
        </div>

        {/* Changed Fields */}
        {selectedLog.metadata.changed_fields && (
          <div>
            <h4 className='text-md font-semibold mb-3 text-gray-800'>Changed Fields</h4>
            {renderChangedFields(selectedLog.metadata.changed_fields)}
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage with sample data
const App = () => {
  const selectedLog = {
    id: '6875eb0f10e929ae1363a8d0',
    type: 2,
    action: 'Update Project',
    user_id: '67457c19222e8098d8f4a493',
    created_at: '2025-07-15T05:45:51.465Z',
    created_by: {
      id: '67457c19222e8098d8f4a493',
      first_name: 'PrimeDATA',
      last_name: 'Team',
      email: 'samnang.sakal@gmail.com',
    },
    metadata: {
      project_id: '6875e9d610e929ae1363a8bc',
      updated_at: '2025-07-15T12:45:51+07:00',
      updated_by: '67457c19222e8098d8f4a493',
      changed_fields: {
        code: {
          old: '6875e9d610e929ae1363a8bb',
          new: '',
        },
        description: {
          old: { en: 'Testing for Survey only in English Language', km: '' },
          new: { en: 'Testing for Survey only in English Language Updated', km: '' },
        },
        method: {
          old: 1,
          new: 0,
        },
        name: {
          old: { en: 'English Only Web Survey Demo', km: '' },
          new: { en: 'English Only Web Survey Demo Updated', km: '' },
        },
      },
    },
  };

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Activity Details</h2>
      <div className='bg-white rounded-lg shadow p-6'>
        <MetadataDisplayContent selectedLog={selectedLog} />
      </div>
    </div>
  );
};

export default App;
