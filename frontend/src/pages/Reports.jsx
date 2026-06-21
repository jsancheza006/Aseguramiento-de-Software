import { Download } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import ReportCard from '../components/reports/ReportCard'

const REPORTS = [
  {
    id: 1,
    repoName: 'frontend-app',
    branch: 'main',
    date: '2024-01-15 14:30',
    totalIssues: 7,
    severities: ['critical', 'high', 'medium', 'low'],
  },
  {
    id: 2,
    repoName: 'api-service',
    branch: 'develop',
    date: '2024-01-14 09:15',
    totalIssues: 0,
    severities: [],
  },
  {
    id: 3,
    repoName: 'payment-gateway',
    branch: 'main',
    date: '2024-01-13 16:45',
    totalIssues: 3,
    severities: ['high', 'medium', 'low'],
  },
  {
    id: 4,
    repoName: 'auth-service',
    branch: 'main',
    date: '2024-01-12 11:05',
    totalIssues: 2,
    severities: ['medium', 'low'],
  },
]

export default function Reports() {
  return (
    <div className="min-w-0 @container space-y-6 p-8">
      <PageHeader
        title="Reports"
        subtitle="View and download security scan reports"
        action={
          <Button variant="ghost" size="md">
            <Download size={14} />
            Export All
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl:grid-cols-3">
        {REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}