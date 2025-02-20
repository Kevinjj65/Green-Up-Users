import Home from "./components/home/Home"
import Events from "./components/events/Events"
import { BrowserRouter,Route,Routes } from "react-router-dom"
function App() {

  return (
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/events' element={<Events/>}/>
  </Routes>
  </BrowserRouter>
  )
}

export default App
