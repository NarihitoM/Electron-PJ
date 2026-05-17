import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { Login } from "./auth/login"
import { Sidebarprovider } from "./pages/Sidebarprovider"
import { Chat } from "./pages/Chat"
import { ThemeProvider } from "./components/ui/themeprovider"
import { QueryClientProvider } from "@tanstack/react-query"
import { datafetch } from "./config/tanstackqueryconfig"
import { Protectedroute } from "./routes/protectedroute"
import { Signup } from "./auth/signup"
import { PublicRoute } from "./routes/publicroute"
import { Settings } from "./pages/Settings"
import { Dashboard } from "./pages/Dashboard"
import { LocalAgent } from "./pages/LocalAgent"
import { WebScrap } from "./pages/WebScrap"
import { Telegram } from "./pages/Telegram"
import { Googlesheet } from "./pages/Googlesheet"
import { Googledocs } from "./pages/Googledocs"
import { Notion } from "./pages/Notion"
import { Verify } from "./auth/verifycode"
import { Account } from "./pages/Account"
import { Slack } from "./pages/Slack"
import { Emailcheck } from "./auth/sendemail"
import { Verifychangepassword } from "./auth/verifychangepassword"
import { Passwordchange } from "./auth/changepasswordpage"

function App() {

  return (
    <QueryClientProvider client={datafetch}>
      <HashRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            //Default Route
            <Route index element={<Navigate to="/login" replace />} />
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} /> //done
              <Route path="/signup" element={<Signup />} /> //done
              <Route path="/emailverify" element={<Emailcheck />} /> //done
            </Route>
            <Route path="/verify/:stateid" element={<Verify />} /> //Done
            <Route path="/verifypasswordchange/:stateid" element={<Verifychangepassword/>} /> //done
            <Route path="/passwordchange/:stateid" element={<Passwordchange/>} /> // done
            <Route element={<Protectedroute />} >
              <Route path="/app" element={<Sidebarprovider />} >
                <Route path="dashboard" element={<Dashboard />} /> //Incomplete
                <Route path="chat/:id?" element={<Chat />} /> //done
                <Route path="telegram" element={<Telegram />} /> //done
                {/* Agentic Features route */}
                <Route path="slack" element={<Slack />} /> //done
                <Route path="notion" element={<Notion />} /> //done
                <Route path="googlesheet" element={<Googlesheet />} /> //done
                <Route path="googledocs" element={<Googledocs />} /> //done
                <Route path="webscrap" element={<WebScrap />} />//done
                <Route path="localagent" element={<LocalAgent />} />//done
                <Route path="settings" element={<Settings />} /> //done
                <Route path="account" element={<Account />} /> //done
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
