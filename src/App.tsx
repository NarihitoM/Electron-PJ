import { HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { navigationRef } from "./shared/lib/navigationref";
import { Login } from "./pages/Login";
import { Sidebarprovider } from "./shared/components/layout/Sidebarprovider";
import { Chat } from "./pages/Chat";
import { ThemeProvider } from "./shared/components/ui/themeprovider";
import { QueryClientProvider } from "@tanstack/react-query";
import { datafetch } from "./shared/config/tanstackqueryconfig";
import { Protectedroute } from "./shared/routes/protectedroute";
import { Signup } from "./pages/Signup";
import { PublicRoute } from "./shared/routes/publicroute";
import { Settings } from "./pages/Settings";
import { Dashboard } from "./pages/Dashboard";
import { LocalAgent } from "./pages/LocalAgent";
import { Telegram } from "./pages/Telegram";
import { Googlesheet } from "./pages/Googlesheet";
import { Googledocs } from "./pages/Googledocs";
import { Googlecalendar } from "./pages/Googlecalendar";
import { Googlegmail } from "./pages/Googlegmail";
import { Notion } from "./pages/Notion";
import { Verify } from "./pages/VerifyCode";
import { Account } from "./pages/Account";
import { Slack } from "./pages/Slack";
import { Github } from "./pages/Github";
import { Discord } from "./pages/Discord";
import { N8n } from "./pages/N8n";
import { Vercel } from "./pages/Vercel";
import { Emailcheck } from "./pages/SendEmail";
import { Verifychangepassword } from "./pages/VerifyChangePassword";
import { Passwordchange } from "./pages/ChangePasswordPage";
import { Aivideoanalyse } from "./pages/Aivideoanalyse";
import { Usage } from "./pages/Usage";
import { Memory } from "./pages/Memory";

const NavigationRefSetter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigationRef.navigate = navigate;
  }, [navigate]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={datafetch}>
      <HashRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <NavigationRefSetter />
          <Routes>
            //Default Route
            <Route index element={<Navigate to="/login" replace />} />
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} /> //done
              <Route path="/signup" element={<Signup />} /> //done
              <Route path="/emailverify" element={<Emailcheck />} /> //done
            </Route>
            <Route path="/verify/:stateid" element={<Verify />} /> //Done
            <Route path="/verifypasswordchange/:stateid" element={<Verifychangepassword />} />{" "}
            //done
            <Route path="/passwordchange/:stateid" element={<Passwordchange />} /> // done
            <Route element={<Protectedroute />}>
              <Route path="/app" element={<Sidebarprovider />}>
                <Route path="dashboard" element={<Dashboard />} /> //Partial Done
                <Route path="chat/:id?" element={<Chat />} /> //done
                <Route path="videoanalysis" element={<Aivideoanalyse />} /> //Incomplete
                {/* Agentic Features route */}
                <Route path="telegram" element={<Telegram />} /> //done
                <Route path="slack" element={<Slack />} /> //done
                <Route path="github" element={<Github />} />
                <Route path="discord" element={<Discord />} />
                <Route path="notion" element={<Notion />} /> //done
                <Route path="googlesheet" element={<Googlesheet />} /> //done
                <Route path="googledocs" element={<Googledocs />} /> //done
                <Route path="googlecalendar" element={<Googlecalendar />} />
                <Route path="googlegmail" element={<Googlegmail />} />
                <Route path="n8n" element={<N8n />} />
                <Route path="vercel" element={<Vercel />} />
                <Route path="localagent" element={<LocalAgent />} />
                //done
                <Route path="usage" element={<Usage />} />
                <Route path="settings" element={<Settings />} /> //done
                <Route path="memory" element={<Memory />} />
                <Route path="account" element={<Account />} /> //done
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
