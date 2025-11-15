/**
 * Dialog Component Tests
 * Phase 157: UI component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Dialog from '../Dialog';

describe('Dialog', () => {
  it('renders dialog when visible', () => {
    const { getByText } = render(
      <Dialog
        visible={true}
        title="Test Dialog"
        message="This is a test message"
      />
    );
    expect(getByText('Test Dialog')).toBeDefined();
    expect(getByText('This is a test message')).toBeDefined();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <Dialog
        visible={false}
        title="Test Dialog"
        message="This is a test message"
      />
    );
    expect(queryByText('Test Dialog')).toBeNull();
  });

  it('renders with custom buttons', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <Dialog
        visible={true}
        title="Confirm"
        message="Are you sure?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: onCancel },
          { text: 'Confirm', style: 'default', onPress: onConfirm },
        ]}
      />
    );

    expect(getByText('Cancel')).toBeDefined();
    expect(getByText('Confirm')).toBeDefined();
  });

  it('calls button onPress handlers', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Dialog
        visible={true}
        title="Test"
        message="Test message"
        buttons={[
          { text: 'OK', onPress },
        ]}
      />
    );

    const button = getByText('OK');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    const { toJSON } = render(
      <Dialog
        visible={true}
        title="Success"
        message="Operation completed"
        icon="checkmark-circle"
        iconColor="#34C759"
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <Dialog
        visible={true}
        title="Test Dialog"
        message="This is a test"
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', style: 'default' },
        ]}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
