import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ 
  placeholder = "Search...", 
  value: externalValue, 
  onChange, 
  className = "" 
}) => {
  // Use internal state to manage the input value
  const [internalValue, setInternalValue] = useState(externalValue || '');

  // Sync internal state with external value
  useEffect(() => {
    setInternalValue(externalValue || '');
  }, [externalValue]);

  // Memoize the change handler
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Prevent default on any key press to maintain focus
  const handleKeyDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
        size={20} 
      />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent dark:bg-neutral-900 dark:text-gray-100"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default React.memo(SearchInput);
