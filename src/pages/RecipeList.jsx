import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get("/recipes");
        if (!isMounted) return;
        setRecipes(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load recipes.");
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>Recipes</h1>
          <p className={styles.muted}>Browse, add, and manage your recipes.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.button} to="/add">
            Add Recipe
          </Link>
        </div>
      </div>

      {isLoading ? <div className={styles.card}>Loading…</div> : null}
      {error ? <div className={`${styles.card} ${styles.errorCard}`}>{error}</div> : null}

      {!isLoading && !error && recipes.length === 0 ? (
        <div className={styles.card}>No recipes yet. Create your first one.</div>
      ) : null}

      <div className={styles.grid}>
        {recipes.map((r) => (
          <div key={r._id} className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.h2}>
                <Link className={styles.link} to={`/recipe/${r._id}`}>
                  {r.name || "Untitled"}
                </Link>
              </h2>
              <div className={styles.badges}>
                {r.cuisineType ? <span className={styles.badge}>{r.cuisineType}</span> : null}
                {typeof r.cookingTime === "number" ? (
                  <span className={styles.badge}>{r.cookingTime} min</span>
                ) : null}
              </div>
            </div>

            {r.imageUrl ? (
              <img className={styles.thumb} src={r.imageUrl} alt={r.name || "Recipe"} />
            ) : null}

            <div className={styles.cardFooterRow}>
              <Link className={styles.buttonSecondary} to={`/recipe/${r._id}`}>
                View
              </Link>
              <Link className={styles.buttonSecondary} to={`/edit/${r._id}`}>
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
