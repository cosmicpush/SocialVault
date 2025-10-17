'use client'

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react'
import {
  MoreVertical,
  Plus,
  FileText,
  Edit,
  Trash,
  Copy,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'
import { copyToClipboardSecurely, prepareForExport } from '@/utils/crypto'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

// Create a context for resource operations
export const ResourceContext = createContext({})

/**
 * Resource Provider component that manages resource state and operations
 */
export const ResourceProvider = ({ children, config = {} }) => {
  const {
    apiEndpoint = '',
    resourceName = 'Resource',
    resourceNamePlural = 'Resources',
    idField = 'id',
    searchableFields = [],
    requiredFields = [],
    onAdd = () => {},
    onEdit = () => {},
    renderResourceContent = () => null,
    renderEmptyStateIcon = null,
    renderAdditionalMenuItems = null,
    getSearchField = null,
    getExportFilename = null,
    sortResources = null,
    customFilter = null,
    gridCols = 'grid-cols-1',
    hasCustomFields = false,
  } = config

  // State management - moved from component function
  const [resources, setResources] = useState([])
  const [searchType, setSearchType] = useState(searchableFields[0]?.value || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [hiddenFields, setHiddenFields] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customFields, setCustomFields] = useState(
    hasCustomFields ? [{ key: '', value: '' }] : []
  )

  // Core data fetching function
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(apiEndpoint)
      if (!response.ok)
        throw new Error(`Failed to fetch ${resourceNamePlural.toLowerCase()}`)
      const data = await response.json()
      setResources(data)
      setError(null)
    } catch (error) {
      console.error(
        `Error fetching ${resourceNamePlural.toLowerCase()}:`,
        error
      )
      setError(
        `Failed to load ${resourceNamePlural.toLowerCase()}. Please try again.`
      )
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, resourceNamePlural])

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Clipboard handling
  const handleCopy = useCallback(async (text, fieldId) => {
    try {
      const success = await copyToClipboardSecurely(text)
      if (success) {
        setCopiedField(fieldId)
        setTimeout(() => setCopiedField(null), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }, [])

  // Handle edit request
  const handleEdit = useCallback(
    (resource) => {
      if (onEdit) {
        onEdit(resource)
      }
      setOpenMenuId(null)
    },
    [onEdit]
  )

  // Handle add request
  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd()
    }
  }, [onAdd])

  // Handle delete
  const handleDelete = useCallback(
    async (resourceId) => {
      if (
        !confirm(
          `Are you sure you want to delete this ${resourceName.toLowerCase()}?`
        )
      )
        return

      try {
        const response = await fetch(apiEndpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [idField]: resourceId }),
        })

        if (!response.ok)
          throw new Error(`Failed to delete ${resourceName.toLowerCase()}`)

        await fetchResources()
        setOpenMenuId(null)
      } catch (error) {
        console.error(`Error deleting ${resourceName.toLowerCase()}:`, error)
        alert(
          `Failed to delete ${resourceName.toLowerCase()}. Please try again.`
        )
      }
    },
    [apiEndpoint, idField, resourceName, fetchResources]
  )

  // Toggle field visibility (for passwords and sensitive info)
  const toggleFieldVisibility = useCallback((resourceId, field = '') => {
    setHiddenFields((prev) => ({
      ...prev,
      [`${resourceId}${field ? '-' + field : ''}`]:
        !prev[`${resourceId}${field ? '-' + field : ''}`],
    }))
  }, [])

  // Export functions
  const handleExportAll = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'text' }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resourceNamePlural.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(
        `Error exporting ${resourceNamePlural.toLowerCase()}:`,
        error
      )
      alert(
        `Failed to export ${resourceNamePlural.toLowerCase()}. Please try again.`
      )
    }
  }, [apiEndpoint, resourceNamePlural])

  const handleExportResource = useCallback(
    async (resource) => {
      try {
        const content = prepareForExport(resource)
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Set the filename and download the file
        a.download = getExportFilename
          ? getExportFilename(resource)
          : `${resourceName.toLowerCase()}-${resource[idField]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        setOpenMenuId(null)
      } catch (error) {
        console.error(`Error exporting ${resourceName.toLowerCase()}:`, error)
        alert(
          `Failed to export ${resourceName.toLowerCase()}. Please try again.`
        )
      }
    },
    [getExportFilename, idField, resourceName]
  )

  // Filter resources - memoized to prevent unnecessary recomputation
  const filteredAndSortedResources = useMemo(() => {
    // Filter resources
    const filtered = resources.filter((resource) => {
      // Use custom filter if provided
      if (customFilter) {
        return customFilter(resource, searchTerm, searchType)
      }

      // Use the searchField from config if provided, otherwise default behavior
      const searchField = getSearchField
        ? getSearchField(resource, searchType)
        : String(resource[searchType] || '')

      return searchField.toLowerCase().includes(searchTerm.toLowerCase())
    })

    // Allow custom sorting if provided
    return sortResources ? sortResources(filtered) : filtered
  }, [resources, searchTerm, searchType, getSearchField, customFilter, sortResources])

  // Make all these values and functions available through context
  const contextValue = useMemo(
    () => ({
      resources,
      searchType,
      setSearchType,
      searchTerm,
      setSearchTerm,
      openMenuId,
      setOpenMenuId,
      copiedField,
      setCopiedField,
      hiddenFields,
      setHiddenFields,
      loading,
      error,
      customFields,
      setCustomFields,
      fetchResources,
      handleCopy,
      handleEdit,
      handleAdd,
      handleDelete,
      toggleFieldVisibility,
      handleExportAll,
      handleExportResource,
      filteredAndSortedResources,
      config: {
        apiEndpoint,
        resourceName,
        resourceNamePlural,
        idField,
        searchableFields,
        requiredFields,
        renderResourceContent,
        renderEmptyStateIcon,
        renderAdditionalMenuItems,
        gridCols,
        hasCustomFields,
      },
    }),
    [
      resources,
      searchType,
      searchTerm,
      openMenuId,
      copiedField,
      hiddenFields,
      loading,
      error,
      customFields,
      fetchResources,
      handleCopy,
      handleEdit,
      handleAdd,
      handleDelete,
      toggleFieldVisibility,
      handleExportAll,
      handleExportResource,
      filteredAndSortedResources,
      apiEndpoint,
      resourceName,
      resourceNamePlural,
      idField,
      searchableFields,
      requiredFields,
      renderResourceContent,
      renderEmptyStateIcon,
      renderAdditionalMenuItems,
      gridCols,
      hasCustomFields,
    ]
  )

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  )
}

// Hook to use resource context
export const useResource = () => {
  const context = useContext(ResourceContext)
  if (context === undefined) {
    throw new Error('useResource must be used within a ResourceProvider')
  }
  return context
}

// Resource List Component
export const ResourceList = () => {
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    handleAdd,
    handleExportAll,
    filteredAndSortedResources,
    config,
  } = useResource()

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading {config.resourceNamePlural.toLowerCase()}...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 w-full">
        {/* Add & Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleAdd} className="flex-1 md:flex-none gap-2">
            <Plus className="h-4 w-4" /> Add {config.resourceName}
          </Button>

          <Button
            onClick={handleExportAll}
            disabled={filteredAndSortedResources.length === 0}
            variant="outline"
            className="flex-1 md:flex-none gap-2"
          >
            <FileText className="h-4 w-4" /> Export All
          </Button>
        </div>

        {/* Search Controls */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-black"
          >
            {config.searchableFields.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${config.resourceNamePlural.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!error && filteredAndSortedResources.length === 0 && <EmptyState />}

      {/* Resources Grid */}
      <div className={`grid ${config.gridCols || 'grid-cols-1'} gap-6`}>
        {filteredAndSortedResources.map((resource) => (
          <ResourceCard key={resource[config.idField]} resource={resource} />
        ))}
      </div>
    </div>
  )
}

// Empty State Component
const EmptyState = () => {
  const { searchTerm, config } = useResource()

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        {config.renderEmptyStateIcon ? (
          config.renderEmptyStateIcon()
        ) : (
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-black mb-2">
        No {config.resourceNamePlural.toLowerCase()} found
      </h3>
      <p className="text-gray-500">
        {searchTerm
          ? `No ${config.resourceNamePlural.toLowerCase()} match your search criteria`
          : `Get started by adding your first ${config.resourceName.toLowerCase()}`}
      </p>
    </div>
  )
}

// Resource Card Component
const ResourceCard = ({ resource }) => {
  const {
    openMenuId,
    setOpenMenuId,
    handleEdit,
    handleExportResource,
    handleDelete,
    hiddenFields,
    toggleFieldVisibility,
    handleCopy,
    copiedField,
    config,
  } = useResource()

  const resourceId = resource[config.idField]

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Resource Menu */}
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={() =>
            setOpenMenuId(openMenuId === resourceId ? null : resourceId)
          }
          className="happy-button-ghost"
        >
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>

        {openMenuId === resourceId && (
          <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-xl backdrop-blur-xl">
            <button
              onClick={() => handleEdit(resource)}
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-fuchsia-50"
            >
              <Edit className="h-4 w-4 text-fuchsia-500" /> Edit {config.resourceName}
            </button>
            <button
              onClick={() => handleExportResource(resource)}
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50"
            >
              <FileText className="h-4 w-4 text-emerald-500" /> Export{' '}
              {config.resourceName}
            </button>
            {/* Additional menu items if provided */}
            {config.renderAdditionalMenuItems &&
              config.renderAdditionalMenuItems(resource, {
                handleCopy,
                copiedField,
              })}
            <button
              onClick={() => handleDelete(resourceId)}
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
            >
              <Trash className="h-4 w-4 text-rose-500" /> Delete{' '}
              {config.resourceName}
            </button>
          </div>
        )}
      </div>

      <CardContent className="px-6 pb-6 pt-10">
        {/* Resource Details - Render using the config's renderResourceContent function */}
        <div className="space-y-4 overflow-hidden pr-6 sm:pr-12">
          {config.renderResourceContent(resource, {
            hiddenFields,
            toggleFieldVisibility,
            handleCopy,
            copiedField,
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function for rendering fields
export const renderField = (label, value, options = {}) => {
  const {
    copyable = false,
    onCopy,
    fieldId,
    copiedField,
    className = '',
  } = options

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 ${className}`}
    >
      <span className="min-w-[140px] text-sm font-medium text-slate-600">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="max-w-full break-all text-sm font-semibold text-slate-800">
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={() => onCopy(value, fieldId)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 ${
              copiedField === fieldId ? 'text-emerald-500' : 'text-slate-500'
            }`}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function for rendering password fields
export const renderPasswordField = (label, value, options = {}) => {
  const {
    isVisible = false,
    onToggleVisibility,
    onCopy,
    fieldId,
    copiedField,
    className = '',
  } = options

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 ${className}`}
    >
      <span className="min-w-[140px] text-sm font-medium text-slate-600">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="max-w-full break-all text-sm font-semibold text-slate-800">
          {isVisible ? value : '••••••••'}
        </span>
        <button
          type="button"
          onClick={onToggleVisibility}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"
          title={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onCopy(value, fieldId)}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 ${
            copiedField === fieldId ? 'text-emerald-500' : 'text-slate-500'
          }`}
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Helper function for rendering custom fields
export const renderCustomFields = (customFields, options = {}) => {
  const { title = 'Custom Fields', onCopy, copiedField, resourceId } = options

  if (!customFields || Object.keys(customFields).length === 0) return null

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-600">{title}:</h4>
      <div className="space-y-2">
        {Object.entries(customFields).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <span className="font-medium text-slate-500">{key}:</span>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="break-all">{value}</span>
              <button
                onClick={() => onCopy(value, `custom-${resourceId}-${key}`)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 ${
                  copiedField === `custom-${resourceId}-${key}`
                    ? 'text-emerald-500'
                    : 'text-slate-500'
                }`}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function for rendering custom fields form
