import './Transcription.css'

function formatAudioTimestamp(time) {
  const hours = (time / (60 * 60)) | 0;
  time -= hours * (60 * 60);
  const minutes = (time / 60) | 0;
  time -= minutes * 60;
  const seconds = time | 0;
  return `${hours ? padTime(hours) + ":" : ""}${padTime(minutes)}:${padTime(
      seconds,
  )}`;
}

function padTime(time) {
  return String(time).padStart(2, "0");
}

function Transcription({content}) {
  if (content !== undefined) {
    console.log(content);
  }

  return (
    <>
      <div className="TranscriptionContainer">
        <div className='TranscriptionText'>
        {content?.chunks ?
          content.chunks.map((chunk, i) => (
            <div key={`${i}-${chunk.text}`}>  
              {formatAudioTimestamp(chunk.timestamp[0])}
              {chunk.text}
            </div>
          )): (
            <div>Ready to transcribe</div>
          )
          }
        </div>
      </div>
    </>
  )
}

export default Transcription
