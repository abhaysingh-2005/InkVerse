import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {AppProvider} from './context/AppContext.jsx'
// Google OAuth Provider
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "363221562943-smiddvk5eqifmpj4b9gemki95k1a74i3.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </AppProvider>
  </BrowserRouter>,
)
