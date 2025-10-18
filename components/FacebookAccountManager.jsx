'use client'

import { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  ResourceProvider,
  renderField,
  renderPasswordField,
  useResource,
} from './common/ResourceManager'
import { generate2FACode } from '@/utils/2fa'
import { X, Eye, EyeOff, Copy, GripVertical, Plus, FileText, Search, MoreVertical, Edit, Trash } from 'lucide-react'

// TOTP Timer Component - Memoized
const TOTPTimer = memo(function TOTPTimer({ secret }) {
  const [code, setCode] = useState(() =>
    secret ? generate2FACode(secret) : '------'
  )
  const [timeRemaining, setTimeRemaining] = useState(30)

  useEffect(() => {
    const calculateRemainingTime = () => {
      const epoch = Math.floor(Date.now() / 1000)
      return 30 - (epoch % 30)
    }

    setTimeRemaining(calculateRemainingTime())

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime()
      setTimeRemaining(remaining)

      if (remaining === 30 && secret) {
        setCode(generate2FACode(secret))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [secret])

  const progressPercentage = Math.max(
    0,
    Math.min(100, (timeRemaining / 30) * 100)
  )

  return (
    <div className="flex min-w-[160px] flex-col items-end gap-1 text-right">
      <span className="font-mono text-base tracking-[0.4em] text-slate-800">
        {code}
      </span>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="h-1.5 w-24 rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              timeRemaining <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="tabular-nums text-xs text-slate-600">
          {timeRemaining}s
        </span>
      </div>
    </div>
  )
})

// Memoized Form Input Component
const FormInput = memo(function FormInput({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  ...props
}) {
  return (
    <div>
      <label className="happy-label">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        className="happy-input"
        {...props}
      />
    </div>
  )
})

// Memoized Password Input Component
const PasswordInput = memo(function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  toggleShowPassword,
  required = false,
}) {
  return (
    <div>
      <label className="happy-label">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          required={required}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="happy-input pr-12"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-fuchsia-400 transition-colors hover:text-fuchsia-600"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
})

// Tag Suggestions Component - Memoized
const TagSuggestions = memo(function TagSuggestions({
  currentTagInput,
  suggestions,
  onSelect,
}) {
  if (!currentTagInput || suggestions.length === 0) return null

  // Only compute filtered suggestions if we have input and suggestions
  const filteredSuggestions = suggestions.filter((tag) =>
    tag.toLowerCase().includes(currentTagInput.toLowerCase())
  )

  if (filteredSuggestions.length === 0) return null

  return (
    <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-3xl border border-white/70 bg-white/90 shadow-xl backdrop-blur-xl">
      {filteredSuggestions.map((tag, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(tag)}
          className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-fuchsia-50 focus:outline-none focus:bg-fuchsia-50"
        >
          {tag}
        </button>
      ))}
    </div>
  )
})

// Dialog Component
const FacebookAccountDialog = memo(function FacebookAccountDialog({
  isOpen,
  onClose,
  account,
  onSubmit,
  groups,
  defaultGroupId,
}) {
  // Single form data state
  const [formData, setFormData] = useState(() => ({
    userId: '',
    password: '',
    email: '',
    emailPassword: '',
    recoveryEmail: '',
    twoFASecret: '',
    dob: '',
    tags: '',
    showPassword: false,
    showEmailPassword: false,
    currentTagInput: '',
    id: null,
    groupId: defaultGroupId ?? null,
  }))

  // Update form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        userId: account.userId || '',
        password: account.password || '',
        email: account.email || '',
        emailPassword: account.emailPassword || '',
        recoveryEmail: account.recoveryEmail || '',
        twoFASecret: account.twoFASecret || '',
        dob: account.dob ? account.dob.split('T')[0] : '',
        tags: account.tags || '',
        showPassword: false,
        showEmailPassword: false,
        currentTagInput: '',
        id: account.id,
        groupId: account.groupId ?? defaultGroupId ?? null,
      })
    } else {
      // Reset form when adding a new account
      setFormData({
        userId: '',
        password: '',
        email: '',
        emailPassword: '',
        recoveryEmail: '',
        twoFASecret: '',
        dob: '',
        tags: '',
        showPassword: false,
        showEmailPassword: false,
        currentTagInput: '',
        id: null,
        groupId: defaultGroupId ?? null,
      })
    }
  }, [account, defaultGroupId])

  // Tag suggestions state
  const [tagSuggestions, setTagSuggestions] = useState([])
  const tagInputRef = useRef(null)

  // Update field function
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }, [])

  // Tag handlers
  const handleTagInputChange = useCallback(
    (e) => {
      const value = e.target.value
      updateField('tags', value)

      const tagsArray = value.split(',')
      const currentInput = tagsArray[tagsArray.length - 1].trim()
      updateField('currentTagInput', currentInput)
    },
    [updateField]
  )

  const handleTagSelection = useCallback(
    (tag) => {
      const currentTags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
      currentTags.pop() // Remove the last (incomplete) tag
      const newTags = [...currentTags, tag].join(', ')
      setFormData((prev) => ({
        ...prev,
        tags: newTags + ', ',
        currentTagInput: '',
      }))
      tagInputRef.current?.focus()
    },
    [formData.tags]
  )

  // Fetch tag suggestions
  const fetchTagSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/api/facebook-accounts?getTags=true')
      if (!response.ok) throw new Error('Failed to fetch tags')
      const tags = await response.json()
      setTagSuggestions(tags)
    } catch (error) {
      console.error('Error fetching tag suggestions:', error)
    }
  }, [])

  // Form submission handler
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()

      const accountData = {
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        emailPassword: formData.emailPassword,
        recoveryEmail: formData.recoveryEmail,
        twoFASecret: formData.twoFASecret,
        tags: formData.tags,
        dob: formData.dob || null,
        groupId: formData.groupId,
      }

      if (formData.id) {
        accountData.id = formData.id
      }

      onSubmit(accountData)
    },
    [formData, onSubmit]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="happy-card my-8 w-full max-w-xl border-white/70 bg-white/90 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Fixed Header */}
        <div className="relative flex-shrink-0 border-b border-slate-100 px-6 py-6">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-fuchsia-200/50 blur-3xl"></div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                {account ? 'Update this account' : 'Add a joyful account'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Keep credentials sparkling clean with tags, secrets, and 2FA.
              </p>
            </div>
            <button onClick={onClose} className="happy-button-ghost flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5" id="account-form">
            <div>
              <label className="happy-label">
                Assign to group <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.groupId ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    groupId: Number(e.target.value),
                  }))
                }
                className="happy-input"
                required
              >
                <option value="" disabled>
                  Select a group
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="User ID"
              value={formData.userId}
              onChange={(e) => updateField('userId', e.target.value)}
              placeholder="Enter user ID"
              required
            />

            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              showPassword={formData.showPassword}
              toggleShowPassword={() => togglePasswordVisibility('showPassword')}
              required
            />

            <FormInput
              label="Email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              type="email"
              placeholder="Enter email (optional)"
            />

            <PasswordInput
              label="Email Password"
              value={formData.emailPassword}
              onChange={(e) => updateField('emailPassword', e.target.value)}
              showPassword={formData.showEmailPassword}
              toggleShowPassword={() =>
                togglePasswordVisibility('showEmailPassword')
              }
            />

            <FormInput
              label="Recovery Email"
              value={formData.recoveryEmail}
              onChange={(e) => updateField('recoveryEmail', e.target.value)}
              type="email"
              placeholder="Enter recovery email (optional)"
            />

            <FormInput
              label="2FA Secret"
              value={formData.twoFASecret}
              onChange={(e) => updateField('twoFASecret', e.target.value)}
              placeholder="Enter 2FA secret (optional)"
            />

            <div className="relative">
              <label className="happy-label">Tags</label>
              <input
                ref={tagInputRef}
                value={formData.tags}
                onChange={handleTagInputChange}
                className="happy-input"
                placeholder="Enter tags, separated by commas"
                onFocus={fetchTagSuggestions}
              />
              <TagSuggestions
                currentTagInput={formData.currentTagInput}
                suggestions={tagSuggestions}
                onSelect={handleTagSelection}
              />
            </div>

            <FormInput
              label="Date of Birth"
              value={formData.dob}
              onChange={(e) => updateField('dob', e.target.value)}
              type="date"
            />
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4">
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="happy-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="account-form"
              className="happy-button-primary"
            >
              {account ? 'Save sparkle' : 'Add account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

// Custom Draggable Facebook Accounts List Component
const DraggableFacebookAccountsList = memo(function DraggableFacebookAccountsList({
  groups,
  activeGroupId,
  setActiveGroupId,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  refreshGroups,
}) {
  const {
    searchType,
    setSearchType,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    handleExportAll,
    filteredAndSortedResources,
    config,
    fetchResources,
  } = useResource()

  const [selectedAccountIds, setSelectedAccountIds] = useState([])
  const [moveTargetGroupId, setMoveTargetGroupId] = useState('')

  // Tag Replace UI state and helpers
  const [fromTag, setFromTag] = useState('')
  const [toTag, setToTag] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCandidate = candidates[currentIndex]
  const [moving, setMoving] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState(null)
  const [draggedOverId, setDraggedOverId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [reorderedItems, setReorderedItems] = useState([])

  const replaceTokens = useCallback((tagsString, from, to) => {
    const tokens = String(tagsString || '')
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    return tokens.map((t) => (t === from ? to : t)).join(', ')
  }, [])

  const handleReplaceAll = useCallback(async () => {
    if (!fromTag || !toTag) {
      setMessage('Please provide both tags.')
      return
    }
    try {
      setBusy(true)
      setMessage('')
      const res = await fetch('/api/facebook-accounts/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromTag: fromTag.trim(), toTag: toTag.trim() }),
      })
      if (!res.ok) throw new Error('Replace failed')
      const data = await res.json()
      setMessage(`Matched ${data.matched}, updated ${data.updated}.`)
      await fetchResources()
    } catch (e) {
      console.error(e)
      setMessage('Failed to replace tags.')
    } finally {
      setBusy(false)
    }
  }, [fromTag, toTag, fetchResources])

  const handleStartReview = useCallback(async () => {
    if (!fromTag || !toTag) {
      setMessage('Please provide both tags to review.')
      return
    }
    try {
      setBusy(true)
      setMessage('')
      const res = await fetch(`/api/facebook-accounts/tags?from=${encodeURIComponent(fromTag.trim())}`)
      if (!res.ok) throw new Error('Failed to load candidates')
      const data = await res.json()
      setCandidates(data.candidates || [])
      setCurrentIndex(0)
      setReviewing(true)
    } catch (e) {
      console.error(e)
      setMessage('Failed to load candidates.')
    } finally {
      setBusy(false)
    }
  }, [fromTag, toTag])

  const handleReplaceCurrent = useCallback(async () => {
    const c = currentCandidate
    if (!c) return
    try {
      setBusy(true)
      const newTags = replaceTokens(c.tags, fromTag.trim(), toTag.trim())
      const res = await fetch('/api/facebook-accounts/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, tags: newTags }),
      })
      if (!res.ok) throw new Error('Update failed')
      if (currentIndex + 1 >= candidates.length) {
        setMessage('Review complete.')
        setReviewing(false)
        setCandidates([])
        await fetchResources()
      } else {
        setCurrentIndex((i) => i + 1)
      }
    } catch (e) {
      console.error(e)
      setMessage('Failed to update current item.')
    } finally {
      setBusy(false)
    }
  }, [currentCandidate, fromTag, toTag, currentIndex, candidates.length, replaceTokens, fetchResources])

  const handleReplaceAllRemaining = useCallback(async () => {
    try {
      setBusy(true)
      const remaining = candidates.slice(currentIndex)
      for (const c of remaining) {
        const newTags = replaceTokens(c.tags, fromTag.trim(), toTag.trim())
        await fetch('/api/facebook-accounts/tags', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: c.id, tags: newTags }),
        })
      }
      setMessage('Updated remaining candidates.')
      setReviewing(false)
      setCandidates([])
      await fetchResources()
    } catch (e) {
      console.error(e)
      setMessage('Failed to update remaining candidates.')
    } finally {
      setBusy(false)
    }
  }, [candidates, currentIndex, fromTag, toTag, replaceTokens, fetchResources])

  const toggleSelectAccount = useCallback((accountId) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    )
  }, [])

  const handleToggleSelectAll = useCallback(() => {
    setSelectedAccountIds((prev) => {
      const visibleIds = reorderedItems.map((account) => account.id)
      const allSelected = visibleIds.every((id) => prev.includes(id))
      return allSelected ? [] : visibleIds
    })
  }, [reorderedItems])

  const handleMoveSelected = useCallback(async () => {
    if (!moveTargetGroupId || selectedAccountIds.length === 0) return
    try {
      setMoving(true)
      setMessage('')
      const res = await fetch('/api/facebook-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          accountIds: selectedAccountIds,
          targetGroupId: Number(moveTargetGroupId),
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to move accounts')
      }
      await fetchResources()
      await refreshGroups()
      setSelectedAccountIds([])
      setMoveTargetGroupId('')
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Failed to move selected accounts.')
    } finally {
      setMoving(false)
    }
  }, [moveTargetGroupId, selectedAccountIds, fetchResources, refreshGroups])

  const visibleAccountIds = useMemo(
    () => reorderedItems.map((account) => account.id),
    [reorderedItems]
  )
  const allVisibleSelected = useMemo(() => {
    if (visibleAccountIds.length === 0) return false
    return visibleAccountIds.every((id) => selectedAccountIds.includes(id))
  }, [visibleAccountIds, selectedAccountIds])

  const selectionCount = selectedAccountIds.length

  // Dialog state (moved inside ResourceProvider context)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  // Open dialog
  const openDialog = useCallback((account = null) => {
    setEditingAccount(account)
    setDialogOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  // Close dialog
  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingAccount(null)
    document.body.style.overflow = 'auto'
  }, [])

  // Form submission handler (now has access to fetchResources)
  const handleSubmit = useCallback(
    async (accountData) => {
      try {
        const method = editingAccount ? 'PUT' : 'POST'
        const response = await fetch('/api/facebook-accounts', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        })

        if (!response.ok) throw new Error('Failed to save account')

        closeDialog()
        // Refresh the resource list to show updated data
        await fetchResources()
        await refreshGroups()
      } catch (error) {
        console.error('Error saving account:', error)
        alert('Failed to save account')
      }
    },
    [editingAccount, closeDialog, fetchResources, refreshGroups]
  )

  // Initialize reordered items with current resources
  useEffect(() => {
    setReorderedItems(filteredAndSortedResources)
    setSelectedAccountIds((prev) =>
      prev.filter((id) =>
        filteredAndSortedResources.some((account) => account.id === id)
      )
    )
  }, [filteredAndSortedResources])

  useEffect(() => {
    setSelectedAccountIds([])
    setMoveTargetGroupId('')
  }, [activeGroupId])

  // Handle drag start
  const handleDragStart = useCallback((e, account) => {
    setDraggedItemId(account.id)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e, targetAccount) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (!draggedItemId || draggedItemId === targetAccount.id) return

    setDraggedOverId(targetAccount.id)

    // Find current positions
    const draggedIndex = reorderedItems.findIndex(acc => acc.id === draggedItemId)
    const targetIndex = reorderedItems.findIndex(acc => acc.id === targetAccount.id)

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return

    // Create new array with reordered items
    const newItems = [...reorderedItems]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    setReorderedItems(newItems)
  }, [draggedItemId, reorderedItems])

  // Handle drag enter  
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOverId(null)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    
    if (!draggedItemId) {
      setDraggedItemId(null)
      setDraggedOverId(null)
      setIsDragging(false)
      return
    }

    try {
      // Send reorder request to API with current reordered items
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reorder',
          accounts: reorderedItems.map(acc => ({ id: acc.id })),
          groupId: activeGroupId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder accounts')
      }

      // Fetch fresh data from server to ensure proper order
      await fetchResources()
      await refreshGroups()
    } catch (error) {
      console.error('Error reordering accounts:', error)
      // Revert to original order on error
      setReorderedItems(filteredAndSortedResources)
    }

    // Cleanup
    setDraggedItemId(null)
    setDraggedOverId(null)
    setIsDragging(false)
  }, [draggedItemId, reorderedItems, config.apiEndpoint, fetchResources, filteredAndSortedResources, activeGroupId, refreshGroups])

  // Handle drag end - cleanup
  const handleDragEnd = useCallback(() => {
    setDraggedItemId(null)
    setDraggedOverId(null)
    setIsDragging(false)
  }, [])

  if (loading) {
    return (
      <div className="happy-card mx-auto max-w-md px-8 py-12 text-center animate-floaty">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-400 to-indigo-400 text-white shadow-lg">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-700">
          Loading {config.resourceNamePlural.toLowerCase()}...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Warming up your sparkling vault. One moment please!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="happy-card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Groups</h3>
            <p className="text-sm text-slate-500">
              Organize accounts into friendly vault clusters.
            </p>
          </div>
          <button
            onClick={onCreateGroup}
            className="happy-button-secondary"
          >
            + New group
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {groups.map((group) => {
            const isActive = group.id === activeGroupId
            return (
              <div
                key={group.id}
                className={`flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 shadow-sm transition-all ${
                  isActive ? 'ring-2 ring-fuchsia-300 shadow-md' : ''
                }`}
              >
                <button
                  onClick={() => setActiveGroupId(group.id)}
                  className={`text-sm font-semibold ${
                    isActive ? 'text-fuchsia-600' : 'text-slate-600'
                  }`}
                >
                  {group.name}
                </button>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {group.accountCount}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRenameGroup(group)}
                    className="happy-button-ghost text-xs"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => onDeleteGroup(group)}
                    disabled={group.accountCount > 0}
                    className="happy-button-ghost text-xs disabled:opacity-40"
                    title={
                      group.accountCount > 0
                        ? 'Move accounts out before deleting'
                        : 'Delete group'
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectionCount > 0 && (
        <div className="happy-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-slate-600">
            {selectionCount} account{selectionCount === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={moveTargetGroupId}
              onChange={(e) => setMoveTargetGroupId(e.target.value)}
              className="happy-input"
            >
              <option value="">Select destination group</option>
              {groups
                .filter((group) => group.id !== activeGroupId)
                .map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
            <button
              onClick={handleMoveSelected}
              disabled={!moveTargetGroupId || moving}
              className="happy-button-primary disabled:opacity-50"
            >
              {moving ? 'Moving...' : 'Move to group'}
            </button>
            <button
              onClick={() => setSelectedAccountIds([])}
              className="happy-button-ghost"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Tag Replace Bar */}
      <div className="happy-card p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="happy-label">Find tag</label>
            <input
              value={fromTag}
              onChange={(e) => setFromTag(e.target.value)}
              className="happy-input"
              placeholder="e.g. Jayesh"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="happy-label">Replace with</label>
            <input
              value={toTag}
              onChange={(e) => setToTag(e.target.value)}
              className="happy-input"
              placeholder="e.g. Aminesh"
            />
          </div>
          <div className="flex gap-3 md:ml-auto">
            <button
              onClick={handleReplaceAll}
              disabled={busy || !fromTag || !toTag}
              className="happy-button-primary disabled:opacity-70 disabled:grayscale"
            >
              Replace all
            </button>
            <button
              onClick={handleStartReview}
              disabled={busy || !fromTag || !toTag}
              className="happy-button-secondary disabled:opacity-50"
            >
              Review one by one
            </button>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
        )}
      </div>

      {reviewing && currentCandidate && (
        <div className="happy-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-700">
              Review {currentIndex + 1} of {candidates.length}
            </h4>
            <button
              className="happy-button-ghost text-sm"
              onClick={() => {
                setReviewing(false)
                setCandidates([])
              }}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-500">User:</span>{' '}
              {currentCandidate.userId}
            </div>
            <div>
              <span className="font-medium text-slate-500">Current tags:</span>{' '}
              {currentCandidate.tags || '(none)'}
            </div>
            <div>
              <span className="font-medium text-slate-500">After replace:</span>{' '}
              <span className="happy-tag bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 text-white shadow-none">
                {replaceTokens(currentCandidate.tags, fromTag, toTag)}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleReplaceCurrent}
              disabled={busy}
              className="happy-button-primary disabled:opacity-70 disabled:grayscale"
            >
              Replace
            </button>
            <button
              onClick={() => {
                if (currentIndex + 1 >= candidates.length) {
                  setMessage('Review complete.')
                  setReviewing(false)
                  setCandidates([])
                } else {
                  setCurrentIndex((i) => i + 1)
                }
              }}
              disabled={busy}
              className="happy-button-secondary disabled:opacity-50"
            >
              Skip
            </button>
            <button
              onClick={handleReplaceAllRemaining}
              disabled={busy}
              className="happy-button-secondary disabled:opacity-50"
            >
              Replace All Remaining
            </button>
          </div>
        </div>
      )}
      {/* Header Controls */}
      <div className="happy-card flex w-full flex-col gap-6 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Add & Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => openDialog()}
            className="happy-button-primary flex flex-1 items-center justify-center gap-2 md:flex-none"
          >
            <Plus className="h-4 w-4" /> Add {config.resourceName}
          </button>

          <button
            onClick={handleExportAll}
            disabled={reorderedItems.length === 0}
            className="happy-button-secondary flex flex-1 items-center justify-center gap-2 disabled:opacity-50 md:flex-none"
          >
            <FileText className="h-4 w-4" /> Export All
          </button>
        </div>

        {/* Search Controls */}
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="happy-input cursor-pointer bg-white"
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
              className="happy-input w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSelectAll}
            className="happy-button-secondary"
            disabled={reorderedItems.length === 0}
          >
            {allVisibleSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="happy-card border border-rose-200 bg-rose-50/80 p-6 text-rose-600 shadow-none">
          <span className="block font-medium">{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!error && reorderedItems.length === 0 && (
        <div className="happy-card p-12 text-center">
          <div className="mb-6 text-6xl">📱</div>
          <h3 className="mb-2 text-2xl font-semibold text-slate-700">
            No {config.resourceNamePlural.toLowerCase()} found
          </h3>
          <p className="mb-6 text-slate-500">
            {searchTerm
              ? `No ${config.resourceNamePlural.toLowerCase()} match your search.`
              : `You haven't added any ${config.resourceNamePlural.toLowerCase()} yet.`}
          </p>
          <button
            onClick={() => openDialog()}
            className="happy-button-primary"
          >
            Add {config.resourceName}
          </button>
        </div>
      )}

      {/* Draggable Resources Grid */}
      <div className="grid grid-cols-1 gap-6">
        {reorderedItems.map((account) => (
          <DraggableAccountCard
            key={account.id}
            account={account}
            isDragging={isDragging && draggedItemId === account.id}
            isDraggedOver={draggedOverId === account.id}
            onDragStart={(e) => handleDragStart(e, account)}
            onDragOver={(e) => handleDragOver(e, account)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onEdit={(account) => openDialog(account)}
            isSelected={selectedAccountIds.includes(account.id)}
            onToggleSelect={toggleSelectAccount}
          />
        ))}
      </div>

      {/* Custom Dialog for Adding/Editing Facebook Accounts */}
      <FacebookAccountDialog
        isOpen={dialogOpen}
        onClose={closeDialog}
        account={editingAccount}
        onSubmit={handleSubmit}
        groups={groups}
        defaultGroupId={activeGroupId}
      />
    </div>
  )
})

// Draggable Account Card Component  
const DraggableAccountCard = memo(function DraggableAccountCard({
  account,
  isDragging,
  isDraggedOver,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onEdit,
  isSelected,
  onToggleSelect,
}) {
  const {
    openMenuId,
    setOpenMenuId,
    handleExportResource,
    handleDelete,
    hiddenFields,
    toggleFieldVisibility,
    handleCopy,
    copiedField,
    config,
  } = useResource()

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        happy-card relative cursor-grab border-white/60 bg-white/90 transition-all duration-300 active:cursor-grabbing
        ${isDraggedOver ? 'ring-4 ring-fuchsia-200 ring-offset-4 scale-[1.01]' : ''}
        ${isDragging ? 'scale-95 opacity-40' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-400 shadow-sm transition-colors hover:text-fuchsia-500">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Card Header with Select and Menu */}
      <div className="border-b border-slate-100 px-6 py-4 md:pl-16">
        <div className="flex items-center justify-end gap-3">
          <label
            className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-fuchsia-300 hover:bg-fuchsia-50"
            onClick={(e) => e.preventDefault()}
          >
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:ring-offset-0"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onToggleSelect(account.id)
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Select</span>
          </label>
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenuId(openMenuId === account.id ? null : account.id)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:text-fuchsia-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {openMenuId === account.id && (
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
                <button
                  onClick={() => onEdit(account)}
                  className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-fuchsia-50"
                >
                  <Edit className="h-4 w-4 text-fuchsia-500" /> Edit {config.resourceName}
                </button>
                <button
                  onClick={() => handleExportResource(account)}
                  className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50"
                >
                  <FileText className="h-4 w-4 text-emerald-500" /> Export {config.resourceName}
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                >
                  <Trash className="h-4 w-4 text-rose-500" /> Delete {config.resourceName}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-6 md:pl-16">
        {/* Account Details */}
        <div className="space-y-4 pr-6 sm:pr-12">
          {config.renderResourceContent(account, {
            hiddenFields,
            toggleFieldVisibility,
            handleCopy,
            copiedField,
          })}
        </div>
      </div>
    </div>
  )
})

export function FacebookAccountManagerContainer() {
  const [groups, setGroups] = useState([])
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groupError, setGroupError] = useState('')

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true)
      const res = await fetch('/api/facebook-groups')
      if (!res.ok) throw new Error('Failed to load groups')
      const data = await res.json()
      setGroups(data)
      setGroupError('')
    } catch (error) {
      console.error(error)
      setGroupError('Unable to load groups. Please try again.')
    } finally {
      setLoadingGroups(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    if (!groups.length) {
      setActiveGroupId(null)
      return
    }
    if (!activeGroupId || !groups.some((group) => group.id === activeGroupId)) {
      setActiveGroupId(groups[0].id)
    }
  }, [groups, activeGroupId])

  const handleCreateGroup = useCallback(async () => {
    const name = window.prompt('Name your new group:')
    if (!name) return
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      const res = await fetch('/api/facebook-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to create group')
      }
      const created = await res.json()
      await fetchGroups()
      setActiveGroupId(created.id)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Failed to create group')
    }
  }, [fetchGroups])

  const handleRenameGroup = useCallback(
    async (group) => {
      const name = window.prompt('Rename group:', group.name)
      if (!name || name.trim() === group.name) return
      try {
        const res = await fetch('/api/facebook-groups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: group.id, name: name.trim() }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to rename group')
        }
        await fetchGroups()
      } catch (error) {
        console.error(error)
        alert(error.message || 'Failed to rename group')
      }
    },
    [fetchGroups]
  )

  const handleDeleteGroup = useCallback(
    async (group) => {
      if (group.accountCount > 0) {
        alert('Move or delete accounts in this group before deleting it.')
        return
      }
      const confirmed = window.confirm(
        `Delete group "${group.name}"? This cannot be undone.`
      )
      if (!confirmed) return
      try {
        setActiveGroupId((prev) => (prev === group.id ? null : prev))
        const res = await fetch('/api/facebook-groups', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: group.id }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to delete group')
        }
        await fetchGroups()
      } catch (error) {
        console.error(error)
        alert(error.message || 'Failed to delete group')
      }
    },
    [fetchGroups]
  )

  const resourceConfig = useMemo(
    () => ({
      apiEndpoint: '/api/facebook-accounts',
      resourceName: 'Account',
      resourceNamePlural: 'Accounts',
      idField: 'id',
      searchableFields: [
        { value: 'userId', label: 'User ID' },
        { value: 'email', label: 'Email' },
        { value: 'tags', label: 'Tags' },
        { value: 'password', label: 'Password' },
      ],
      requiredFields: ['userId', 'password'],
      getSearchField: (account, searchType) => {
        if (searchType === 'email') return String(account.email || '')
        if (searchType === 'password') return String(account.password || '')
        if (searchType === 'tags') return String(account.tags || '')
        return String(account.userId || '')
      },
      customFilter: (account, searchTerm, searchType) => {
        if (!activeGroupId || account.groupId !== activeGroupId) {
          return false
        }

        if (searchType === 'tags' && searchTerm.trim()) {
          const accountTags = (account.tags || '').toLowerCase()
          const searchTerms = searchTerm
            .toLowerCase()
            .split(',')
            .map((term) => term.trim())
            .filter((term) => term.length > 0)

          return searchTerms.every((searchTag) =>
            accountTags.includes(searchTag)
          )
        }

        const searchField =
          searchType === 'email'
            ? account.email || ''
            : searchType === 'password'
              ? account.password || ''
              : searchType === 'tags'
                ? account.tags || ''
                : account.userId || ''

        return String(searchField)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      },
      sortResources: (resources) =>
        [...resources].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      getExportFilename: (account) => {
        const safeUserId = (account.userId?.toString() || 'account')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
        return `facebook-account-${safeUserId}.txt`
      },
      renderResourceContent: (
        account,
        { hiddenFields, toggleFieldVisibility, handleCopy, copiedField }
      ) => (
        <>
          {renderField('User ID:', account.userId, {
            copyable: true,
            onCopy: handleCopy,
            fieldId: `userid-${account.id}`,
            copiedField,
          })}
          {renderPasswordField('Password:', account.password, {
            isVisible: hiddenFields[`${account.id}-password`],
            onToggleVisibility: () =>
              toggleFieldVisibility(account.id, 'password'),
            onCopy: handleCopy,
            fieldId: `password-${account.id}`,
            copiedField,
          })}
          {account.email &&
            renderField('Email:', account.email, {
              copyable: true,
              onCopy: handleCopy,
              fieldId: `email-${account.id}`,
              copiedField,
              className: 'break-all',
            })}
          {account.emailPassword &&
            renderPasswordField('Email Password:', account.emailPassword, {
              isVisible: hiddenFields[`${account.id}-emailPassword`],
              onToggleVisibility: () =>
                toggleFieldVisibility(account.id, 'emailPassword'),
              onCopy: handleCopy,
              fieldId: `emailpass-${account.id}`,
              copiedField,
            })}
          {account.recoveryEmail &&
            renderField('Recovery Email:', account.recoveryEmail, {
              copyable: true,
              onCopy: handleCopy,
              fieldId: `recoveryemail-${account.id}`,
              copiedField,
              className: 'break-all',
            })}
          {account.twoFASecret && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <span className="min-w-[140px] text-sm font-medium text-slate-600">
                2FA Code:
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                <TOTPTimer secret={account.twoFASecret} />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      generate2FACode(account.twoFASecret),
                      `2fa-${account.id}`
                    )
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 ${
                    copiedField === `2fa-${account.id}`
                      ? 'text-emerald-500'
                      : 'text-slate-500'
                  }`}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {account.tags && account.tags.trim() !== '' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <span className="min-w-[140px] text-sm font-medium text-slate-600">
                Tags:
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                {account.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          {account.dob &&
            renderField(
              'Date of Birth:',
              new Date(account.dob).toLocaleDateString()
            )}
        </>
      ),
    }),
    [activeGroupId]
  )

  if (loadingGroups) {
    return (
      <div className="happy-card mx-auto max-w-md px-8 py-10 text-center">
        <p className="text-sm font-semibold text-slate-600">
          Loading groups...
        </p>
      </div>
    )
  }

  if (groupError) {
    return (
      <div className="happy-card mx-auto max-w-md space-y-4 px-8 py-10 text-center text-rose-600">
        <p className="font-semibold">{groupError}</p>
        <button onClick={fetchGroups} className="happy-button-primary">
          Retry
        </button>
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="happy-card mx-auto max-w-xl space-y-4 px-10 py-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-700">
          No groups yet
        </h2>
        <p className="text-sm text-slate-500">
          Create your first group to start organizing Facebook accounts.
        </p>
        <button onClick={handleCreateGroup} className="happy-button-primary">
          Create group
        </button>
      </div>
    )
  }

  return (
    <ResourceProvider config={resourceConfig}>
      <DraggableFacebookAccountsList
        groups={groups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
        onCreateGroup={handleCreateGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        refreshGroups={fetchGroups}
      />
    </ResourceProvider>
  )
}

export default FacebookAccountManagerContainer
