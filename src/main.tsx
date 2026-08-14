import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add or remove dark mode class based on store on load
const storageStr = localStorage.getItem('rehab-flashcards-storage');
if (storageStr) {
  try {
    const data = JSON.parse(storageStr);
    if (data.state?.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Error parsing dark mode state on load', e);
  }
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Something went wrong.</h1>
          <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
