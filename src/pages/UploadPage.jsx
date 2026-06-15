import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAudio } from '../services/api'
import UploadForm from '../components/UploadForm'
import EvaluationList from '../components/EvaluationList'
import PageTransition from '../components/PageTransition'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (file) => {
    setLoading(true)
    setError('')
    try {
      const data = await uploadAudio(file)
      navigate(`/processing/${data.call_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <Upload size={28} className="text-accent" /> Upload Call
          </h1>
          <p className="text-base text-[#A1A1AA] mt-2">Upload a call recording for EchoPeak AI analysis</p>
        </div>
        <UploadForm onEvaluate={handleUpload} loading={loading} error={error} />
        {!loading && <EvaluationList />}
      </div>
    </PageTransition>
  )
}
