import {render, screen } from '@testing-library/react';
import {userEvent} from '@testing-library/user-event'
import '@testing-library/jest-dom';
import {test, expect} from 'vitest';
import axe from 'axe-core'
import { Provider } from 'react-redux';
import store from '../redux/store.ts';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../routes/routes.tsx';

test('Testing Health Screen', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes,{initialEntries: ['/health'], initialIndex: 1});
   
    const {container} = render(<Provider store={store}><RouterProvider router={router} /></Provider>);
    expect(screen.getByText('Test Flash Messages')).toBeInTheDocument();
    
    const results = await axe.run(container, {rules: {'color-contrast': {enabled: false}}});
    expect(results.incomplete.length).toBe(0);
    expect(results.violations.length).toBe(0);

    let div = document.querySelector('.message-success');
    expect(div).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Test Flash Messages'}));
    expect(screen.getByText('This is a test of a successful message. Congrats!')).toBeInTheDocument();
});