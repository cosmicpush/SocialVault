import CryptoJS from 'crypto-js'

const key =
  process.env.ENCRYPTION_KEY ||
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  'eT9QYgXmbJ4QFHss9fDkUm3Zd8VNyLC2' // Remove this fallback

export function encrypt(data) {
  if (!data) return data
  try {
    const textToEncrypt =
      typeof data === 'object' ? JSON.stringify(data) : String(data)
    const paddedText = `v1:${textToEncrypt}`
    return CryptoJS.AES.encrypt(paddedText, key).toString()
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key)
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

    if (!decryptedText) {
      return encryptedText
    }

    const plainText = decryptedText.startsWith('v1:')
      ? decryptedText.substring(3)
      : decryptedText

    try {
      return JSON.parse(plainText)
    } catch {
      return plainText
    }
  } catch (error) {
    console.error('Decryption error:', error)
    return '' // Return empty string on error instead of the encrypted text
  }
}

export function encryptFacebookAccount(account) {
  try {
    return {
      ...account,
      userId: encrypt(account.userId),
      password: encrypt(account.password),
      email: account.email ? encrypt(account.email) : null,
      emailPassword: account.emailPassword
        ? encrypt(account.emailPassword)
        : null,
      recoveryEmail: account.recoveryEmail
        ? encrypt(account.recoveryEmail)
        : null,
      twoFASecret: account.twoFASecret ? encrypt(account.twoFASecret) : null,
      tags: account.tags ? encrypt(String(account.tags)) : '',
      dob: account.dob || null, // Store DOB as is, since it's a date
    }
  } catch (error) {
    console.error('Error encrypting account:', error)
    throw new Error('Failed to encrypt account')
  }
}

export function decryptFacebookAccount(account) {
  if (!account) return account
  try {
    return {
      ...account,
      userId: decrypt(account.userId),
      password: decrypt(account.password),
      email: account.email ? decrypt(account.email) : null,
      emailPassword: account.emailPassword
        ? decrypt(account.emailPassword)
        : null,
      recoveryEmail: account.recoveryEmail
        ? decrypt(account.recoveryEmail)
        : null,
      twoFASecret: account.twoFASecret ? decrypt(account.twoFASecret) : null,
      tags: account.tags ? decrypt(String(account.tags)) : '',
      dob: account.dob || null, // Return DOB as is
    }
  } catch (error) {
    console.error('Error decrypting account:', error)
    // Return a sanitized version if decryption fails
    return {
      ...account,
      tags: '',
      email: null,
      emailPassword: null,
      recoveryEmail: null,
      dob: null,
    }
  }
}


export function prepareForExport(data, format = 'text') {
  if (!data) return ''

  const isFacebookAccount = 'userId' in (Array.isArray(data) ? data[0] || {} : data)

  const itemsArray = Array.isArray(data) ? data : [data]

  const decryptedItems = itemsArray.map((item) => {
    try {
      if (isFacebookAccount) return decryptFacebookAccount(item)
      return item // fallback case
    } catch (error) {
      console.error('Error decrypting item:', error)
      return {
        ...item,
        error: 'Failed to decrypt item',
      }
    }
  })

  if (format === 'json') {
    return JSON.stringify(decryptedItems, null, 2)
  }

  return decryptedItems
    .map((item) => {
      try {
        if (isFacebookAccount) {
          return [
            `Account Details for ${item.userId}`,
            '----------------------------------------',
            `User ID: ${item.userId}`,
            `Password: ${item.password}`,
            item.email ? `Email: ${item.email}` : null,
            item.emailPassword ? `Email Password: ${item.emailPassword}` : null,
            item.recoveryEmail ? `Recovery Email: ${item.recoveryEmail}` : null,
            `2FA Secret: ${item.twoFASecret}`,
            item.tags ? `Tags: ${item.tags}` : null,
            item.dob
              ? `Date of Birth: ${new Date(item.dob).toLocaleDateString()}`
              : null,
            item.createdAt
              ? `Created: ${new Date(item.createdAt).toLocaleString()}`
              : null,
            item.updatedAt
              ? `Last Updated: ${new Date(item.updatedAt).toLocaleString()}`
              : null,
          ]
            .filter(Boolean)
            .join('\n')
        }

        // This is the fallback case for other types
        return JSON.stringify(item, null, 2)
      } catch (error) {
        console.error('Error formatting item for export:', error)
        return `Error: Failed to format item ${item.id || 'unknown'}`
      }
    })
    .join('\n\n')
}

export async function copyToClipboardSecurely(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        textArea.remove()
        return true
      } catch (err) {
        console.error('Failed to copy text:', err)
        textArea.remove()
        return false
      }
    }
  } catch (err) {
    console.error('Failed to copy text:', err)
    return false
  }
}
