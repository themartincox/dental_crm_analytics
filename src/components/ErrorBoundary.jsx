import React from "react";
import Icon from "./AppIcon";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase();
    this.setState({ errorId: id });
    window.__COMPONENT_ERROR__?.(error, { ...errorInfo, errorId: id });
  }
  render() {
    if (!this.state.hasError) return this.props?.children;
    return (
      <div role="alert" aria-live="assertive" className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 max-w-md">
          <div className="flex justify-center items-center mb-2">
            <Icon name="AlertTriangle" size={42} color="#b91c1c" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Something went wrong</h1>
          <p className="text-neutral-600">Please try again. If the problem persists, share this code with support:</p>
          {this.state.errorId && (
            <div className="mt-3 inline-flex items-center gap-2 border rounded px-2 py-1 text-sm">
              <code>{this.state.errorId}</code>
              <button aria-label="Copy error code" onClick={() => navigator.clipboard.writeText(this.state.errorId)} className="underline">Copy</button>
            </div>
          )}
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Reload</button>
            <button onClick={() => this.setState({ hasError: false })} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Try Again</button>
            {this.props.onReport && (
              <button onClick={() => this.props.onReport(this.state.errorId)} className="bg-white border px-4 py-2 rounded">Report issue</button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
