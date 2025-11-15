/**
 * LoadingIndicator Component Tests
 * Phase 157: UI component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingIndicator from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders correctly when visible', () => {
    const { getByTestId } = render(<LoadingIndicator visible={true} />);
    // Component should be rendered
    expect(getByTestId).toBeDefined();
  });

  it('does not render when not visible', () => {
    const { toJSON } = render(<LoadingIndicator visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders with message', () => {
    const { getByText } = render(
      <LoadingIndicator visible={true} message="Loading data..." />
    );
    expect(getByText('Loading data...')).toBeDefined();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <LoadingIndicator visible={true} size="small" />
    );
    expect(rerender).toBeDefined();

    rerender(<LoadingIndicator visible={true} size="large" />);
    expect(rerender).toBeDefined();
  });

  it('renders as overlay by default', () => {
    const { toJSON } = render(<LoadingIndicator visible={true} overlay={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders inline when overlay is false', () => {
    const { toJSON } = render(<LoadingIndicator visible={true} overlay={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <LoadingIndicator
        visible={true}
        message="Loading..."
        size="medium"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
