import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full items-center justify-center p-8">
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="Page not found"
        description="This page doesn't exist, or may have moved."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  )
}
