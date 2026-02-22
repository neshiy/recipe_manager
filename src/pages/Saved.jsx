import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function SavedCard({ item, onToggleSave, isToggling }) {
  const title = item.name || "Untitled";
  const isExternal = item.kind === "explore";
  const href = isExternal ? item.sourceUrl : `/recipe/${item._id}`;

  return (
    <div className={`${styles.card} ${styles.homeRecipeCard}`}>
      <div className={styles.cardHeaderRow}>
        <h3 className={`${styles.h2} ${styles.recipeTitleClamp}`.trim()}>
          {isExternal ? (
            <a className={styles.link} href={href} target="_blank" rel="noreferrer">
              {title}
            </a>
          ) : (
            <Link className={styles.link} to={href}>
              {title}
            </Link>
          )}
        </h3>

        <button
          className={`${styles.homeIconButton} ${styles.homeIconButtonActive}`}
          type="button"
          onClick={onToggleSave}
          disabled={isToggling}
          aria-label="Unsave"
          title="Unsave"
        >
          ♥
        </button>
      </div>

      {item.imageUrl ? (
        <div className={styles.homeCardImageWrap}>
          <img className={styles.homeCardImage} src={item.imageUrl} alt={title} loading="lazy" />
        </div>
      ) : null}

      <div className={styles.cardFooterRow}>
        {isExternal ? (
          <a className={`${styles.buttonSecondary} ${styles.homeViewButton}`} href={href} target="_blank" rel="noreferrer">
            View
          </a>
        ) : (
          <Link className={`${styles.buttonSecondary} ${styles.homeViewButton}`} to={href}>
            View
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Saved() {
  const [searchText, setSearchText] = useState("");
  const [savedInternal, setSavedInternal] = useState([]);
  const [savedExplore, setSavedExplore] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingKey, setTogglingKey] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const [internalResult, exploreResult] = await Promise.allSettled([
          API.get("/me/saved"),
          API.get("/me/saved-explore"),
        ]);
        if (!isMounted) return;

        if (internalResult.status === "fulfilled") {
          setSavedInternal(Array.isArray(internalResult.value.data) ? internalResult.value.data : []);
        } else {
          setSavedInternal([]);
          setError("Failed to load saved recipes.");
        }

        if (exploreResult.status === "fulfilled") {
          setSavedExplore(Array.isArray(exploreResult.value.data) ? exploreResult.value.data : []);
        } else {
          setSavedExplore([]);
        }
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load saved recipes.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(() => {
    const internal = (Array.isArray(savedInternal) ? savedInternal : []).map((r) => ({
      kind: "internal",
      _id: r._id,
      name: r.name,
      imageUrl: r.imageUrl,
    }));

    const explore = (Array.isArray(savedExplore) ? savedExplore : [])
      .map((r) => ({
        kind: "explore",
        sourceUrl: r.sourceUrl,
        name: r.name,
        imageUrl: r.imageUrl,
      }))
      .filter((r) => r.sourceUrl);

    const q = normalize(searchText);
    const combined = [...explore, ...internal];
    if (!q) return combined;
    return combined.filter((x) => normalize(x.name).includes(q));
  }, [savedInternal, savedExplore, searchText]);

  async function toggle(item) {
    try {
      const key = item.kind === "explore" ? `explore:${item.sourceUrl}` : `internal:${item._id}`;
      setTogglingKey(key);

      if (item.kind === "explore") {
        const res = await API.post("/me/saved-explore/toggle", {
          sourceUrl: item.sourceUrl,
          name: item.name,
          imageUrl: item.imageUrl,
        });
        const next = Array.isArray(res.data?.savedExploreRecipes) ? res.data.savedExploreRecipes : [];
        setSavedExplore(next);
      } else {
        await API.post(`/me/saved/${item._id}/toggle`);
        setSavedInternal((prev) => prev.filter((r) => String(r._id) !== String(item._id)));
      }
    } catch (e) {
      setError("Failed to update saved recipes.");
    } finally {
      setTogglingKey("");
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Saved recipes</h1>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Search</label>
        <input
          className={styles.input}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search saved recipes"
        />
      </div>

      {isLoading ? <div className={styles.card}>Loading…</div> : null}
      {error ? <div className={`${styles.card} ${styles.errorCard}`}>{error}</div> : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className={styles.card}>No saved recipes yet.</div>
      ) : null}

      <div className={styles.savedGrid}>
        {items.map((item) => {
          const key = item.kind === "explore" ? `explore:${item.sourceUrl}` : `internal:${item._id}`;
          return (
            <SavedCard
              key={key}
              item={item}
              onToggleSave={() => toggle(item)}
              isToggling={togglingKey === key}
            />
          );
        })}
      </div>
    </div>
  );
}
