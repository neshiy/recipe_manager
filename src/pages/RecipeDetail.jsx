import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingSave, setIsTogglingSave] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const [res, meRes] = await Promise.all([API.get(`/recipes/${id}`), API.get("/me")]);
        if (!isMounted) return;
        setRecipe(res.data || null);
        const savedList = Array.isArray(meRes.data?.savedRecipes) ? meRes.data.savedRecipes : [];
        setIsSaved(savedList.some((x) => String(x) === String(id)));
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load recipe.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    if (id) load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const ingredients = useMemo(() => {
    if (!recipe?.ingredients) return [];
    return recipe.ingredients.filter(Boolean);
  }, [recipe]);

  const steps = useMemo(() => {
    if (!recipe?.steps) return [];
    return recipe.steps.filter(Boolean);
  }, [recipe]);

  async function onDelete() {
    if (!id) return;
    const ok = window.confirm("Delete this recipe?");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await API.delete(`/recipes/${id}`);
      navigate("/");
    } catch (e) {
      setError("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function onToggleSave() {
    if (!id) return;
    try {
      setIsTogglingSave(true);
      setError("");
      const res = await API.post(`/me/saved/${id}/toggle`);
      setIsSaved(Boolean(res.data?.saved));
    } catch (e) {
      setError("Failed to update saved recipes.");
    } finally {
      setIsTogglingSave(false);
    }
  }

  if (isLoading) {
    return <div className={styles.card}>Loading…</div>;
  }

  if (error) {
    return <div className={`${styles.card} ${styles.errorCard}`}>{error}</div>;
  }

  if (!recipe) {
    return <div className={styles.card}>Recipe not found.</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>{recipe.name || "Untitled"}</h1>
          <div className={styles.badges}>
            {recipe.cuisineType ? <span className={styles.badge}>{recipe.cuisineType}</span> : null}
            {typeof recipe.cookingTime === "number" ? (
              <span className={styles.badge}>{recipe.cookingTime} min</span>
            ) : null}
            {typeof recipe.calories === "number" ? (
              <span className={styles.badge}>{recipe.calories} cal</span>
            ) : null}
            {typeof recipe.rating === "number" ? (
              <span className={styles.badge}>Rating: {recipe.rating}</span>
            ) : null}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.buttonSecondary}
            type="button"
            onClick={onToggleSave}
            disabled={isTogglingSave}
          >
            {isTogglingSave ? "Working…" : isSaved ? "Unsave" : "Save"}
          </button>
          <Link className={styles.buttonSecondary} to={`/edit/${recipe._id}`}>
            Edit
          </Link>
          <button
            className={styles.buttonDanger}
            onClick={onDelete}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {recipe.imageUrl ? (
        <div className={styles.card}>
          <img className={styles.heroImage} src={recipe.imageUrl} alt={recipe.name || "Recipe"} />
        </div>
      ) : null}

      {recipe.description ? (
        <div className={styles.card}>
          <h2 className={styles.h2}>Description</h2>
          <div className={`${styles.muted} ${styles.recipeDescription}`}>
            {recipe.description}
          </div>
        </div>
      ) : null}

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <h2 className={styles.h2}>Ingredients</h2>
          {ingredients.length === 0 ? (
            <div className={styles.muted}>No ingredients listed.</div>
          ) : (
            <ul className={styles.list}>
              {ingredients.map((i, idx) => (
                <li key={`${i}-${idx}`}>{i}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.h2}>Steps</h2>
          {steps.length === 0 ? (
            <div className={styles.muted}>No steps listed.</div>
          ) : (
            <ol className={styles.list}>
              {steps.map((s, idx) => (
                <li key={`${s}-${idx}`}>{s}</li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className={styles.cardFooterRow}>
        <Link className={styles.buttonSecondary} to="/">
          Back
        </Link>
      </div>
    </div>
  );
}
