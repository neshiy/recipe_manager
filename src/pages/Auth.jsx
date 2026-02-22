import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { API } from "../api";
import { firebaseAuth, firebaseEnabled } from "../firebaseClient";
import { useAuth } from "../useAuth";
import styles from "../styles/ui.module.css";

import desLogsign from "../pics/des-logsign.png";
import mobileLogsign from "../pics/mobile-loginsign.png";

function isDesktopLayout() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 900px)").matches;
}

export default function Auth() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [desktop, setDesktop] = useState(true);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const fromPath = useMemo(() => {
    const p = location.state?.from?.pathname;
    return typeof p === "string" && p ? p : "/profile";
  }, [location.state]);

  useEffect(() => {
    const d = isDesktopLayout();
    setDesktop(d);
  }, []);

  useEffect(() => {
    if (!firebaseEnabled) return;
    if (isLoading) return;
    if (user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, isLoading, fromPath, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!firebaseEnabled || !firebaseAuth) {
      setError(
        "Firebase Auth is not configured. Create client/.env with REACT_APP_FIREBASE_* values and restart the client."
      );
      return;
    }

    try {
      setIsWorking(true);

      if (mode === "login") {
        const username = loginUsername.trim();
        const password = loginPassword;
        if (!username || !password) {
          setError("Username and password are required.");
          return;
        }

        await signInWithEmailAndPassword(firebaseAuth, username, password);
        setLoginPassword("");
        navigate(fromPath, { replace: true });
        return;
      }

      const username = signupUsername.trim();
      const email = signupEmail.trim();
      const password = signupPassword;
      const confirm = signupConfirm;

      if (!username || !email || !password || !confirm) {
        setError("All fields are required.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (cred?.user) {
        try {
          await updateProfile(cred.user, { displayName: username });
        } catch {
          // non-fatal
        }
        try {
          await API.put("/me", { name: username, email });
        } catch {
          // non-fatal
        }
      }

      setSignupPassword("");
      setSignupConfirm("");
      navigate(fromPath, { replace: true });
    } catch (e2) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }

  const rightSrc = desktop ? desLogsign : mobileLogsign;

  return (
    <div className={styles.authPage} style={{ backgroundImage: `url(${rightSrc})` }}>
      <div className={styles.authShell}>
        <div className={styles.authLeft}>
          <div className={styles.authCard}>
            <div className={styles.authTabs}>
              <button
                className={`${styles.authTab} ${mode === "login" ? styles.authTabActive : ""}`}
                type="button"
                onClick={() => setMode("login")}
                disabled={isWorking}
              >
                Login
              </button>
              <button
                className={`${styles.authTab} ${mode === "signup" ? styles.authTabActive : ""}`}
                type="button"
                onClick={() => setMode("signup")}
                disabled={isWorking}
              >
                Sign up
              </button>
            </div>

            {error ? <div className={styles.errorText}>{error}</div> : null}

            <form onSubmit={onSubmit} className={styles.form}>
              {mode === "login" ? (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Username</label>
                    <input
                      className={styles.input}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="username"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className={styles.cardFooterRow}>
                    <button className={styles.button} type="submit" disabled={isWorking}>
                      {isWorking ? "Logging in…" : "Login"}
                    </button>
                  </div>

                  <div className={styles.authSwitchRow}>
                    <span className={styles.muted}>Dont have an account? </span>
                    <button className={styles.textButton} type="button" onClick={() => setMode("signup")}> 
                      Sign up
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Username</label>
                    <input
                      className={styles.input}
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Your name"
                      autoComplete="nickname"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                      className={styles.input}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Confirm password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={styles.cardFooterRow}>
                    <button className={styles.button} type="submit" disabled={isWorking}>
                      {isWorking ? "Signing up…" : "Sign up"}
                    </button>
                  </div>

                  <div className={styles.authSwitchRow}>
                    <span className={styles.muted}>Have an account ? </span>
                    <button className={styles.textButton} type="button" onClick={() => setMode("login")}>
                      Login
                    </button>
                  </div>
                </>
              )}
            </form>

            {!firebaseEnabled ? (
              <div className={styles.authDemoRow}>
                <Link className={styles.buttonSecondary} to="/">
                  Continue without login
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
