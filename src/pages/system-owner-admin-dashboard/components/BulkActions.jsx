import React, { useState } from 'react';
import { CheckSquare, Power, Trash2, AlertTriangle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const BulkActions = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const actions = [
    {
      id: 'activate',
      label: 'Activate Clients',
      icon: Power,
      color: 'green',
      confirmMessage: 'Are you sure you want to activate the selected clients?'
    },
    {
      id: 'suspend',
      label: 'Suspend Clients',
      icon: Power,
      color: 'yellow',
      confirmMessage: 'Are you sure you want to suspend the selected clients?'
    },
    {
      id: 'delete',
      label: 'Delete Clients',
      icon: Trash2,
      color: 'red',
      confirmMessage: 'Are you sure you want to delete the selected clients? This action cannot be undone.',
      dangerous: true
    }
  ];

  const handleActionClick = (action) => {
    setPendingAction(action);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      onBulkAction?.(pendingAction?.id, []);
    }
    setShowConfirm(false);
    setPendingAction(null);
  };

  const getActionButtonColor = (color) => {
    const colors = {
      green: 'bg-green-600 hover:bg-green-700 text-white',
      yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white'
    };
    return colors?.[color] || colors?.green;
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {actions?.map((action) => {
              const Icon = action?.icon;
              return (
                <button
                  key={action?.id}
                  onClick={() => handleActionClick(action)}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${getActionButtonColor(action?.color)}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{action?.label}</span>
                </button>
              );
            })}

            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {pendingAction?.dangerous && (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Bulk Action
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                {pendingAction?.confirmMessage}
              </p>

              <div className="bg-gray-50 rounded-md p-3 mb-6">
                <p className="text-sm text-gray-700">
                  This action will be applied to <strong>{selectedCount}</strong> selected client
                  {selectedCount !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${getActionButtonColor(pendingAction?.color)}`}
                >
                  {pendingAction?.dangerous ? 'Delete' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;