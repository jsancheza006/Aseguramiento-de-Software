import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import ReportList from '../components/reports/ReportList'
import { api } from '../config/Api'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/scan/history')
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-w-0 @container space-y-6 p-8">
      <PageHeader
        title="Reports"
        subtitle="View and download security scan reports"
        action={
          <Button variant="ghost" size="md" disabled={reports.length === 0}>
            <Download size={14} />
            Export All
          </Button>
        }
      />
      <ReportList reports={reports} loading={loading} />
    </div>
  )
}