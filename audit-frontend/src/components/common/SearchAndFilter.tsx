import React, { useState, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchAndFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    key: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  sortOptions?: {
    label: string;
    key: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  onClearFilters?: () => void;
  showResultsCount?: boolean;
  resultsCount?: number;
  className?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchPlaceholder = "Rechercher...",
  searchValue,
  onSearchChange,
  filters = [],
  sortOptions = [],
  onClearFilters,
  showResultsCount = true,
  resultsCount = 0,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if there are any active filters
  useEffect(() => {
    const hasFilters = filters.some(filter => filter.value !== '') || 
                      sortOptions.some(sort => sort.value !== '');
    setHasActiveFilters(hasFilters);
  }, [filters, sortOptions]);

  const handleClearFilters = () => {
    filters.forEach(filter => filter.onChange(''));
    sortOptions.forEach(sort => sort.onChange(''));
    onSearchChange('');
    onClearFilters?.();
  };

  return (
    <div className={`bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md leading-5 bg-slate-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filter Toggle Button */}
        {(filters.length > 0 || sortOptions.length > 0) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center px-3 py-2 border border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              hasActiveFilters ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Actifs
              </span>
            )}
          </button>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-3 py-2 border border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer
          </button>
        )}
      </div>

      {/* Results Count */}
      {showResultsCount && (
        <div className="text-sm text-slate-400 mb-4">
          {resultsCount} résultat{resultsCount !== 1 ? 's' : ''} trouvé{resultsCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (filters.length > 0 || sortOptions.length > 0) && (
        <div className="border-t border-slate-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filters */}
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Sort Options */}
            {sortOptions.map((sort) => (
              <div key={sort.key}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {sort.label}
                </label>
                <select
                  value={sort.value}
                  onChange={(e) => sort.onChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Par défaut</option>
                  {sort.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
