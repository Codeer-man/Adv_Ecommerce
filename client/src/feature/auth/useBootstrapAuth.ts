import { useAuth } from "@clerk/react";
import { useAuthStore } from "./store";
import { useEffect } from "react";
import { meUser, syncUser } from "./api";
import { setApiTokenGetter } from "../../lib/api";

export function useBootStrapAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { clearAuth, setLoading, setUser, setError } = useAuthStore();

  useEffect(() => {
    setApiTokenGetter(async () => {
      const token = await getToken();
      return token ?? null;
    });
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      clearAuth();
      return;
    }

    async function run() {
      try {
        setLoading();
        await syncUser();

        const me = await meUser();

        setUser(me.user);
      } catch (error) {
        const errMessage =
          error instanceof Error ? error.message : "Something went wrong";
        setError(errMessage);
      }
    }

    void run();
  }, [isLoaded, isSignedIn, clearAuth, setUser, setError, setLoading]);
}
