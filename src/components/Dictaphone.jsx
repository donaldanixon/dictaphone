import { useState, useRef, useEffect } from 'react';
import { webmFixDuration } from "../utils/blobFix";
import axios from "axios";
import './Dictaphone.css';
import Constants from '../utils/Constants';

function Dictaphone(props) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screenContent, setScreenContent] = useState("Ready");
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(undefined);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const audioRef = useRef(null);
  const [audioData, setAudioData] = useState(undefined);
  const [audioDownloadUrl, setAudioDownloadUrl] = useState(undefined);

  function getMimeType() {
    const types = [
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
        "audio/wav",
        "audio/aac",
    ];
    for (let i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) {
            return types[i];
        }
    }
    return undefined;
  }
  const startRecording = async () => {
    // Reset recording (if any)
    setRecordedBlob(null);

    let startTime = Date.now();

    try {
        if (!streamRef.current) {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        }

        const mimeType = getMimeType();
        const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType,
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", async (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
            if (mediaRecorder.state === "inactive") {
                const duration = Date.now() - startTime;

                // Received a stop event
                let blob = new Blob(chunksRef.current, { type: mimeType });
                
                if (mimeType === "audio/webm") {
                    blob = await webmFixDuration(blob, duration, blob.type);
                }

                setRecordedBlob(blob);
                chunksRef.current = [];
            }
        });
        mediaRecorder.start();
        setRecording(true);
        setScreenContent("Recording");
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
  };
  
  const stopRecording = () => {
    console.log("Stopping recording...");
    if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
    ) {
        mediaRecorderRef.current.stop(); // set state to inactive
        setDuration(0);
        setRecording(false);
        setScreenContent("Playback")
    }
  };  

  const handleToggleRecording = () => {
    if (recording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  const startTranscription = () => {
    if (!props.transcriber.isBusy) {
      props.transcriber.start(audioData.buffer);
    }
  }

  const resetAudio = () => {
    setAudioData(undefined);
    setAudioDownloadUrl(undefined);
  };

  const setAudioFromRecording = async (data) => {
    resetAudio();
    setProgress(0);
    const blobUrl = URL.createObjectURL(data);
    const fileReader = new FileReader();
    fileReader.onprogress = (event) => {
        setProgress(event.loaded / event.total || 0);
    };
    fileReader.onloadend = async () => {
        const audioCTX = new AudioContext({
            sampleRate: Constants.SAMPLING_RATE,
        });
        const arrayBuffer = fileReader.result;
        const decoded = await audioCTX.decodeAudioData(arrayBuffer);
        setProgress(undefined);
        setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: "RECORDING",
            mimeType: data.type,
        });
    };
    fileReader.readAsArrayBuffer(data);
  };

  const downloadAudioFromUrl = async (requestAbortController,) => {
    if (audioDownloadUrl) {
        try {
            setAudioData(undefined);
            setProgress(0);
            const { data, headers } = (await axios.get(audioDownloadUrl, {
                signal: requestAbortController.signal,
                responseType: "arraybuffer",
                onDownloadProgress(progressEvent) {
                    setProgress(progressEvent.progress || 0);
                },
            }));

            let mimeType = headers["content-type"];
            if (!mimeType || mimeType === "audio/wave") {
                mimeType = "audio/wav";
            }
            setAudioFromDownload(data, mimeType);
        } catch (error) {
            console.log("Request failed or aborted", error);
        } finally {
            setProgress(undefined);
        }
    }
  };

  useEffect(() => {
    if (audioDownloadUrl) {
        const requestAbortController = new AbortController();
        downloadAudioFromUrl(requestAbortController);
        return () => {
            requestAbortController.abort();
        };
    }
  }, [audioDownloadUrl]);

  useEffect(() => {
    if (recordedBlob) {
      props.transcriber.onInputChange();
      setAudioFromRecording(recordedBlob);
    }
  }, [recordedBlob]);

  useEffect(() => {
    if (props.transcriber.isTranscribing === true) {
      setScreenContent("Transcribing");
    }
    else {
      setScreenContent("Playback");
    }
  }, [props.transcriber.isTranscribing]);

  useEffect(() => {
    let stream = null;

    if (recording) {
        const timer = setInterval(() => {
            setDuration((prevDuration) => prevDuration + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }

    return () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    };
  }, [recording]);

  return (
    <>
      <div className="dictaphoneContainer">
        <div className="dictaphoneBackground">
          <div className="dictaphoneScreen">
            {recording ? (
              <div className="dictaphoneScreenContentFlashing">
                {screenContent}<br />
                {duration}
              </div>
            ) : 
            audioData && props.transcriber.progressItems.length > 0 ? (
              <div className="dictaphoneScreenContentFlashing">
                Loading model files
              </div>
            ) :
            audioData && props.transcriber.isBusy === true ? (
              <div className="dictaphoneScreenContentFlashing">
                Doing AI magic
              </div>
            ) :
            (
              <div className="dictaphoneScreenContentFlashing">
                {screenContent}
              </div>
            )}
          </div>
          <div className="dictaphoneButtonContainer">
              <div className="dictaphoneButton">
                {recording ? (
                  <div className="stopIcon" onClick={handleToggleRecording} />
                ): (
                  <div className="RecordIcon" onClick={handleToggleRecording} />
                )}
              </div>
            {recordedBlob ? (
              <>
                <audio
                  controls
                  src={URL.createObjectURL(recordedBlob)}
                  ref={audioRef}
                />
              </>
            ) :(
              <>
                <audio
                  controls
                />
              </>
            )}
            {props.transcriber.isBusy===false ? (
            <div className="dictaphoneTranscribeButton" onClick={startTranscription} >
              Transcribe
            </div>
            ) : (
              <div className="dictaphoneTranscribeButton" >
              Please wait...
            </div>
            )}
            </div>
        </div>
      </div>
    </>
  )
}

export default Dictaphone
