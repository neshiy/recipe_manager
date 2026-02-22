import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { API } from "../api";
import { firebaseAuth } from "../firebaseClient";
import { useAuth } from "../useAuth";
import styles from "../styles/ui.module.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [saved, setSaved] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingRecipeId, setIsDeletingRecipeId] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteCuisine, setFavoriteCuisine] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthWorking, setIsAuthWorking] = useState(false);

  async function loadAll() {
    try {
      setIsLoading(true);
      setError("");

      const [meRes, statsRes, mineRes, savedRes] = await Promise.all([
        API.get("/me"),
        API.get("/me/stats"),
        API.get("/me/recipes"),
        API.get("/me/saved"),
      ]);

      const nextMe = meRes.data;
      setMe(nextMe);
      setStats(statsRes.data || null);
      setMyRecipes(Array.isArray(mineRes.data) ? mineRes.data : []);
      setSaved(Array.isArray(savedRes.data) ? savedRes.data : []);

      setName(nextMe?.name || "");
      setBio(nextMe?.bio || "");
      setFavoriteCuisine(nextMe?.favoriteCuisine || "");
      setProfileImage(nextMe?.profileImage || "");
    } catch (e) {
      setError("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const mostUsedCuisine = useMemo(() => {
    const v = stats?.mostUsedCuisine;
    return v ? String(v) : "—";
  }, [stats]);

  const avgRating = useMemo(() => {
    if (stats?.avgRating == null) return "—";
    return String(stats.avgRating);
  }, [stats]);

  const email = me?.email || "";

  async function onAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");

    if (!firebaseAuth) {
      setAuthError("Firebase Auth is not configured. Set client/.env (see client/.env.example) and restart npm start.");
      return;
    }

    const emailValue = authEmail.trim();
    const passwordValue = authPassword;

    if (!emailValue || !passwordValue) {
      setAuthError("Email and password are required.");
      return;
    }

    try {
      setIsAuthWorking(true);
      if (authMode === "signup") {
        await createUserWithEmailAndPassword(firebaseAuth, emailValue, passwordValue);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, emailValue, passwordValue);
      }
      setAuthPassword("");
      await loadAll();
    } catch (e2) {
      setAuthError("Authentication failed. Please try again.");
    } finally {
      setIsAuthWorking(false);
    }
  }

  async function onLogout() {
    try {
      setIsAuthWorking(true);
      if (!firebaseAuth) {
        setAuthError("Firebase Auth is not configured.");
        return;
      }
      await signOut(firebaseAuth);
      await loadAll();
      navigate("/auth", { replace: true });
    } catch (e) {
      setAuthError("Logout failed.");
    } finally {
      setIsAuthWorking(false);
    }
  }

  async function onChangePassword() {
    setAuthError("");
    const nextPassword = newPassword;
    if (!nextPassword) {
      setAuthError("Enter a new password.");
      return;
    }

    try {
      setIsAuthWorking(true);
      if (!firebaseAuth || !firebaseAuth.currentUser) {
        setAuthError("You must be logged in to change your password.");
        return;
      }
      await updatePassword(firebaseAuth.currentUser, nextPassword);
      setNewPassword("");
    } catch (e) {
      setAuthError("Change password failed. You may need to log in again.");
    } finally {
      setIsAuthWorking(false);
    }
  }

  async function onDeleteAccount() {
    setAuthError("");
    const ok = window.confirm("Delete your account? This cannot be undone.");
    if (!ok) return;

    try {
      setIsAuthWorking(true);
      if (!firebaseAuth || !firebaseAuth.currentUser) {
        setAuthError("You must be logged in to delete your account.");
        return;
      }
      await deleteUser(firebaseAuth.currentUser);
      await loadAll();
    } catch (e) {
      setAuthError("Delete account failed. You may need to log in again.");
    } finally {
      setIsAuthWorking(false);
    }
  }

  async function onSaveProfile() {
    try {
      setIsSavingProfile(true);
      setError("");
      const res = await API.put("/me", {
        name,
        bio,
        favoriteCuisine,
        profileImage,
      });
      setMe(res.data);
    } catch (e) {
      setError("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  function onProfileImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileImage(result);
    };
    reader.readAsDataURL(file);
  }

  async function onDeleteRecipe(id) {
    const ok = window.confirm("Delete this recipe?");
    if (!ok) return;

    try {
      setIsDeletingRecipeId(id);
      await API.delete(`/recipes/${id}`);
      await loadAll();
    } catch (e) {
      setError("Failed to delete recipe.");
    } finally {
      setIsDeletingRecipeId("");
    }
  }

  async function onUnsave(recipeId) {
    try {
      await API.post(`/me/saved/${recipeId}/toggle`);
      await loadAll();
    } catch (e) {
      setError("Failed to update saved recipes.");
    }
  }

  const filteredMyRecipes = useMemo(() => {
    // If you later add auth, this will already be scoped.
    return myRecipes;
  }, [myRecipes]);

  const savedIds = useMemo(() => new Set(saved.map((r) => String(r?._id))), [saved]);

  const mostUsedCuisineLabel = mostUsedCuisine || "—";

  if (isLoading) return <div className={styles.card}>Loading…</div>;

  return (
    <div className={styles.profileShell}>
      <div className={styles.profileContainer}>
        <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.profileCardGrid}>
            <div className={styles.profileCardMain}>
              <div className={styles.profileNameRow}>
                <h1 className={styles.h1}>Profile</h1>
                <Link className={styles.buttonSecondary} to="/">
                  Home
                </Link>
              </div>

              <div className={styles.profileFormGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Full name</label>
                  <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} value={email} disabled readOnly />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Bio</label>
                  <textarea
                    className={styles.textarea}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder='e.g. "Home chef who loves Italian cuisine"'
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Favorite cuisine</label>
                  <input
                    className={styles.input}
                    value={favoriteCuisine}
                    onChange={(e) => setFavoriteCuisine(e.target.value)}
                    placeholder="e.g. Italian"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Profile picture</label>
                  <input
                    className={styles.input}
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="Paste an image URL or use upload below"
                  />
                  <input className={styles.file} type="file" accept="image/*" onChange={onProfileImageFileChange} />
                </div>

                <div className={styles.cardFooterRow}>
                  <button className={styles.button} type="button" onClick={onSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving…" : "Update profile"}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.profileAvatarWrap}>
              {profileImage ? (
                <img className={styles.profileAvatarImg} src={profileImage} alt="Profile" />
              ) : (
                <div className={styles.profileAvatarFallback} aria-hidden="true">
                  {(name || "N").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.card} ${styles.statCard}`}>
          <div className={styles.statIcon} aria-hidden="true">
            R
          </div>
          <div>
            <div className={styles.statLabel}>Recipes Created</div>
            <div className={styles.statValue}>{stats?.recipesCreated ?? "—"}</div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <div className={styles.statIcon} aria-hidden="true">
            S
          </div>
          <div>
            <div className={styles.statLabel}>Saved Recipes</div>
            <div className={styles.statValue}>{stats?.savedRecipes ?? "—"}</div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <div className={styles.statIcon} aria-hidden="true">
            C
          </div>
          <div>
            <div className={styles.statLabel}>Most Used Cuisine</div>
            <div className={styles.statValue}>{mostUsedCuisineLabel}</div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <div className={styles.statIcon} aria-hidden="true">
            A
          </div>
          <div>
            <div className={styles.statLabel}>Avg Rating</div>
            <div className={styles.statValue}>{avgRating}</div>
          </div>
        </div>
      </div>

      <section className={styles.profileSection}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>My Recipes</h2>
          <Link className={styles.textButton} to="/add">
            Create
          </Link>
        </div>

        {filteredMyRecipes.length === 0 ? <div className={styles.card}>No recipes yet.</div> : null}

        <div className={styles.grid}>
          {filteredMyRecipes.slice(0, 3).map((r) => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.h2}>
                  <Link className={styles.link} to={`/recipe/${r._id}`}>
                    {r.name || "Untitled"}
                  </Link>
                </h2>
                <div className={styles.badges}>
                  {typeof r.cookingTime === "number" ? (
                    <span className={styles.badge}>{r.cookingTime} min</span>
                  ) : null}
                  {typeof r.rating === "number" ? <span className={styles.badge}>⭐ {r.rating}</span> : null}
                </div>
              </div>

              {r.imageUrl ? <img className={styles.thumb} src={r.imageUrl} alt={r.name || "Recipe"} /> : null}

              <div className={styles.cardFooterRow}>
                <Link className={styles.buttonSecondary} to={`/edit/${r._id}`}>
                  Edit
                </Link>
                <button
                  className={styles.buttonDanger}
                  type="button"
                  onClick={() => onDeleteRecipe(r._id)}
                  disabled={isDeletingRecipeId === r._id}
                >
                  {isDeletingRecipeId === r._id ? "Deleting…" : "Delete"}
                </button>

                {savedIds.has(String(r._id)) ? (
                  <button className={styles.buttonSecondary} type="button" onClick={() => onUnsave(r._id)}>
                    Unsave
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.profileSection}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Saved Recipes</h2>
        </div>

        {saved.length === 0 ? <div className={styles.card}>No saved recipes yet.</div> : null}

        <div className={styles.grid}>
          {saved.slice(0, 3).map((r) => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.h2}>
                  <Link className={styles.link} to={`/recipe/${r._id}`}>
                    {r.name || "Untitled"}
                  </Link>
                </h2>
                <div className={styles.badges}>
                  {r.cuisineType ? <span className={styles.badge}>{r.cuisineType}</span> : null}
                </div>
              </div>

              {r.imageUrl ? <img className={styles.thumb} src={r.imageUrl} alt={r.name || "Recipe"} /> : null}

              <div className={styles.cardFooterRow}>
                <Link className={styles.buttonSecondary} to={`/recipe/${r._id}`}>
                  View
                </Link>
                <button className={styles.buttonSecondary} type="button" onClick={() => onUnsave(r._id)}>
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.profileSection}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Account settings</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.pageHeader}>
            <div>
              <h2 className={styles.h2}>Account</h2>
              <p className={styles.muted}>
                {isAuthLoading
                  ? "Checking login…"
                  : user
                    ? `Signed in as ${user.email || "(no email)"}`
                    : "Not signed in"}
              </p>
            </div>
          </div>

          {authError ? <div className={styles.errorText}>{authError}</div> : null}
          {error ? <div className={styles.errorText}>{error}</div> : null}

          <div className={styles.cardFooterRow}>
            {user ? (
              <button className={styles.buttonSecondary} type="button" onClick={onLogout} disabled={isAuthWorking}>
                Log out
              </button>
            ) : (
              <button
                className={styles.buttonSecondary}
                type="button"
                onClick={() => navigate("/auth")}
                disabled={isAuthWorking}
              >
                Login / Sign up
              </button>
            )}
          </div>

          {!user ? (
            <form onSubmit={onAuthSubmit} className={styles.form}>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input
                    className={styles.input}
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className={styles.cardFooterRow}>
                <button className={styles.button} type="submit" disabled={isAuthWorking}>
                  {isAuthWorking ? "Working…" : authMode === "signup" ? "Sign up" : "Log in"}
                </button>
                <button
                  className={styles.buttonSecondary}
                  type="button"
                  onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
                  disabled={isAuthWorking}
                >
                  {authMode === "signup" ? "Switch to login" : "Switch to sign up"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.form}>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>New password</label>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <div className={styles.helper}>Firebase may require a recent login to change password.</div>
                </div>
              </div>

              <div className={styles.cardFooterRow}>
                <button
                  className={styles.buttonSecondary}
                  type="button"
                  onClick={onChangePassword}
                  disabled={isAuthWorking}
                >
                  Change password
                </button>
                <button className={styles.buttonDanger} type="button" onClick={onDeleteAccount} disabled={isAuthWorking}>
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
