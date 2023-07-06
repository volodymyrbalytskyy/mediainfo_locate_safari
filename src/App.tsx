import { useEffect, useState } from 'react'
import './App.css'
import MediaInfoFactory from 'mediainfo.js';

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    MediaInfoFactory({
      full: true,
      // no matter what is returned, in Safari 16, it is ignored
      locateFile: () => 'https://unpkg.com/mediainfo.js@0.1.9/dist/MediaInfoModule.wasm',
    }, (mediainfo) => {
      mediainfo.analyzeData(() => file.size, readChunk(file)).then(result => {
        if (typeof result !== 'string') {
          console.log(result);

          const videoTrack = result?.media?.track?.find(el => el?.['@type'] === 'Video');
          if (typeof videoTrack?.Duration === 'string') {
            setDuration(videoTrack?.Duration);
          }
        }
      })
    })
  }, [file])

  return (
    <>
    <label htmlFor='file_field'>File duration: {duration ? duration : 'null'}</label>
    <br/>
     <input type="file" onChange={event => {
      if (event.target.files) {
        setFile(event.target.files[0])
      }
     }} /> 
    </>
  )
}

export default App;

const readChunk =
  (file: File) =>
  (chunkSize: number, offset: number): Promise<Uint8Array> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.log({
        chunkSize,
        offset,
      });
      reader.onload = event => {
        if (event?.target?.error) {
          reject(event?.target?.error);
        }
        resolve(new Uint8Array(event?.target?.result as any));
      };
      reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
    });