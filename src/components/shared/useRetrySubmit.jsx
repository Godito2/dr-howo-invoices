import { useState, useRef, useCallback } from "react";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * useRetrySubmit — wraps an async submit function with:
 * - Auto-retry up to MAX_RETRIES times with incremental backoff
 * - Duplicate submission prevention
 * - Preserved last submitted data for manual retry
 * - Request ID generation for debug logging
 * - 30s timeout per attempt via AbortController
 * - User-friendly error messages
 */
export function useRetrySubmit(submitFn, { onSuccess, onFinalError } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);       // { message, requestId }
  const [attemptCount, setAttemptCount] = useState(0);
  const lastDataRef = useRef(null);
  const lockRef = useRef(false);

  const runSubmit = useCallback(async (data) => {
    if (lockRef.current) {
      console.warn("[useRetrySubmit] Submission already in progress — ignored duplicate.");
      return;
    }

    lockRef.current = true;
    lastDataRef.current = data;
    setIsSubmitting(true);
    setError(null);

    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setAttemptCount(attempt + 1);

      console.log(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1}/${MAX_RETRIES} | Starting…`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1} timed out after 30s`);
      }, 30_000);

      try {
        const result = await submitFn(data, controller.signal);
        clearTimeout(timeoutId);
        console.log(`[Submit] RequestId=${requestId} | Attempt ${attempt + 1} succeeded.`);
        setIsSubmitting(false);
        setAttemptCount(0);
        lockRef.current = false;
        onSuccess?.(result);
        return;
      } catch (err) {
        clearTimeout(timeoutId);
        attempt++;
        const errMessage = err?.message || String(err);
        console.error(
          `[Submit] RequestId=${requestId} | Attempt ${attempt}/${MAX_RETRIES} FAILED.`,
          `Error: ${errMessage}`,
          err
        );

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * attempt;
          console.log(`[Submit] RequestId=${requestId} | Retrying in ${delay}ms…`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          // All retries exhausted
          const finalRequestId = requestId;
          console.error(
            `[Submit] RequestId=${finalRequestId} | All ${MAX_RETRIES} attempts failed. Giving up.`,
            err
          );
          setError({
            message:
              "Something went wrong while processing your request. Please click Retry or refresh the page.",
            requestId: finalRequestId,
          });
          setIsSubmitting(false);
          setAttemptCount(0);
          lockRef.current = false;
          onFinalError?.(err);
        }
      }
    }
  }, [submitFn, onSuccess, onFinalError]);

  const retry = useCallback(() => {
    if (lastDataRef.current) {
      lockRef.current = false; // release lock so retry is allowed
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
  };
}