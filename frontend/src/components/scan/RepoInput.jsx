import { Search, GitBranch, Loader2 } from 'lucide-react'
import Card from '../layout/Card'
import Input from '../ui/Input'
import Dropdown from '../ui/Dropdown'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'

const BRANCHES = ['main', 'develop', 'feature/auth', 'release/v2.0']

function getScanStatus(p) {
  if (p < 30) return 'Cloning repository...'
  if (p < 60) return 'Analyzing dependencies...'
  if (p < 90) return 'Scanning for vulnerabilities...'
  return 'Generating report...'
}

export default function RepoInput({ url, onUrlChange, branch, onBranchChange, scanning, progress, onScan }) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* URL + Branch row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              icon={Search}
            />
          </div>
          <Dropdown
            value={branch}
            options={BRANCHES}
            onChange={onBranchChange}
            icon={GitBranch}
          />
        </div>

        {/* Progress */}
        {scanning && (
          <ProgressBar
            value={progress}
            label="Scanning repository..."
            statusText={getScanStatus(progress)}
          />
        )}

        {/* Button */}
        <Button full disabled={!url || scanning} onClick={onScan}>
          {scanning ? <><Loader2 size={15} className="spin" /> Scanning...</> : 'Start Scan'}
        </Button>

      </div>
    </Card>
  )
}