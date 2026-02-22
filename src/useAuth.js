import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "./firebaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setUser(null);
      setIsLoading(false);
      return () => {};
    }

    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u || null);
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  return { user, isLoading };
}
