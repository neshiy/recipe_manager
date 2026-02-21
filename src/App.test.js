import { render, screen } from '@testing-library/react';
import App from './App';

test('renders recipes heading', () => {
  render(<App />);
  const heading = screen.getByText(/recipes/i);
  expect(heading).toBeInTheDocument();
});
