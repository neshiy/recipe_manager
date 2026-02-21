import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RecipeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [rating, setRating] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!isEdit) return;
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get(`/recipes/${id}`);
        if (!isMounted) return;
        const r = res.data || {};
        setName(r.name || "");
        setCuisineType(r.cuisineType || "");
        setCookingTime(typeof r.cookingTime === "number" ? String(r.cookingTime) : "");
        setRating(typeof r.rating === "number" ? String(r.rating) : "");
        setIngredientsText(Array.isArray(r.ingredients) ? r.ingredients.filter(Boolean).join("\n") : "");
        setStepsText(Array.isArray(r.steps) ? r.steps.filter(Boolean).join("\n") : "");
        setImageUrl(r.imageUrl || "");
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load recipe for editing.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const previewSrc = useMemo(() => {
    return imageUrl ? imageUrl : "";
  }, [imageUrl]);

  function validate() {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    const cooking = cookingTime === "" ? undefined : Number(cookingTime);
    if (cookingTime !== "" && (Number.isNaN(cooking) || cooking < 0)) {
      nextErrors.cookingTime = "Cooking time must be a positive number.";
    }

    const ratingNum = rating === "" ? undefined : Number(rating);
    if (rating !== "" && (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
      nextErrors.rating = "Rating must be between 0 and 5.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      cuisineType: cuisineType.trim() || undefined,
      cookingTime: cookingTime === "" ? undefined : Number(cookingTime),
      rating: rating === "" ? undefined : Number(rating),
      ingredients: splitLines(ingredientsText),
      steps: splitLines(stepsText),
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      setIsSaving(true);
      if (isEdit) {
        const res = await API.put(`/recipes/${id}`, payload);
        navigate(`/recipe/${res.data?._id || id}`);
      } else {
        const res = await API.post("/recipes", payload);
        navigate(`/recipe/${res.data?._id}`);
      }
    } catch (e2) {
      setError("Save failed. Please check your inputs and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function onImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  }

  if (isLoading) {
    return <div className={styles.card}>Loading…</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>{isEdit ? "Edit Recipe" : "Add Recipe"}</h1>
          <p className={styles.muted}>Fields marked required must be filled.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.buttonSecondary} to={isEdit ? `/recipe/${id}` : "/"}>
            Cancel
          </Link>
        </div>
      </div>

      {error ? <div className={styles.errorText}>{error}</div> : null}

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            Name <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Garlic Butter Pasta"
          />
          {fieldErrors.name ? <div className={styles.errorText}>{fieldErrors.name}</div> : null}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label className={styles.label}>Cuisine</label>
            <input
              className={styles.input}
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g. Italian"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cooking Time (minutes)</label>
            <input
              className={styles.input}
              inputMode="numeric"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              placeholder="e.g. 25"
            />
            {fieldErrors.cookingTime ? (
              <div className={styles.errorText}>{fieldErrors.cookingTime}</div>
            ) : null}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Rating (0–5)</label>
          <input
            className={styles.input}
            inputMode="decimal"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="e.g. 4.5"
          />
          {fieldErrors.rating ? <div className={styles.errorText}>{fieldErrors.rating}</div> : null}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label className={styles.label}>Ingredients (one per line)</label>
            <textarea
              className={styles.textarea}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="2 eggs\n1 cup flour\n1 tsp salt"
              rows={6}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Steps (one per line)</label>
            <textarea
              className={styles.textarea}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder="Boil water\nCook pasta\nMix sauce"
              rows={6}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Image URL (optional)</label>
          <input
            className={styles.input}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <div className={styles.helper}>Or upload an image to preview.</div>
          <input className={styles.file} type="file" accept="image/*" onChange={onImageFileChange} />

          {previewSrc ? (
            <div className={styles.imagePreviewWrap}>
              <img className={styles.imagePreview} src={previewSrc} alt="Preview" />
            </div>
          ) : null}
        </div>

        <div className={styles.cardFooterRow}>
          <button className={styles.button} type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isEdit ? "Update Recipe" : "Create Recipe"}
          </button>
          <Link className={styles.buttonSecondary} to={isEdit ? `/recipe/${id}` : "/"}>
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
