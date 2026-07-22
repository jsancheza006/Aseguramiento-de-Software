import { UploadCloud } from 'lucide-react'
import { useRef } from 'react'

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp']

export default function Dropzone({ onBrowseClick, onFilesAdded, dragActive = false }) {
  const fileInputRef = useRef(null)

  const handleContainerClick = () => {
    fileInputRef.current?.click()
    if (onBrowseClick) onBrowseClick()
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files))
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      className="flex h-full min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center transition-colors"
      style={{
        borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
        background: dragActive ? 'rgba(0,255,136,0.04)' : 'transparent',
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'rgba(0,255,136,0.1)' }}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        <UploadCloud size={22} style={{ color: 'var(--primary)' }} />
      </div>

      <div className="space-y-1">
        <p className="text-[15px] font-semibold">Drop files or folders here</p>
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          or click to browse your computer
        </p>
      </div>

      <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
        Supported: {SUPPORTED_EXTENSIONS.join(', ')}
      </p>
    </div>
  )
}