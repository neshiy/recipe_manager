import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import RecipeList from "./pages/RecipeList";
import styles from "./styles/ui.module.css";

function AppShell() {
  return (
    <div className={styles.appShell}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link className={styles.brand} to="/">
            Recipe Manager
          </Link>
          <nav className={styles.nav}>
            <Link className={styles.buttonSecondary} to="/">
              Recipes
            </Link>
            <Link className={styles.button} to="/add">
              Add
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/add" element={<RecipeForm />} />
          <Route path="/edit/:id" element={<RecipeForm />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
