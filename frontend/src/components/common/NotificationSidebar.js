import React from 'react';

const NotificationSidebar = ({ isOpen, onClose, items, onMarkAllRead, onClearAll }) => {
  return (
    <div className="fixed inset-y-0 left-64 right-0 z-10 pointer-events-none">

      {/* Panel (sits to the right of main sidebar w-64) */}
      <div
        className={`fixed top-0 bottom-0 left-64 w-96 bg-white border-l border-gray-200 transform transition-transform z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } pointer-events-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {items && items.length > 0 ? (
            <>
              <div className="p-3 flex items-center space-x-2 border-b border-gray-100">
                <button
                  onClick={onMarkAllRead}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Mark all as read
                </button>
                <button
                  onClick={onClearAll}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear all
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              You're all caught up
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar;


