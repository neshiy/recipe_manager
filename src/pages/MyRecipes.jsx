import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");

  async function load() {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/me/recipes");
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Failed to load your recipes.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id) {
    const ok = window.confirm("Delete this recipe?");
    if (!ok) return;

    try {
      setIsDeletingId(String(id));
      setError("");
      await API.delete(`/recipes/${id}`);
      await load();
    } catch (e) {
      setError("Failed to delete recipe.");
    } finally {
      setIsDeletingId("");
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>My Recipes</h1>
        </div>
        <div className={styles.actions}>
          <Link className={styles.button} to="/add">
            Create
          </Link>
          <Link className={styles.buttonSecondary} to="/">
            Home
          </Link>
        </div>
      </div>

      {isLoading ? <div className={styles.card}>Loading…</div> : null}
      {error ? <div className={`${styles.card} ${styles.errorCard}`}>{error}</div> : null}

      {!isLoading && !error && recipes.length === 0 ? (
        <div className={styles.card}>No recipes yet. Create your first one.</div>
      ) : null}

      <div className={styles.myRecipesGrid}>
        {recipes.map((r) => (
          <div key={r._id} className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.h2}>
                <Link className={styles.link} to={`/recipe/${r._id}`}>
                  {r.name || "Untitled"}
                </Link>
              </h2>
              <div className={styles.badges}>
                {typeof r.rating === "number" ? <span className={styles.badge}>⭐ {r.rating}</span> : null}
                {typeof r.calories === "number" ? <span className={styles.badge}>{r.calories} cal</span> : null}
              </div>
            </div>

            {r.imageUrl ? <img className={styles.thumb} src={r.imageUrl} alt={r.name || "Recipe"} /> : null}

            {r.description ? <div className={`${styles.muted} ${styles.recipeDescription}`}>{r.description}</div> : null}

            <div className={`${styles.badges} ${styles.cardSubRow}`}>
              {r.cuisineType ? <span className={styles.badge}>{r.cuisineType}</span> : null}
              {typeof r.cookingTime === "number" ? <span className={styles.badge}>{r.cookingTime} min</span> : null}
              {Array.isArray(r.ingredients) && r.ingredients.length ? (
                <span className={styles.badge}>{r.ingredients.length} ingredients</span>
              ) : null}
            </div>

            <div className={styles.cardFooterRow}>
              <Link className={styles.buttonSecondary} to={`/recipe/${r._id}`}>
                View
              </Link>
              <Link className={styles.buttonSecondary} to={`/edit/${r._id}`}>
                Edit
              </Link>
              <button
                className={styles.buttonDanger}
                type="button"
                onClick={() => onDelete(r._id)}
                disabled={isDeletingId === String(r._id)}
              >
                {isDeletingId === String(r._id) ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
