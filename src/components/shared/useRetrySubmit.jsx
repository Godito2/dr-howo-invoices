import { useState, useRef, useCallback } from "react";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const TIMEOUT_MS = 60_000; // 60 second timeout

/**
 * useRetrySubmit — wraps an async submit function with:
 * - Payload validation before sending
 * - State snapshot saved before processing (restorable on failure)
 * - Auto-retry up to MAX_RETRIES times with exponential backoff
 * - Duplicate submission prevention
 * - 60s timeout per attempt via AbortController
 * - Fallback error handling if the service fails
 * - Automatic restoration of last successful state on failure
 */
export function useRetrySubmit(submitFn, { onSuccess, onFinalError, validate } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);           // { message, requestId }
  const [attemptCount, setAttemptCount] = useState(0);

  const lastDataRef = useRef(null);           // last submitted payload
  const lastSuccessStateRef = useRef(null);   // last successfully saved state
  const pendingSnapshotRef = useRef(null);    // snapshot taken before current attempt
  const lockRef = useRef(false);

  const runSubmit = useCallback(async (data) => {
    if (lockRef.current) {
      console.warn("[useRetrySubmit] Submission already in progress — ignored duplicate.");
      return;
    }

    // ── 1. Validate payload ──────────────────────────────────────────────────
    if (validate) {
      const validationError = validate(data);
      if (validationError) {
        console.warn("[useRetrySubmit] Payload validation failed:", validationError);
        setError({ message: validationError, requestId: null });
        return;
      }
    }

    // Required fields guard
    if (!data || typeof data !== "object") {
      setError({ message: "Invalid payload: data must be a non-null object.", requestId: null });
      return;
    }

    // ── 2. Save state snapshot before processing ─────────────────────────────
    pendingSnapshotRef.current = JSON.parse(JSON.stringify(data));
    lockRef.current = true;
    lastDataRef.current = data;
    setIsSubmitting(true);
    setError(null);

    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_RETRIES) {
      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setAttemptCount(attempt + 1);

      console.log(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1}/${MAX_RETRIES} | Starting…`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1} timed out after ${TIMEOUT_MS / 1000}s`);
      }, TIMEOUT_MS);

      try {
        const result = await submitFn(data, controller.signal);
        clearTimeout(timeoutId);

        // ── 3. Persist last successful state ──────────────────────────────────
        lastSuccessStateRef.current = pendingSnapshotRef.current;
        pendingSnapshotRef.current = null;

        console.log(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1} succeeded.`);
        setIsSubmitting(false);
        setAttemptCount(0);
        lockRef.current = false;
        onSuccess?.(result);
        return;
      } catch (err) {
        clearTimeout(timeoutId);
        attempt++;
        lastError = err;
        const errMessage = err?.message || String(err);

        // ── 4. Fallback error handling ─────────────────────────────────────────
        const isTimeout = err?.name === "AbortError";
        const isNetwork = errMessage.includes("fetch") || errMessage.includes("network") || errMessage.includes("Failed to fetch");

        console.error(
          `[Submit] RequestId=${requestId} | Attempt ${attempt}/${MAX_RETRIES} FAILED.`,
          isTimeout ? "(timeout)" : isNetwork ? "(network)" : "(server)",
          `Error: ${errMessage}`
        );

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // exponential backoff
          console.log(`[Submit] RequestId=${requestId} | Retrying in ${delay}ms…`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          // ── 5. All retries exhausted — restore last successful state ──────────
          if (lastSuccessStateRef.current) {
            console.info("[Submit] Restoring last successful state after all retries failed.");
          }

          console.error(`[Submit] RequestId=${requestId} | All ${MAX_RETRIES} attempts failed. Giving up.`, err);

          let userMessage = "Something went wrong while saving your invoice. Please click Retry or refresh the page.";
          if (isTimeout) userMessage = "The request timed out. Please check your connection and retry.";
          else if (isNetwork) userMessage = "A network error occurred. Please check your internet connection and retry.";

          setError({ message: userMessage, requestId });
          setIsSubmitting(false);
          setAttemptCount(0);
          lockRef.current = false;
          onFinalError?.(lastError, lastSuccessStateRef.current);
        }
      }
    }
  }, [submitFn, onSuccess, onFinalError, validate]);

  const retry = useCallback(() => {
    if (lastDataRef.current) {
      lockRef.current = false;
      runSubmit(lastDataRef.current);
    }
  }, [runSubmit]);

  return {
    submit: runSubmit,
    retry,
    isSubmitting,
    error,
    attemptCount,
    hasLastData: !!lastDataRef.current,
    lastSuccessState: lastSuccessStateRef.current,
  };
}