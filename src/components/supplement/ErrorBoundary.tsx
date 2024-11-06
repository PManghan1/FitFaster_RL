import React, { Component, ErrorInfo } from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { trackSupplementEvent, SupplementEvents } from '../../analytics/supplement-events';
import tw from '../../utils/tailwind';

interface Props {
  children: React.ReactNode;
  supplementId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SupplementErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error in analytics
    trackSupplementEvent(SupplementEvents.VIEW_DETAILS, {
      supplementId: this.props.supplementId,
      error: error.message,
    });

    // Log error to error reporting service
    console.error('Supplement Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-lg font-bold mb-2`}>Something went wrong</Text>
          <Text style={tw`text-gray-600 text-center mb-4`}>
            {this.state.error?.message || 'An error occurred while loading this content.'}
          </Text>
          <Button title="Try again" onPress={this.handleRetry} buttonStyle={tw`bg-blue-500`} />
        </View>
      );
    }

    return this.props.children;
  }
}
