import Catalog from './components/Catalog'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Catalog />
    </>
  )
}

export default App