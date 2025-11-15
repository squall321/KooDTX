/**
 * ErrorMessage Component Tests
 * Phase 157: UI component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    const { getByText } = render(
      <ErrorMessage message="Something went wrong" />
    );
    expect(getByText('Something went wrong')).toBeDefined();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <ErrorMessage
        title="Error"
        message="Something went wrong"
      />
    );
    expect(getByText('Error')).toBeDefined();
    expect(getByText('Something went wrong')).toBeDefined();
  });

  it('renders different error types', () => {
    const { rerender, toJSON } = render(
      <ErrorMessage type="error" message="Error message" />
    );
    expect(toJSON()).toBeTruthy();

    rerender(<ErrorMessage type="warning" message="Warning message" />);
    expect(toJSON()).toBeTruthy();

    rerender(<ErrorMessage type="info" message="Info message" />);
    expect(toJSON()).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorMessage
        message="Error"
        showRetry={true}
        onRetry={onRetry}
      />
    );

    const retryButton = getByText('다시 시도');
    fireEvent.press(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ErrorMessage
        message="Error"
        showClose={true}
        onClose={onClose}
      />
    );

    // Assuming close button has testID
    const closeButton = getByTestId('close-button');
    if (closeButton) {
      fireEvent.press(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render when visible is false', () => {
    const { toJSON } = render(
      <ErrorMessage message="Error" visible={false} />
    );
    expect(toJSON()).toBeNull();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <ErrorMessage
        type="error"
        title="Error"
        message="Something went wrong"
        showRetry={true}
        showClose={true}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
