import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '../ui/Button';

describe('Button Component', () => {
  it('renders button with correct text', () => {
    render(<Button>Test Button</Button>);
    expect(screen?.getByRole('button'))?.toHaveTextContent('Test Button');
  });

  it('handles click events', () => {
    const handleClick = vi?.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen?.getByRole('button');
    button?.click();
    
    expect(handleClick)?.toHaveBeenCalledTimes(1);
  });
});