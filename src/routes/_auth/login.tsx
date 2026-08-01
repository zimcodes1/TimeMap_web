import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/login')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <h1>Hello World!</h1>
    )
}