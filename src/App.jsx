import './App.css'
import Dictaphone from './components/Dictaphone'
import Navbar from './components/Navbar'
import Transcription from './components/Transcription'
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
  const transcriber = useTranscriber();

  return (
    <>
      <div className="app">
        <Navbar />
        <div className='mainContent'>
          {transcriber && 
          <>
          <Dictaphone transcriber={transcriber} />
          <Transcription content={transcriber.output}/>
          </> }
        </div>
      </div>
    </>
  )
}

export default App
