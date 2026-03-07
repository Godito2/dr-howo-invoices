import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[ErrorBoundary] Component: ${this.props.name || "Unknown"}\n`,
      `Error: ${error?.message}\n`,
      `Stack: ${errorInfo?.componentStack}`
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 font-bold text-sm">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800 text-sm">
                {this.props.name ? `Error in "${this.props.name}"` : "Component Error"}
              </h3>
              <p className="text-red-700 text-sm mt-1 break-words">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-3">
                  <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                    View stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              <button
                onClick={this.handleReset}
                className="mt-3 px-3 py-1.5 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}