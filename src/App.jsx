import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { Toaster } from "sonner";
import ScrollToTop from "./components/common/scroll-to-top";
import AppRoutes from "./routes/app-routes";
import { appLogout } from "./utils/logout";

function App() {
  const navigate = useNavigate();

  return (
    <>
      {/* <DisabledRightClick /> */}
      <Toaster richColors position="top-right" />
      <ScrollToTop />

      <AppRoutes />
    </>
  );
}

export default App;
