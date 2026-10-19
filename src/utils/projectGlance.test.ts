import { describe, expect, it } from 'vitest'
import { buildGlanceItems, type GlanceLabels } from './projectGlance'
import type { Project } from '../schemas/projectSchema'

const labels: GlanceLabels = {
  role: 'Role', status: 'Status', type: 'Type', language: 'Main language', links: 'Links', stack: 'Stack',
  inProgress: 'In progress', shipped: 'Shipped', openSource: 'Open source', company: 'Company', private: 'Private',
  visit: 'Visit site', source: 'Source code',
}

const project: Project = {
  order: 1, name: 'Sample', description: 'A sample project', language: 'typescript', wip: false, isPrivate: false,
  sourceType: 'open-source', role: 'Author',
}

const values = (items: ReturnType<typeof buildGlanceItems>) => items.map(item => [item.key, item.value])

describe('at-a-glance items', () => {
  it('lists role, status, type and language in order', () => {
    expect(values(buildGlanceItems(project, 'Lead engineer', labels))).toEqual([
      ['role', 'Lead engineer'], ['status', 'Shipped'], ['type', 'Open source'], ['language', 'TypeScript'],
    ])
  })

  it('labels work in progress, a company project and a private source', () => {
    expect(values(buildGlanceItems({ ...project, wip: true, sourceType: 'company' }, undefined, labels))).toEqual([
      ['status', 'In progress'], ['type', 'Company'], ['language', 'TypeScript'],
    ])
    expect(buildGlanceItems({ ...project, sourceType: 'private' }, undefined, labels)[1]?.value).toBe('Private')
  })

  it('links to the site for a private project and to the source otherwise', () => {
    const visit = buildGlanceItems({ ...project, url: 'https://example.com', isPrivate: true }, undefined, labels).find(item => item.key === 'links')
    const source = buildGlanceItems({ ...project, url: 'https://github.com/x/y' }, undefined, labels).find(item => item.key === 'links')

    expect(visit).toMatchObject({ key: 'links', value: 'Visit site', href: 'https://example.com' })
    expect(source).toMatchObject({ key: 'links', value: 'Source code', href: 'https://github.com/x/y' })
  })

  it('leaves out a missing role and a missing link', () => {
    const items = buildGlanceItems({ ...project, language: 'rust' }, undefined, labels)

    expect(values(items)).toEqual([['status', 'Shipped'], ['type', 'Open source'], ['language', 'Rust']])
    expect(buildGlanceItems({ ...project, url: undefined }, 'Author', labels).map(item => item.key)).not.toContain('links')
  })
})
