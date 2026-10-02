import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/lecturers_/$lecturerId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/lecturers_/$lecturerId"!</div>
}
