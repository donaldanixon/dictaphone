import { useState } from 'react';
import './Navbar.css'

function Navbar() {

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <div className="NavBar">
        <div className='Title'>
          AI Dictaphone
          <div className='Subtitle'>Powered by Whisper</div>
        </div>
        <div className='MenuText' onClick={() => setModalVisible(true)}>About</div>
      </div>
      {/* About Modal */}
      {modalVisible === true && (
        <div className="modalCard">
          <div className="modalClose" onClick={() => setModalVisible(false)}>X</div>
          <div className="modalHeader">About</div>
          <div className="modalText">Inspired by <a href="https://github.com/xenova/whisper-web">https://github.com/xenova/whisper-web</a>, this app uses the <a href="https://github.com/openai/whisper">Whisper</a> model and <a href="https://github.com/huggingface/transformers.js">Huggingface's Transformers.js</a> library to convert a sound recording to text.</div>
        </div>
      )}
    </>
  )
}

export default Navbar
