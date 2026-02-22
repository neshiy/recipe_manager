import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import MyRecipes from "./pages/MyRecipes";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import RecipeList from "./pages/RecipeList";
import RecipesByType from "./pages/RecipesByType";
import { firebaseEnabled } from "./firebaseClient";
import { useAuth } from "./useAuth";
import styles from "./styles/ui.module.css";

import desStart from "./pics/des-start.png";
import mobileStart from "./pics/mobile-start.png";

function isDesktopLayout() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 900px)").matches;
}

function CenteredLayout() {
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
}

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (!firebaseEnabled) return <Outlet />;

  if (isLoading) return <Navigate to="/auth" replace state={{ from: location }} />;

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function BootSplash({ children }) {
  const [desktop, setDesktop] = useState(true);
  const [show, setShow] = useState(process.env.NODE_ENV !== "test");

  useEffect(() => {
    if (!show) return () => {};

    setDesktop(isDesktopLayout());
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return children;

  const splashSrc = desktop ? desStart : mobileStart;
  return (
    <div className={styles.authSplash}>
      <img className={styles.authSplashImg} src={splashSrc} alt="Welcome" />
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/recipe/") || location.pathname.startsWith("/auth");

  return (
    <div className={styles.appShell}>
      <main className={styles.mainWithFooter}>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />

            <Route element={<CenteredLayout />}>
              <Route path="/recipes" element={<RecipeList />} />
              <Route path="/add" element={<RecipeForm />} />
              <Route path="/edit/:id" element={<RecipeForm />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/type/:type" element={<RecipesByType />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/my-recipes" element={<MyRecipes />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={firebaseEnabled ? "/auth" : "/"} replace />} />
        </Routes>
      </main>

      {!hideFooter ? (
        <footer className={styles.footerNav}>
          <div className={styles.footerStrip} />
          <nav className={styles.footerNavInner} aria-label="Footer">
            <Link className={styles.footerItem} to="/">
              <div className={styles.footerLabel}>Home</div>
            </Link>
            <Link className={styles.footerItem} to="/saved">
              <div className={styles.footerLabel}>Saved</div>
            </Link>

            <Link className={styles.footerAdd} to="/add" aria-label="Create recipe">
              <span className={styles.footerAddPlus} aria-hidden="true">
                +
              </span>
            </Link>

            <Link className={styles.footerItem} to="/my-recipes">
              <div className={styles.footerLabel}>My recipes</div>
            </Link>
            <Link className={styles.footerItem} to="/profile">
              <div className={styles.footerLabel}>Profile</div>
            </Link>
          </nav>
        </footer>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BootSplash>
        <AppShell />
      </BootSplash>
    </BrowserRouter>
  );
}
