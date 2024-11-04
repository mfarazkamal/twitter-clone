import { Route, Routes } from "react-router-dom"
import Homepage from "./pages/auth/home/Homepage"
import SignupPage from "./pages/auth/signup/SignupPage"
import LoginPage from "./pages/auth/login/LoginPage"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"

function App() {

  return (
    <div className='flex max-w-6xl mx-auto'>
      <Sidebar/>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/notifications" element={<NotificationPage/>}/>
        <Route path="/profile/:username" element={<ProfilePage/>}/>
      </Routes>
      <RightPanel/>
    </div>
  )
}

export default App
