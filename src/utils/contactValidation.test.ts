import { describe, expect, it } from 'vitest'
import { firstInvalidField, validateContact, validateField } from './contactValidation'

describe('validateField', () => {
  it('requires a name after trimming it', () => {
    expect(validateField('name', '')).toBe('nameRequired')
    expect(validateField('name', '   ')).toBe('nameRequired')
    expect(validateField('name', ' Ali ')).toBeUndefined()
  })

  it('keeps the name at 100 characters or fewer', () => {
    expect(validateField('name', 'a'.repeat(100))).toBeUndefined()
    expect(validateField('name', 'a'.repeat(101))).toBe('nameLong')
  })

  it('rejects line breaks and control characters in the name', () => {
    expect(validateField('name', 'Ali\nBcc: x@y.z')).toBe('nameLine')
    expect(validateField('name', 'Ali\rBcc: x@y.z')).toBe('nameLine')
    expect(validateField('name', 'Ali\u0001')).toBe('nameLine')
    expect(validateField('name', 'Ali\u007f')).toBe('nameLine')
  })

  it('requires an email address', () => {
    expect(validateField('email', '')).toBe('emailRequired')
    expect(validateField('email', '  ')).toBe('emailRequired')
  })

  it('keeps the email at 254 characters or fewer', () => {
    const local = 'a'.repeat(254 - '@example.com'.length)

    expect(validateField('email', `${local}@example.com`)).toBeUndefined()
    expect(validateField('email', `${local}a@example.com`)).toBe('emailLong')
  })

  it('rejects malformed email addresses', () => {
    expect(validateField('email', 'not-an-email')).toBe('emailInvalid')
    expect(validateField('email', 'a@b')).toBe('emailInvalid')
    expect(validateField('email', 'a@b.')).toBe('emailInvalid')
    expect(validateField('email', '<ali@example.com>')).toBe('emailInvalid')
    expect(validateField('email', 'ali@exa mple.com')).toBe('emailInvalid')
    expect(validateField('email', 'ali@example.com')).toBeUndefined()
  })

  it('requires a message', () => {
    expect(validateField('message', '')).toBe('messageRequired')
    expect(validateField('message', '  ')).toBe('messageRequired')
  })

  it('keeps the message at 5,000 characters or fewer', () => {
    expect(validateField('message', 'x'.repeat(5_000))).toBeUndefined()
    expect(validateField('message', 'x'.repeat(5_001))).toBe('messageLong')
  })

  it('allows line breaks and tabs in the message, but no control characters', () => {
    expect(validateField('message', 'line one\nline two\tend')).toBeUndefined()
    expect(validateField('message', 'bell\u0007')).toBe('messageControl')
  })
})

describe('validateContact', () => {
  it('returns no error for a valid message', () => {
    expect(validateContact({ name: 'Ali', email: 'ali@example.com', message: 'Hello' })).toEqual({
      name: undefined,
      email: undefined,
      message: undefined,
    })
  })

  it('returns an error for every failing field', () => {
    expect(validateContact({ name: '', email: 'bad', message: '' })).toEqual({
      name: 'nameRequired',
      email: 'emailInvalid',
      message: 'messageRequired',
    })
  })
})

describe('firstInvalidField', () => {
  it('follows the form order', () => {
    expect(firstInvalidField({ message: 'messageRequired', email: 'emailInvalid' })).toBe('email')
    expect(firstInvalidField({ message: 'messageRequired' })).toBe('message')
    expect(firstInvalidField({})).toBeUndefined()
  })
})
