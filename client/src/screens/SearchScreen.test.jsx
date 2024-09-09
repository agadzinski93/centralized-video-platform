import {setupServer} from 'msw/node';
import {render, screen, act, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {beforeAll, afterAll, afterEach, test, expect, vitest} from 'vitest';
import axe from 'axe-core'
import { Provider } from 'react-redux';
import store from '../redux/store.ts';
import SearchScreen from './SearchScreen.tsx';
import { BrowserRouter } from 'react-router-dom';
import { handlers } from '../../tests/handlers.js';
import { useState } from 'react';

const server = setupServer(...handlers);

beforeAll(()=>{
    server.listen({onUnhandledRequest: 'error'});
    const mockIntersectionObserver = vitest.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;

    vitest.mock('react-router-dom', async () => {
        const props =  await vitest.importActual('react-router-dom');
        return ({
            ...props,
            useSearchParams: () => {
                let mockParams = {q: "java"};
                const [params, setParams] = useState(new URLSearchParams(mockParams));
                return [
                    params,
                    (newParams) => {
                        mockParams = newParams;
                        setParams(new URLSearchParams(newParams));
                    }
                ];
            }
        })
    });
});
afterEach(()=>server.resetHandlers());
afterAll(()=>server.close());

test('Test Search Page Loaded Content', async () => {
    const {container} = await act(async () => render(<Provider store={store}><SearchScreen /></Provider>,{wrapper: BrowserRouter}));

    await waitFor(async ()=>{
        const results = await axe.run(container, {rules: {'color-contrast': {enabled: false}}});
        expect(results.incomplete.length).toBe(0);
        expect(results.violations.length).toBe(0);
        
        expect(screen.getByText('Java Basics - An Overview')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Variables in Java')).toBeInTheDocument();
        expect(screen.getByText('Identifiers in Java')).toBeInTheDocument();
    },
    {
        timeout: 1000
    }); 
});