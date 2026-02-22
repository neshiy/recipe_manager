import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function titleFromUrl(url) {
  try {
    const u = new URL(String(url));
    const last = (u.pathname || "").split("/").filter(Boolean).pop() || "";
    const cleaned = decodeURIComponent(last)
      .replace(/[#?].*$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
    if (!cleaned) return "Recipe";
    return cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
  } catch {
    return "Recipe";
  }
}

const CURATED_BY_TYPE = {
  burger: [
    {
      sourceUrl: "https://overthefirecooking.com/cowboy-butter-burgers/#wprm-recipe-container-29915",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2024/07/Cover-Image-1-1024x1536.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/smoked-birria-burgers/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2022/06/Birria-Burger_006.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/beef-stroganoff-burgers/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2022/10/Facetune_30-09-2022-18-05-43.jpeg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/bacon-jalapeno-popper-stuffed-burgers/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2023/05/A_IMG_3667-2-1024x1536.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/the-ultimate-smoked-bologna-cheeseburger/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2022/06/IMG_6090_Facetune_22-06-2022-14-05-42-Large.jpeg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/charred-bbq-burger/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2018/09/IMG_1339-1-1024x1024.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/red-white-bleu-cheese-bacon-burger/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2017/06/IMG_6053-2-1024x681.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/smoked-pizza-burgers/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2022/10/A_IMG_6719-2-1024x1536.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/california-burrito-style-burger/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2022/05/A_IMG_2200-2-scaled-1024x683.jpg",
    },
    {
      sourceUrl: "https://overthefirecooking.com/mega-bacon-cheeseburger/",
      imageUrl: "https://overthefirecooking.com/wp-content/uploads/2018/08/PhotoAug052C64925AM-1024x1024.jpg",
    },
  ],
  pasta: [
    {
      sourceUrl: "https://www.recipetineats.com/15-minute-sausage-meatballs/#recipe",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/10/Sausage-meatballs-15-minutes_1.jpg?resize=1200%2C960&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/vodka-pasta/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/08/Penne-alla-vodka_2.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/whipped-ricotta-one-pot-chicken-pasta/",
      imageUrl:
        "https://www.recipetineats.com/tachyon/2025/04/One-pot-whipped-ricotta-chicken-pasta-with-sun-dried-tomatoes_6a.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/one-pot-cajun-beef-pasta/",
      imageUrl: "https://www.recipetineats.com/tachyon/2024/09/One-pot-Cajun-Beef-Pasta_0.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/nagi-big-easy-pasta-salad/",
      imageUrl: "https://www.recipetineats.com/tachyon/2024/08/Big-easy-pasta-salad_2.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/easy-ricotta-gnocchi-with-creamy-mushroom-sauce/",
      imageUrl: "https://www.recipetineats.com/tachyon/2024/06/Ricotta-Gnocchi-51183.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/carbonara/",
      imageUrl: "https://www.recipetineats.com/tachyon/2023/01/Carbonara_6a.jpg?resize=900%2C1125&zoom=0.72",
    },
    {
      sourceUrl: "https://www.recipetineats.com/spinach-ricotta-stuffed-shells/",
      imageUrl: "https://www.recipetineats.com/tachyon/2023/03/Spinach-ricotta-stuffed-shells_4.jpg?resize=900%2C1125&zoom=0.72",
    },
  ],
  dessert: [
    {
      sourceUrl: "https://www.recipetineats.com/pavlova-bombs/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/12/Pavlova-bombs_6.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/lemon-curd/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/12/Lemon-curd_7.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/crepes/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/11/Crepese-1.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/chocolate-pudding-pots/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/10/Chocolate-pudding-pots_0.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl:
        "https://www.recipetineats.com/whipped-cream-filled-chocolate-cupcakes-with-chocolate-ganache-frosting/",
      imageUrl:
        "https://www.recipetineats.com/tachyon/2025/10/Vanilla-whipped-cream-filled-chocoalte-cupcakes_3.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/red-velvet-cheesecake/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/07/Red-velvet-cheesecake_5.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/biscoff-stuffed-cookies/",
      imageUrl: "https://www.recipetineats.com/tachyon/2025/06/Biscoff-stuffed-cookies_3.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/nutella-stuffed-cookies/",
      imageUrl: "https://www.recipetineats.com/tachyon/2024/11/Nutella-stuffed-cookies_5-1.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/christmas-cheesecake/",
      imageUrl: "https://www.recipetineats.com/tachyon/2024/12/Christmas-cheesecake-no-bake-slab_4.jpg?resize=1200%2C1500&zoom=0.54",
    },
    {
      sourceUrl: "https://www.recipetineats.com/pikelets/",
      imageUrl: "https://www.recipetineats.com/tachyon/2016/06/Pikelets-51079.jpg?resize=1200%2C1500&zoom=0.54",
    },
  ],
};

function ExternalRecipeCard({ recipe, isSaved, onToggleSave, isSavingSave }) {
  const title = recipe.name || titleFromUrl(recipe.sourceUrl);

  return (
    <div className={`${styles.card} ${styles.homeRecipeCard}`}>
      <div className={styles.cardHeaderRow}>
        <h2 className={styles.h2}>
          <a className={styles.link} href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            {title}
          </a>
        </h2>

        <div className={styles.badges}>
          {typeof onToggleSave === "function" ? (
            <button
              className={`${styles.homeIconButton} ${isSaved ? styles.homeIconButtonActive : ""}`}
              type="button"
              onClick={onToggleSave}
              disabled={isSavingSave}
              aria-label={isSaved ? "Unsave" : "Save"}
              title={isSaved ? "Unsave" : "Save"}
            >
              ♥
            </button>
          ) : null}
        </div>
      </div>

      {recipe.imageUrl ? (
        <div className={styles.homeCardImageWrap}>
          <img className={styles.homeCardImage} src={recipe.imageUrl} alt={title} loading="lazy" />
        </div>
      ) : null}

      <div className={styles.cardFooterRow}>
        <a
          className={`${styles.buttonSecondary} ${styles.homeViewButton}`}
          href={recipe.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          View
        </a>
      </div>
    </div>
  );
}

export default function RecipesByType() {
  const { type } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [savedExplore, setSavedExplore] = useState([]);
  const [isSavingExploreUrl, setIsSavingExploreUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");

      const [recipesResult, savedExploreResult] = await Promise.allSettled([
        API.get("/recipes"),
        API.get("/me/saved-explore"),
      ]);
      if (!isMounted) return;

      if (recipesResult.status === "fulfilled") {
        setRecipes(Array.isArray(recipesResult.value.data) ? recipesResult.value.data : []);
      } else {
        setRecipes([]);
        setError("Failed to load recipes.");
      }

      if (savedExploreResult.status === "fulfilled") {
        setSavedExplore(Array.isArray(savedExploreResult.value.data) ? savedExploreResult.value.data : []);
      } else {
        setSavedExplore([]);
      }

      setIsLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const savedExploreUrls = useMemo(() => {
    return new Set((savedExplore || []).map((r) => String(r?.sourceUrl || "").trim()).filter(Boolean));
  }, [savedExplore]);

  async function toggleExploreSave(external) {
    const url = String(external?.sourceUrl || "").trim();
    if (!url) return;

    try {
      setIsSavingExploreUrl(url);
      const res = await API.post("/me/saved-explore/toggle", {
        sourceUrl: url,
        name: external?.name || titleFromUrl(url),
        imageUrl: external?.imageUrl || "",
      });
      const next = Array.isArray(res.data?.savedExploreRecipes) ? res.data.savedExploreRecipes : [];
      setSavedExplore(next);
    } catch {
      // non-fatal
    } finally {
      setIsSavingExploreUrl("");
    }
  }

  const filtered = useMemo(() => {
    const t = normalize(type);
    if (!t) return recipes;

    return recipes.filter((r) => {
      const cuisine = normalize(r.cuisineType);
      const name = normalize(r.name);
      const ingredientMatch = Array.isArray(r.ingredients) ? r.ingredients.some((i) => normalize(i).includes(t)) : false;
      return cuisine === t || cuisine.includes(t) || name.includes(t) || ingredientMatch;
    });
  }, [recipes, type]);

  const curated = useMemo(() => {
    const key = normalize(type);
    const list = CURATED_BY_TYPE[key] || [];
    return list.map((r) => ({
      sourceUrl: r.sourceUrl,
      imageUrl: r.imageUrl,
      name: titleFromUrl(r.sourceUrl),
    }));
  }, [type]);

  const title = type ? String(type) : "Type";

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.h1}>{title}</h1>
        </div>
        <div className={styles.actions}>
          <Link className={styles.buttonSecondary} to="/">
            Back
          </Link>
          <Link className={styles.buttonSecondary} to="/recipes">
            All recipes
          </Link>
        </div>
      </div>

      {isLoading ? <div className={styles.card}>Loading…</div> : null}
      {error ? <div className={`${styles.card} ${styles.errorCard}`}>{error}</div> : null}

      {!isLoading && !error && filtered.length === 0 ? (
        <div className={styles.card}>No recipes found for this type.</div>
      ) : null}

      {curated.length ? (
        <div className={styles.typeCardsGrid}>
          {curated.map((r) => (
            <ExternalRecipeCard
              key={r.sourceUrl}
              recipe={r}
              isSaved={savedExploreUrls.has(String(r.sourceUrl || "").trim())}
              isSavingSave={isSavingExploreUrl === String(r.sourceUrl || "").trim()}
              onToggleSave={() => toggleExploreSave(r)}
            />
          ))}
        </div>
      ) : null}

      <div className={styles.typeCardsGrid}>
        {filtered.map((r) => (
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

            {r.imageUrl ? <img className={styles.thumb} src={r.imageUrl} alt={r.name || "Recipe"} /> : null}

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
