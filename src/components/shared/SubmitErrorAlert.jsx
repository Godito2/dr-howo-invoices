import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function SubmitErrorAlert({ error, onRetry, isRetrying, attemptCount }) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-2 mt-1">
        <span>{error.message}</span>
        {error.requestId && (
          <span className="text-xs opacity-70 font-mono">Request ID: {error.requestId}</span>
        )}
        <div className="flex items-center gap-3 mt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-red-400 text-red-700 hover:bg-red-50 h-8"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RotateCcw className={`w-3 h-3 mr-1.5 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? `Retrying (${attemptCount}/3)…` : "Retry"}
          </Button>
          <span className="text-xs opacity-60">or refresh the page</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}