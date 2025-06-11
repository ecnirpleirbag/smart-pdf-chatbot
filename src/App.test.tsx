import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders PDF ChatBot title', () => {
    render(<App />);
    const titleElement = screen.getByText(/PDF ChatBot/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders upload section', () => {
    render(<App />);
    const uploadText = screen.getByText(/Upload Your PDF/i);
    expect(uploadText).toBeInTheDocument();
  });

  test('renders connection status', () => {
    render(<App />);
    const connectionStatus = screen.getByText(/Connected|Disconnected/i);
    expect(connectionStatus).toBeInTheDocument();
  });
}); 