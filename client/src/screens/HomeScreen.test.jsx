import {setupServer} from 'msw/node';
import {render, screen, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {beforeAll, afterAll, afterEach, test, expect} from 'vitest';
import axe from 'axe-core'
import { Provider } from 'react-redux';
import store from '../redux/store.ts';

import HomeScreen from './HomeScreen.tsx';
import { BrowserRouter } from 'react-router-dom';
import { handlers } from '../../tests/handlers.js';

const server = setupServer(...handlers);

beforeAll(()=>server.listen());
afterEach(()=>server.resetHandlers());
afterAll(()=>server.close());

test('Test Home Page Loaded Content', async () => {
    const {preloadedContainer} = render(<Provider store={store}><HomeScreen /></Provider>,{wrapper: BrowserRouter});
    let loader = document.querySelector('.home-page-loading-container');
    expect(loader).toBeInTheDocument();

    const {container} = await act(async () => render(preloadedContainer));
    const results = await axe.run(container, {rules: {'color-contrast': {enabled: false}}});
    expect(results.incomplete.length).toBe(0);
    expect(results.violations.length).toBe(0);

    loader = document.querySelector('.home-page-loading-container');
    expect(loader).not.toBeInTheDocument();

    expect(screen.getByText('How LEDs Work - Unravel the Mysteries of How LEDs Work!')).toBeInTheDocument()
    expect(screen.getByText('Single Phase Electricity Explained - wiring diagram energy meter')).toBeInTheDocument();
    expect(screen.getByText('Halo Full OST')).toBeInTheDocument();
});