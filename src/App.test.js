import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Explore recipes section', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /explore recipes/i })).toBeInTheDocument();
});
