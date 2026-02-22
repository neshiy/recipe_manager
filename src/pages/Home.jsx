import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import styles from "../styles/ui.module.css";

const FOOD_TYPES = [
  {
    key: "burger",
    label: "Burger",
    imageUrl: "https://i.pinimg.com/736x/c9/c5/01/c9c5013a47c78dde12d22a8659cdb945.jpg",
  },
  {
    key: "pasta",
    label: "Pasta",
    imageUrl: "https://i.pinimg.com/1200x/d4/af/ae/d4afaea8a8793de367d324501f016638.jpg",
  },
  {
    key: "dessert",
    label: "Dessert",
    imageUrl: "https://i.pinimg.com/736x/0e/c2/89/0ec289492947872976c5c52215280faa.jpg",
  },
  {
    key: "salad",
    label: "Salad",
    imageUrl: "https://i.pinimg.com/736x/44/8f/c1/448fc10ef066e9380d038c4a3795da2b.jpg",
  },
  {
    key: "pizza",
    label: "Pizza",
    imageUrl: "https://i.pinimg.com/736x/95/91/c3/9591c3e67661b68a27c47cb33b66c83f.jpg",
  },
];

const CURATED_EXPLORE_RECIPES = [
  {
    _id: "curated-pinchofyum-chicken-wontons",
    name: "Chicken Wontons in Spicy Chili Sauce",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/chicken-wontons-in-spicy-chili-sauce",
    imageUrl: "https://pinchofyum.com/tachyon/Chicken-Wontons-1.jpg?resize=1600%2C2395&zoom=1",
  },
  {
    _id: "curated-pinchofyum-miso-peanut-ramen-bowls",
    name: "Miso Peanut Ramen Bowls",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/miso-peanut-ramen-bowls",
    imageUrl: "https://pinchofyum.com/tachyon/Miso-Peanut-Ramen-Bowls.jpg?resize=1600%2C2214&zoom=1",
  },
  {
    _id: "curated-pinchofyum-cauliflower-black-bean-tostadas",
    name: "Cauliflower Black Bean Tostadas with Queso and Pickled Onion",
    cuisineType: "Pinch of Yum",
    sourceUrl:
      "https://pinchofyum.com/cauliflower-black-bean-tostadas-with-queso-and-pickled-onion",
    imageUrl:
      "https://pinchofyum.com/tachyon/Cauliflower-Black-Bean-Tostadas-4.jpg?resize=1500%2C2250&zoom=1",
  },
  {
    _id: "curated-pinchofyum-bang-bang-salmon",
    name: "Bang Bang Salmon with Avocado Cucumber Salsa",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/bang-bang-salmon-with-avocado-cucumber-salsa",
    imageUrl:
      "https://pinchofyum.com/tachyon/Bang-Bang-Salmon-with-Rice-and-Cucumber.jpg?resize=1600%2C2194&zoom=1",
  },
  {
    _id: "curated-pinchofyum-gochujang-chicken-burgers",
    name: "Gochujang Chicken Burgers with Kimchi Bacon Jam",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/gochujang-chicken-burgers-with-kimchi-bacon-jam",
    imageUrl: "https://pinchofyum.com/tachyon/Gochujang-Burgers-9.jpg?resize=1600%2C2003&zoom=1",
  },
  {
    _id: "curated-pinchofyum-salmon-tacos",
    name: "Salmon Tacos",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/salmon-tacos",
    imageUrl: "https://pinchofyum.com/tachyon/Salmon-Tacos-61-1.jpg?resize=1600%2C2400&zoom=1",
  },
  {
    _id: "curated-pinchofyum-red-curry-chicken-stir-fry",
    name: "Red Curry Chicken Stir Fry with Spicy Cashew Sauce",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/red-curry-chicken-stir-fry-with-spicy-cashew-sauce",
    imageUrl:
      "https://pinchofyum.com/tachyon/Red-Curry-Chicken-Stir-Fry-10.jpg?resize=1600%2C2400&zoom=1",
  },
  {
    _id: "curated-pinchofyum-burger-bowls",
    name: "Burger Bowls with House Sauce and Ranch Fries",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/burger-bowls-with-house-sauce-and-ranch-fries",
    imageUrl:
      "https://pinchofyum.com/tachyon/Burger-Bowls-with-Ranch-Fries.jpg?resize=1600%2C2207&zoom=1",
  },
  {
    _id: "curated-pinchofyum-sheet-pan-jambalaya",
    name: "Sheet Pan Jambalaya",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/sheet-pan-jambalaya",
    imageUrl: "https://pinchofyum.com/tachyon/Sheet-Pan-Jambalaya-2.jpg?resize=1200%2C1800&zoom=1",
  },
  {
    _id: "curated-pinchofyum-egg-roll-tacos",
    name: "Egg Roll Tacos",
    cuisineType: "Pinch of Yum",
    sourceUrl: "https://pinchofyum.com/egg-roll-tacos",
    imageUrl:
      "https://pinchofyum.com/tachyon/Brandons-Egg-Roll-Tacos-1-3.jpg?resize=1600%2C2167&zoom=1",
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function RecipeMiniCard({ recipe, className, isSaved, onToggleSave, isSavingSave }) {
  const title = recipe.name || "Untitled";
  const detailsUrl = recipe.sourceUrl || (recipe._id ? `/recipe/${recipe._id}` : "");
  const isExternal = Boolean(recipe.sourceUrl);
  const showCuisineBadge = Boolean(recipe.cuisineType) && recipe.cuisineType !== "Pinch of Yum";

  return (
    <div className={`${styles.card} ${styles.homeRecipeCard} ${className || ""}`.trim()}>
      <div className={styles.cardHeaderRow}>
        <h3 className={`${styles.h2} ${styles.recipeTitleClamp}`.trim()}>
          {isExternal ? (
            <a className={styles.link} href={detailsUrl} target="_blank" rel="noreferrer">
              {title}
            </a>
          ) : (
            <Link className={styles.link} to={detailsUrl}>
              {title}
            </Link>
          )}
        </h3>
        <div className={styles.badges}>
          {showCuisineBadge ? (
            <span className={`${styles.badge} ${styles.homeCuisineBadge}`}>{recipe.cuisineType}</span>
          ) : null}

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
        {isExternal ? (
          <a
            className={`${styles.buttonSecondary} ${styles.homeViewButton}`}
            href={detailsUrl}
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        ) : (
          <Link className={`${styles.buttonSecondary} ${styles.homeViewButton}`} to={detailsUrl}>
            View
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const exploreRowRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [me, setMe] = useState(null);
  const [savedExplore, setSavedExplore] = useState([]);
  const [isSavingExploreUrl, setIsSavingExploreUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const [recipesResult, savedExploreResult, meResult] = await Promise.allSettled([
          API.get("/me/recipes"),
          API.get("/me/saved-explore"),
          API.get("/me"),
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

        if (meResult.status === "fulfilled") {
          setMe(meResult.value.data || null);
        } else {
          setMe(null);
        }
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Hello good morning";
    if (hour >= 12 && hour < 17) return "Hello good afternoon";
    return "Hello good evening";
  }, []);

  const avatarLetter = useMemo(() => {
    const name = String(me?.name || "").trim();
    if (name) return name.slice(0, 1).toUpperCase();
    return "N";
  }, [me?.name]);

  const savedExploreUrls = useMemo(() => {
    return new Set((savedExplore || []).map((r) => String(r?.sourceUrl || "").trim()).filter(Boolean));
  }, [savedExplore]);

  const filtered = useMemo(() => {
    const q = normalize(searchText);
    if (!q) return recipes;
    return recipes.filter((r) => {
      return (
        normalize(r.name).includes(q) ||
        normalize(r.cuisineType).includes(q) ||
        (Array.isArray(r.ingredients) ? r.ingredients.some((i) => normalize(i).includes(q)) : false)
      );
    });
  }, [recipes, searchText]);

  const myRecipes = useMemo(() => filtered.slice(0, 4), [filtered]);

  const exploreRecipes = useMemo(() => {
    const q = normalize(searchText);
    if (!q) return CURATED_EXPLORE_RECIPES;
    return CURATED_EXPLORE_RECIPES.filter((r) => {
      return normalize(r.name).includes(q) || normalize(r.cuisineType).includes(q);
    });
  }, [searchText]);

  async function toggleSaveExplore(recipe) {
    const sourceUrl = String(recipe?.sourceUrl || "").trim();
    if (!sourceUrl) return;

    try {
      setIsSavingExploreUrl(sourceUrl);
      const res = await API.post("/me/saved-explore/toggle", {
        sourceUrl,
        name: recipe?.name || "",
        imageUrl: recipe?.imageUrl || "",
      });

      const next = Array.isArray(res.data?.savedExploreRecipes) ? res.data.savedExploreRecipes : [];
      setSavedExplore(next);

      if (res.data?.saved) {
        navigate("/saved");
      }
    } catch (e) {
      setError("Failed to update saved recipes.");
    } finally {
      setIsSavingExploreUrl("");
    }
  }

  function scrollExploreBy(direction) {
    const el = exploreRowRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className={styles.homePage}>
      <header className={styles.homeTopBar}>
        <div className={styles.homeTopBarInner}>
          <div className={styles.homeHeaderTopRow}>
            <div className={styles.homeGreeting}>
              <div className={styles.homeHello}>{greeting}</div>
              <div className={styles.homePrompt}>What do you want to cook today?</div>
            </div>

            <Link className={styles.avatarLink} to="/profile" aria-label="Profile">
              <span className={styles.avatar} aria-hidden="true">
                {me?.profileImage ? (
                  <img className={styles.avatarImage} src={me.profileImage} alt="" loading="lazy" />
                ) : (
                  avatarLetter
                )}
              </span>
            </Link>
          </div>

          <div className={styles.homeHeaderSearchRow}>
            <input
              className={styles.homeSearch}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search recipes"
              aria-label="Search"
            />
          </div>
        </div>
      </header>

      <main className={styles.homeMain}>
        {isLoading ? <div className={styles.card}>Loading…</div> : null}
        {error ? <div className={`${styles.card} ${styles.errorCard}`}>{error}</div> : null}

        <section className={styles.homeSection}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>My recipes</h2>
            <button
              className={styles.textButton}
              type="button"
              onClick={() => navigate("/my-recipes")}
            >
              See all
            </button>
          </div>

          <div className={styles.homeCardGrid}>
            {myRecipes.map((r) => (
              <RecipeMiniCard key={r._id} recipe={r} />
            ))}
          </div>

          {!isLoading && !error && myRecipes.length === 0 ? (
            <div className={styles.card}>No recipes yet. Create your first one.</div>
          ) : null}
        </section>

        <section className={styles.homeSection}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Explore recipes</h2>
            <div className={styles.homeExploreHeaderRight}>
              <div className={styles.homeExploreArrows}>
                <button
                  className={styles.homeArrowButton}
                  type="button"
                  onClick={() => scrollExploreBy(-1)}
                  aria-label="Scroll explore left"
                >
                  ‹
                </button>
                <button
                  className={styles.homeArrowButton}
                  type="button"
                  onClick={() => scrollExploreBy(1)}
                  aria-label="Scroll explore right"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div ref={exploreRowRef} className={styles.homeExploreRow}>
            {exploreRecipes.map((r) => (
              <RecipeMiniCard
                key={r._id || r.sourceUrl || r.name}
                recipe={r}
                className={styles.homeExploreCard}
                isSaved={savedExploreUrls.has(String(r.sourceUrl || "").trim())}
                isSavingSave={isSavingExploreUrl === String(r.sourceUrl || "").trim()}
                onToggleSave={() => toggleSaveExplore(r)}
              />
            ))}
          </div>
        </section>

        <section className={styles.homeSection}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Types</h2>
          </div>

          <div className={styles.typeRow}>
            {FOOD_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={styles.typeItem}
                onClick={() => navigate(`/type/${encodeURIComponent(t.key)}`)}
              >
                <div className={styles.typeCircle} aria-hidden="true">
                  {t.imageUrl ? (
                    <img className={styles.typeCircleImage} src={t.imageUrl} alt="" loading="lazy" />
                  ) : (
                    t.label.slice(0, 1)
                  )}
                </div>
                <div className={styles.typeLabel}>{t.label}</div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
