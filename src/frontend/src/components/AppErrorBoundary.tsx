import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onClearSession?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AppErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearSessionAndReset = () => {
    console.log('AppErrorBoundary: Clearing session and resetting');
    if (this.props.onClearSession) {
      this.props.onClearSession();
    }
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Something went wrong</CardTitle>
                  <CardDescription>
                    The application encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription className="font-mono text-sm">
                  {this.state.error?.message || 'Unknown error'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={this.handleClearSessionAndReset}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Session & Retry
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
