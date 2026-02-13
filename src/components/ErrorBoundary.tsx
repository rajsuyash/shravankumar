import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 border border-[#e7dfda] max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
            </div>
            <h1 className="text-2xl font-bold text-[#181410] mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Please try reloading the page.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 p-3 rounded-lg break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
