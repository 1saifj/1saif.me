---
title: "TypeScript with React: A Complete Developer Guide"
description: Master TypeScript in React applications with practical examples, advanced patterns, and best practices for type-safe development.
createdAt: 2024-02-10
updatedAt: 2024-02-15
tags:
  - typescript
  - react
  - frontend
  - development
---

# TypeScript with React: A Complete Developer Guide

TypeScript has become an essential tool for React development, providing type safety, better developer experience, and improved code maintainability. This comprehensive guide covers everything you need to know about using TypeScript effectively with React.

## Setting Up TypeScript with React

### Creating a New TypeScript React Project

```bash
npx create-react-app my-app --template typescript
# or with Vite
npm create vite@latest my-app -- --template react-ts
```

### Basic TypeScript Configuration

Your `tsconfig.json` should include these essential settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

## Component Typing Patterns

### Functional Components

```tsx
import React from 'react'

interface Props {
  title: string
  count: number
  isVisible?: boolean
  onClick: () => void
}

const MyComponent: React.FC<Props> = ({ title, count, isVisible = true, onClick }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      {isVisible && <button onClick={onClick}>Click me</button>}
    </div>
  )
}

export default MyComponent
```

### Props with Children

```tsx
interface ContainerProps {
  className?: string
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>
}
```

### Event Handlers

```tsx
interface FormProps {
  onSubmit: (data: FormData) => void
}

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Advanced TypeScript Patterns

### Generic Components

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string | number
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}

// Usage
const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]

<List
  items={users}
  renderItem={user => <span>{user.name}</span>}
  keyExtractor={user => user.id}
/>
```

### Discriminated Unions for State

```tsx
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any[] }
  | { status: 'error'; error: string }

const DataComponent: React.FC = () => {
  const [state, setState] = useState<LoadingState>({ status: 'idle' })

  const renderContent = () => {
    switch (state.status) {
      case 'idle':
        return <button onClick={fetchData}>Load Data</button>
      case 'loading':
        return <div>Loading...</div>
      case 'success':
        return <div>Data: {state.data.length} items</div>
      case 'error':
        return <div>Error: {state.error}</div>
    }
  }

  return <div>{renderContent()}</div>
}
```

## Hooks with TypeScript

### useState with Complex Types

```tsx
interface User {
  id: number
  name: string
  email: string
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Type-safe state updates
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  return (
    <div>
      {user && (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  )
}
```

### Custom Hooks with TypeScript

```tsx
interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Usage
const UserList: React.FC = () => {
  const { data: users, loading, error } = useApi<User[]>('/api/users')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!users) return <div>No data</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Best Practices

### 1. Use Strict TypeScript Settings

Enable strict mode in your `tsconfig.json` for better type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. Prefer Interfaces Over Types for Props

```tsx
// Preferred
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'small' | 'medium' | 'large'
  onClick: () => void
}

// Less preferred for props
type ButtonProps = {
  variant: 'primary' | 'secondary'
  size: 'small' | 'medium' | 'large'
  onClick: () => void
}
```

### 3. Use Utility Types

```tsx
interface User {
  id: number
  name: string
  email: string
  password: string
}

// Create a type without password for public use
type PublicUser = Omit<User, 'password'>

// Create a type for user creation (without id)
type CreateUser = Omit<User, 'id'>

// Make all properties optional for updates
type UpdateUser = Partial<User>
```

TypeScript with React provides excellent developer experience and helps catch errors early in development. By following these patterns and best practices, you'll build more robust and maintainable React applications.