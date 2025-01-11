import { ErrorInfo, Component as ReactComponent, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children?: ReactNode
  onError(error: Error, errorInfo: ErrorInfo): void
}

export interface ErrorBoundaryState {
  error: boolean
}

export class ErrorBoundary extends ReactComponent<ErrorBoundaryProps, ErrorBoundaryState> {

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { error: true }
  }

  readonly state: Readonly<ErrorBoundaryState> = { error: false }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render(): ReactNode {
    return this.state.error ? null : this.props.children
  }

}
