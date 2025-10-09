import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({
  items = [],
  height = 400,
  itemHeight = 50,
  renderItem,
  className = '',
  onItemClick,
  emptyMessage = 'No items to display',
  loading = false,
  loadingComponent = null
}) => {
  const itemData = useMemo(() => ({
    items,
    renderItem,
    onItemClick
  }), [items, renderItem, onItemClick]);

  const Item = useCallback(({ index, style, data }) => {
    const { items, renderItem, onItemClick } = data;
    const item = items[index];

    if (!item) {
      return <div style={style} />;
    }

    return (
      <div
        style={style}
        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    );
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} role="list">
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        className="border border-gray-200 rounded-lg"
      >
        {Item}
      </List>
    </div>
  );
};

export default VirtualizedList;
