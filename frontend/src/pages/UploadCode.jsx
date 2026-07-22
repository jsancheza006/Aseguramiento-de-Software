import { useState } from 'react'
import { Zap, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Dropzone from '../components/upload/Dropzone'
import FileQueue from '../components/upload/FileQueue'

export default function UploadCode() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [alertMsg, setAlertMsg] = useState(null)

  const handleFilesAdded = (newFiles) => {
    const formattedFiles = newFiles.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      status: 'done',
      originalFile: f
    }))
    setFiles((prev) => [...prev, ...formattedFiles])
    setAlertMsg(null) // clear alert on new files
  }

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter(f => f.id !== id))
  }

  const handleStartScan = () => {
    if (files.length === 0) return

    const hasPython = files.some(f => f.name.toLowerCase().endsWith('.py'))
    
    if (!hasPython) {
      setAlertMsg("No se puede analizar el archivo ya que no tiene código Python. Estamos trabajando para próximamente soportar más lenguajes.")
      return
    }

    // Here would be the actual logic to upload the python files.
    // For now we just clear the alert if python is present.
    setAlertMsg(null)
  }

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
          <Button variant="primary" size="md" onClick={handleStartScan} disabled={files.length === 0}>
            <Zap size={14} />
            Start scan
          </Button>
        </div>

        {alertMsg && (
          <div
            className="mb-6 flex items-start gap-3 rounded-lg p-4"
            style={{
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.2)",
              color: "#ca8a04",
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, marginBottom: 4 }}>
                Unsupported Language
              </h3>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                {alertMsg}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
          <Dropzone
            dragActive={dragActive}
            onBrowseClick={() => setDragActive((v) => !v)}
            onFilesAdded={handleFilesAdded}
          />
          <FileQueue files={files} onRemove={handleRemoveFile} />
        </div>
      </div>
    </div>
  )
}