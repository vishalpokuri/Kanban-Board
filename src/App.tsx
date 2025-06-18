import { useState } from "react";
import "./App.css";
import KanbanBoard from "./components/KanbanBoard";
import AuthPage from "./components/AuthPage";

interface User {
  _id: string;
  email: string;
  name: string;
  columns: string[];
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <KanbanBoard user={user} onLogout={handleLogout} />;
}

export default App;
