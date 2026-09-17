import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { SparkleIcon } from '@/components/ui/icons'

export function NotFound() {
  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <SparkleIcon className="mx-auto mb-4 block size-6 text-brand-500" />
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink-900">
          Page not found
        </h1>
        <p className="mt-2 text-[0.86rem] leading-6 text-ink-500">
          The page you are looking for does not exist in this prototype.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-[0.84rem] font-medium text-white transition-colors hover:bg-brand-700"
        >
          Back to dashboard
        </Link>
      </div>
    </PageContainer>
  )
}
