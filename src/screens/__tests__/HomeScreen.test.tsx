/**
 * HomeScreen component tests
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import {PaperProvider} from 'react-native-paper';

import {HomeScreen} from '../HomeScreen';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('HomeScreen', () => {
  it('should render without crashing', () => {
    const {root} = renderWithProvider(<HomeScreen />);
    expect(root).toBeTruthy();
  });

  it('should render app title', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('KooDTX')).toBeTruthy();
  });

  it('should render subtitle', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Local-First Sensor Data Collection App')).toBeTruthy();
  });

  it('should render Welcome card', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Welcome')).toBeTruthy();
    expect(getByText('React Native Paper Demo')).toBeTruthy();
  });

  it('should render text input', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Text Input')).toBeTruthy();
  });

  it('should render buttons section', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Buttons')).toBeTruthy();
    expect(getByText('Contained')).toBeTruthy();
    expect(getByText('Outlined')).toBeTruthy();
    expect(getByText('Text Button')).toBeTruthy();
  });

  it('should render chips section', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Chips')).toBeTruthy();
    expect(getByText('Info')).toBeTruthy();
    expect(getByText('Success')).toBeTruthy();
    expect(getByText('Warning')).toBeTruthy();
  });

  it('should render features card', () => {
    const {getByText} = renderWithProvider(<HomeScreen />);
    expect(getByText('Features')).toBeTruthy();
    expect(getByText('Coming Soon')).toBeTruthy();
    expect(getByText('• Sensor Data Collection')).toBeTruthy();
    expect(getByText('• Local Database (WatermelonDB)')).toBeTruthy();
    expect(getByText('• Data Synchronization')).toBeTruthy();
  });
});
