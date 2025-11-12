/**
 * App component tests
 */

import React from 'react';
import {render} from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('should render without crashing', () => {
    const {root} = render(<App />);
    expect(root).toBeTruthy();
  });

  it('should render app title', () => {
    const {getByText} = render(<App />);
    expect(getByText('KooDTX')).toBeTruthy();
  });

  it('should render subtitle', () => {
    const {getByText} = render(<App />);
    expect(getByText('Local-First Sensor Data Collection App')).toBeTruthy();
  });
});
