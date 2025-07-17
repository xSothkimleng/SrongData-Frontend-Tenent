import React from "react";

const MetadataDisplayContent = ({ selectedLog }: { selectedLog: any }) => {
  if (!selectedLog) return null;

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === "null") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
      return value.length === 0 ? "[]" : JSON.stringify(value, null, 2);
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString();
  };

  const renderChangedAnswerList = (list: any[]) => {
    console.log("change label list: ", list);
    return list.map((item, index) => {
      let label = item.question;
      try {
        label = typeof label === "string" ? JSON.parse(label) : label;
      } catch {
        label = { en: label, km: "" };
      }

      const questionLabel = [label?.en, label?.km].filter(Boolean).join(" / ");
      return (
        <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-700">{questionLabel}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-2 bg-red-50 border border-red-200 rounded">
              <span className="text-xs text-red-600 font-medium">
                Old Value:
              </span>
              <pre className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                {formatValue(item.old)}
              </pre>
            </div>
            <div className="p-2 bg-green-50 border border-green-200 rounded">
              <span className="text-xs text-green-600 font-medium">
                New Value:
              </span>
              <pre className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                {formatValue(item.new)}
              </pre>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderChangedQuestionList = (list: any[]) => {
    return list.map((item, index) => {
      const changes = item.changes || {};
      const questionId = item.question_id || `question-${index}`;
      const questionLabel = item.question_label ?? undefined;

      return (
        <div key={questionId} className="mb-6 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-2 text-gray-700">
            Question ID: {questionId}
          </h4>
          {questionLabel && (
            <h4 className="font-semibold mb-2 text-gray-700">
              Question Label: {JSON.stringify(questionLabel, null, 2) ?? ""}
            </h4>
          )}

          {Object.entries(changes).map(([fieldName, change]: [string, any]) => {
            const oldVal = change?.old;
            const newVal = change?.new;

            return (
              <div key={fieldName} className="mb-4">
                <h5 className="text-sm font-medium text-gray-600 mb-1 capitalize">
                  {fieldName.replace(/_/g, " ")}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-xs text-red-600 font-medium">
                      Old Value:
                    </span>
                    <pre className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                      {formatValue(oldVal)}
                    </pre>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-xs text-green-600 font-medium">
                      New Value:
                    </span>
                    <pre className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                      {formatValue(newVal)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  const renderMetadata = (metadata: any) =>
    Object.entries(metadata).map(([key, value]) => {
      // Handle changed_answers and changed_fields specially
      if (key === "changed_answers") {
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h4 className="text-md font-semibold mb-3 text-gray-800 capitalize">
                {key.replace(/_/g, " ")}
              </h4>
              {renderChangedAnswerList(value)}
            </div>
          );
        }
      }

      if (key === "changed_fields") {
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h4 className="text-md font-semibold mb-3 text-gray-800 capitalize">
                {key.replace(/_/g, " ")}
              </h4>
              {renderChangedAnswerList(value)}
            </div>
          );
        } else if (typeof value === "object" && value !== null) {
          console.log("change field value: ", value);
          return (
            <div key={key}>
              <h4 className="text-md font-semibold mb-3 text-gray-800 capitalize">
                {key.replace(/_/g, " ")}
              </h4>

              {/* Render questions separately if present */}
              {"questions" in value && Array.isArray(value.questions) && (
                <>
                  <p className="text-sm font-semibold mt-2 mb-1 text-gray-700">
                    Questions
                  </p>
                  {renderChangedQuestionList(value.questions)}
                </>
              )}

              {/* Render other fields */}
              <div className="overflow-x-auto mt-4">
                <table className="table-auto w-full text-sm border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Field</th>
                      <th className="border p-2 text-left">Old Value</th>
                      <th className="border p-2 text-left">New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(value)
                      .filter(([field]) => field !== "questions")
                      .map(([field, change]) => (
                        <tr key={field}>
                          <td className="border p-2">{field}</td>
                          <td className="border p-2">
                            {formatValue(change.old)}
                          </td>
                          <td className="border p-2">
                            {formatValue(change.new)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
      }

      // Default rendering
      return (
        <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-medium text-gray-600 capitalize">
              {key.replace(/_/g, " ")}:
            </span>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {typeof value === "string" && Date.parse(value)
                ? formatDate(value)
                : formatValue(value)}
            </pre>
          </div>
        </div>
      );
    });
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">Activity ID:</span>
            <p className="text-sm text-gray-800 font-mono">{selectedLog.id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Type:</span>
            <p className="text-sm text-gray-800">{selectedLog.type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Action:</span>
            <p className="text-sm text-gray-800">{selectedLog.action}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Created At:</span>
            <p className="text-sm text-gray-800">
              {formatDate(selectedLog.created_at)}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* User Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          User Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">Name:</span>
            <p className="text-sm text-gray-800">
              {selectedLog.created_by?.first_name}{" "}
              {selectedLog.created_by?.last_name}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <p className="text-sm text-gray-800">
              {selectedLog.created_by?.email}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-600">User ID:</span>
            <p className="text-sm text-gray-800 font-mono">
              {selectedLog.created_by?.id}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Metadata</h3>
        {selectedLog.metadata ? (
          renderMetadata(selectedLog.metadata)
        ) : (
          <p className="text-sm text-gray-500">No metadata available.</p>
        )}
      </div>
    </div>
  );
};

export default MetadataDisplayContent;
