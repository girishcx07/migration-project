import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$moduleId/unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/qr-visa/unauthorized"!</div>
}
