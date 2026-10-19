export type ContactField = 'name' | 'email' | 'message'

export type ContactErrorKey =
  | 'nameRequired'
  | 'nameLong'
  | 'nameLine'
  | 'emailRequired'
  | 'emailLong'
  | 'emailInvalid'
  | 'messageRequired'
  | 'messageLong'
  | 'messageControl'

export type ContactErrors = Partial<Record<ContactField, ContactErrorKey>>

export interface ContactValues {
  name: string
  email: string
  message: string
}

export const contactFields: readonly ContactField[] = ['name', 'email', 'message']

// Mirrors workers/contact, so the page rejects exactly what the Worker rejects.
const MAX_NAME = 100

const MAX_EMAIL = 254

const MAX_MESSAGE = 5_000

const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

// Control characters, except tab and line breaks, which a message may hold.
// eslint-disable-next-line no-control-regex -- matching control characters is the point.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/

const LINE_BREAK = /[\r\n]/

function nameError(value: string): ContactErrorKey | undefined {
  if (!value) return 'nameRequired'

  if (value.length > MAX_NAME) return 'nameLong'

  if (LINE_BREAK.test(value) || CONTROL_CHARACTERS.test(value)) return 'nameLine'
}

function emailError(value: string): ContactErrorKey | undefined {
  if (!value) return 'emailRequired'

  if (value.length > MAX_EMAIL) return 'emailLong'

  if (!EMAIL_PATTERN.test(value)) return 'emailInvalid'
}

function messageError(value: string): ContactErrorKey | undefined {
  if (!value) return 'messageRequired'

  if (value.length > MAX_MESSAGE) return 'messageLong'

  if (CONTROL_CHARACTERS.test(value)) return 'messageControl'
}

export function validateField(field: ContactField, value: string): ContactErrorKey | undefined {
  // The Worker trims every field before it checks it.
  const text = value.trim()

  if (field === 'name') return nameError(text)

  if (field === 'email') return emailError(text)

  return messageError(text)
}

export function validateContact(values: ContactValues): ContactErrors {
  return {
    name: validateField('name', values.name),
    email: validateField('email', values.email),
    message: validateField('message', values.message),
  }
}

export function firstInvalidField(errors: ContactErrors): ContactField | undefined {
  return contactFields.find(field => errors[field] !== undefined)
}
