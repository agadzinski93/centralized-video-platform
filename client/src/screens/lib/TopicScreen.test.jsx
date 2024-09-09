import {setupServer} from 'msw/node';
import {render, screen, act, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {beforeAll, afterAll, afterEach, test, expect, vitest} from 'vitest';
import axe from 'axe-core'
import { Provider } from 'react-redux';
import store from '../../redux/store.ts';
import TopicScreen from './TopicScreen.tsx';
import { BrowserRouter } from 'react-router-dom';
import { handlers } from '../../../tests/handlers.js';

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
            useParams: () => {
                let mockParams = {topic: "Java-Programming"};
                return mockParams;
            }
        })
    });
});
afterEach(()=>server.resetHandlers());
afterAll(()=>server.close());

test('Test Topic Page Loaded Content', async () => {
    const {preloadedContainer} = render(<Provider store={store}><TopicScreen /></Provider>,{wrapper: BrowserRouter});
    let loader = document.querySelector('.loading-topic-page-container');
    expect(loader).toBeInTheDocument();
    
    const {container} = await act(async () => render(preloadedContainer));

    await waitFor(async ()=>{
        const results = await axe.run(container, {rules: {'color-contrast': {enabled: false}}});
        expect(results.incomplete.length).toBe(0);
        expect(results.violations.length).toBe(0);

        loader = document.querySelector('.loading-topic-page-container');
        expect(loader).not.toBeInTheDocument();

        //Topic Info
        expect(screen.getByText('Java Programming')).toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        
        //Sample Video Titles in Playlist
        expect(screen.getByText('Java Basics - An Overview')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Variables in Java')).toBeInTheDocument();
        expect(screen.getByText('Identifiers in Java')).toBeInTheDocument();
    },
    {
        timeout: 1000
    }); 
});