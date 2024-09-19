import { render, screen } from '@testing-library/react';
import { expect, describe, it } from 'vitest';
import React from 'react';

import AuthorImage from '../../js/templates/AuthorImage';

describe('AuthorImage Component', () => {
  it('renders with the provided URL', () => {
    render(<AuthorImage url="https://example.com/12345" />);
    
    const imageLink = screen.getByRole('link', { name: /author image/i });
    expect(imageLink).toHaveAttribute('href', 'https://example.com/12345');
    
    const imageDiv = screen.getByRole('img');
    expect(imageDiv).toHaveStyle('background-image: url(https://example.com/12345)');
  });

  it('renders with the default image if no URL is provided', () => {
    render(<AuthorImage />); // No URL passed

    const imageLink = screen.getByRole('link', { name: /author image/i });
    expect(imageLink).toHaveAttribute('href', expect.stringContaining('author_default.png'));

    const imageDiv = screen.getByRole('img');
    expect(imageDiv).toHaveStyle('background-image: url(/vis/images/author_default.png)'); // Adjust the path if needed
  });
});