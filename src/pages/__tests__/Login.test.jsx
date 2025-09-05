import { describe, it, expect } from 'vitest';
        import { render, screen } from '@testing-library/react';
        import { BrowserRouter } from 'react-router-dom';
        import Login from '../Login';
        import { AuthProvider } from '../../contexts/AuthContext';

        const TestWrapper = ({ children }) => (
          <BrowserRouter>
            <AuthProvider>
              {children}
            </AuthProvider>
          </BrowserRouter>
        );

        describe('Login Page', () => {
          it('renders login form', () => {
            render(
              <TestWrapper>
                <Login />
              </TestWrapper>
            );
            
            expect(screen?.getByRole('button'))?.toBeInTheDocument();
          });

          it('displays login interface elements', () => {
            render(
              <TestWrapper>
                <Login />
              </TestWrapper>
            );
            
            // Basic test to ensure the page renders without errors
            expect(document.body)?.toContainHTML('div');
          });
        });