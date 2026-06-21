import { useState } from 'react'
import { Zap } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Dropzone from '../components/upload/Dropzone'
import FileQueue from '../components/upload/FileQueue'

export default function UploadCode() {
  const [dragActive, setDragActive] = useState(false)

  return (
    <div className=" space-y-6 p-8">
      <PageHeader
        title="Upload Code"
        subtitle="Upload files or folders for security analysis"
      />

      <div
        className="rounded-xl border p-6"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold">Upload Files</p>
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
              Drag and drop files or folders, or click to browse
            </p>
          </div>
          <Button variant="primary" size="md">
            <Zap size={14} />
            Start scan
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
          <Dropzone
            dragActive={dragActive}
            onBrowseClick={() => setDragActive((v) => !v)}
          />
          <FileQueue />
        </div>
      </div>
    </div>
  )
}