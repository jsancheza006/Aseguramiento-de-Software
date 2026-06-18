import { useState, useEffect } from 'react'
import { githubApi } from '../config/Api'
import { useAuth } from '../context/AuthContext'
import RepoInput from '../components/scan/RepoInput'
import RecentRepos from '../components/scan/RecentRepos'

export default function ScanRepository() {
  const { user } = useAuth()
  const [url, setUrl]           = useState('')
  const [branch, setBranch]     = useState('main')
  const [branches, setBranches] = useState(['main'])
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [repos, setRepos]       = useState([])
  const [loadingRepos, setLoadingRepos] = useState(false)
const hasGithub = !!user?.githubToken

  console.log('user:', user)
console.log('user.provider:', user?.provider)
console.log('user.githubToken:', user?.githubToken)
console.log('localStorage github_token:', localStorage.getItem('github_token'))
console.log('hasGithub:', user?.provider === 'github' && !!user?.githubToken)
  useEffect(() => {
    if (!hasGithub) {
      setRepos([])
      return
    }
    setLoadingRepos(true)
    githubApi.get('/api/github/repos')
  .then(data => {
    console.log('repos response:', data)        // ← mirá esto en consola
    setRepos(Array.isArray(data) ? data : data.repos ?? [])
  })
  .catch(console.error)
  .finally(() => setLoadingRepos(false))
  }, [hasGithub])

  const handleSelectRepo = async (repoFullName, cloneUrl) => {
    setUrl(cloneUrl)
    setBranches(['main'])
    setBranch('main')
    try {
      const [owner, repo] = repoFullName.split('/')
      const data = await githubApi.get(`/api/github/repos/${owner}/${repo}/branches`)
      setBranches(data)
      setBranch(data[0] ?? 'main')
    } catch (e) {
      console.error(e)
    }
  }

  const handleScan = () => {
    if (!url) return
    setScanning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 300)
  }

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2e8e4', margin: 0 }}>Scan repository</h1>
        <p style={{ fontSize: 13, color: '#5a6b60', marginTop: 6, marginBottom: 0 }}>Analyze a GitHub repository for security vulnerabilities</p>
      </div>
      <RepoInput
        url={url} onUrlChange={setUrl}
        branch={branch} onBranchChange={setBranch}
        branches={branches}
        scanning={scanning} progress={progress} onScan={handleScan}
      />
      <RecentRepos
        repos={repos}
        loading={loadingRepos}
        hasGithub={hasGithub}
        onSelect={handleSelectRepo}
      />
    </div>
  )
}