import { describe, expect, it } from 'vitest'
import { searchText } from './searchText'

const matches = (text: string, query: string) => searchText(text).includes(searchText(query))

describe('searchText', () => {
  it('matches Arabic typed without diacritics, hamza or the closing ة', () => {
    expect(matches('امنح كل طلب معرّفاً تستطيع تتبّعه', 'معرفا')).toBe(true)
    expect(matches('استراتيجيات إعادة المحاولة', 'اعادة المحاولة')).toBe(true)
    expect(matches('والتراجع الخطي والأُسّي', 'الاسي')).toBe(true)
    expect(matches('ترحيلات قاعدة البيانات', 'قاعده البيانات')).toBe(true)
    expect(matches('مسؤول', 'مسوول')).toBe(true)
    expect(matches('على', 'علي')).toBe(true)
  })

  it('folds Latin case and accents', () => {
    expect(matches('Résumé', 'resume')).toBe(true)
    expect(matches('PostgreSQL', 'postgres')).toBe(true)
  })

  it('still tells different words apart', () => {
    expect(matches('قاعدة البيانات', 'قاعدة الخادم')).toBe(false)
  })
})
