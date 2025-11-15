/**
 * SensorChart Component Tests
 * Phase 157: UI component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import SensorChart from '../SensorChart';

describe('SensorChart', () => {
  const mockData = {
    datasets: [
      {
        data: [10, 20, 30, 40, 50],
        label: 'Sensor 1',
      },
    ],
    labels: ['1', '2', '3', '4', '5'],
  };

  it('renders line chart by default', () => {
    const { toJSON } = render(
      <SensorChart {...mockData} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <SensorChart
        {...mockData}
        title="Sensor Data"
      />
    );
    expect(getByText('Sensor Data')).toBeDefined();
  });

  it('renders different chart types', () => {
    const { rerender, toJSON } = render(
      <SensorChart {...mockData} type="line" />
    );
    expect(toJSON()).toBeTruthy();

    rerender(<SensorChart {...mockData} type="bar" />);
    expect(toJSON()).toBeTruthy();

    rerender(<SensorChart {...mockData} type="pie" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with legend', () => {
    const { toJSON } = render(
      <SensorChart
        {...mockData}
        showLegend={true}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders without legend', () => {
    const { toJSON } = render(
      <SensorChart
        {...mockData}
        showLegend={false}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('handles multiple datasets', () => {
    const multiDatasetProps = {
      datasets: [
        { data: [10, 20, 30], label: 'Sensor 1' },
        { data: [15, 25, 35], label: 'Sensor 2' },
      ],
      labels: ['1', '2', '3'],
    };

    const { toJSON } = render(
      <SensorChart {...multiDatasetProps} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(
      <SensorChart
        {...mockData}
        title="Test Chart"
        type="line"
        showLegend={true}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
