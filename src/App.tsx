import { AppProvider } from "./context/AppContext";
import { AppRouter } from "./appRouter";

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
