import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileUploadField from './components/FileUploadField';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <FileUploadField/ >
    </>
  )
}

export default App
