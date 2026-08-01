import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/dashboard')({
  component: () => { return <h1>Hello Word</h1> }
})

