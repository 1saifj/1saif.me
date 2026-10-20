import { matchPath } from 'react-router-dom'

// The paths the router owns. The App, the SSR entry and the prerender all read this list,
// so a route added here exists everywhere at once.
export const routePaths = ['/', '/blog', '/blog/:slug', '/project/:slug', '/resume', '/privacy'] as const

export type RoutePath = (typeof routePaths)[number]

// end: one pattern must claim the whole path, so /blog/x/y is not an article and /blogish is not the blog.
export const matchRoute = (path: string): RoutePath | undefined => routePaths.find(route => matchPath({ path: route, end: true }, path))
