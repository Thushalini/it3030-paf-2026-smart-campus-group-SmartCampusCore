import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <GoogleOAuthProvider clientId="775821170906-n76oam087h1sdk2lij87dk96h3l08odd.apps.googleusercontent.com">
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;