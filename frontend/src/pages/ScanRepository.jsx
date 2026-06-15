import { useState } from 'react'
import RepoInput from '../components/scan/RepoInput'
import RecentRepos from '../components/scan/RecentRepos'

export default function ScanRepository() {
  const [url, setUrl]           = useState('')
  const [branch, setBranch]     = useState('main')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleScan = () => {
    if (!url) return
    setScanning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setScanning(false); return 100 }
        return prev + Math.random() * 15
      })
    }, 300)
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 780 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Scan Repository</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Analyze a GitHub repository for security vulnerabilities</p>
      </div>
      <RepoInput
        url={url} onUrlChange={setUrl}
        branch={branch} onBranchChange={setBranch}
        scanning={scanning} progress={progress} onScan={handleScan}
      />
      <RecentRepos onSelect={setUrl} />
    </div>
  )
}