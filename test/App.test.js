import { render, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import {
    querySelectorAllDeep,
    querySelectorDeep
} from 'query-selector-shadow-dom';

import App from '../src/App';
import { wcEnum } from '../src/wcHelper';


describe('tests without querying the shadow DOM', () => {
    // these tests use the default render method exported by testing-library
    // you have to query custom elements by text (if in a slot) or test-id 
    // and interact with the element's API directly
    // sometimes you will have to use querySelector on the container directly

    beforeAll(() => {
        window.WebComponents = { ready: true };
    })

    test('buttons and toast', async () => {
        const { container } = render(App, { toastDuration: 50 });

        // we can get the button element by the text in the slot
        // we can't use getByRole('button') because the actual button element is in the shadow DOM
        const toastButton = screen.getByText('Toast');
        await fireEvent.click(toastButton);

        // we can't easily add a testid to the toast and there is no text in a slot to query
        // so we have to query the container directly
        const toast1 = container.querySelector('ods-toast');
        expect(toast1.title).toBe('message 1');
        await waitForElementToBeRemoved(() => container.querySelector('ods-toast'));

        const changeButton = screen.getByText('Change Toaster');
        await fireEvent.click(changeButton);
        await fireEvent.click(toastButton);
        const toast2 = container.querySelector('ods-toast');
        expect(toast2.title).toBe('message 2');
    });

    test('checkboxes', async () => {
        // not sure why I have to await when I need WC implementations
        // does React have this issue?
        await render(App);

        const input = screen.getByTestId('cbx1');
        expect(input).not.toHaveAttribute('checked');

        input.checked = true;
        await fireEvent.input(input);

        const group = screen.getByTestId('cbxgroup');
        expect(group.label).toBe('Your Choice: ["yes"]');
        expect(input).toHaveAttribute('checked');
    });
})

describe('tests querying the shadow DOM (experimental)', () => { 
    // these tests use a custom render function that allows querying of shadow DOM elements

    async function renderWithCustomElements(ui, options) {
        // testing-library uses querySelectorAll to find elements
        // Replace it with a function that will find elements in shadow roots
        document.body.querySelectorAll = querySelectorAllDeep;
        document.body.querySelector = querySelectorDeep;
        window.WebComponents = { ready: true };

        const renderResult = render(ui, options);
        
        const elementsOnPage = getCustomElementsOnPage();
        await waitForElementsToBeDefined(elementsOnPage);
        await replaceSlotsWithContents();
        return renderResult;
    }

    function getCustomElementsOnPage() {
        // ideally we could use document.querySelectorAll(:not(:defined)) here
        // but the :defined selector is not currently supported in jsdom
        const elementNames = Object.values(wcEnum).join(', ');
        return Array.from(
            document.querySelectorAll(elementNames)
        ).map(node => node.localName);
    }

    async function waitForElementsToBeDefined(elementNames) {
        let promises = elementNames.map(elementName => {
            return customElements.whenDefined(elementName);
        });

        await Promise.all(promises);
    }

    async function replaceSlotsWithContents() {
        // testing-library does not treat text within a slot as the name of a button
        // replace all slots with their linked text node
        const slots = querySelectorAllDeep('slot');
        slots.forEach((slot) => {
            const slotContents = slot.assignedNodes()[0];
            if (slotContents) {
                slot.parentElement.replaceChild(slotContents, slot);
            }
        });
    }

    test('buttons and toast', async () => {
        await renderWithCustomElements(App, { toastDuration: 50 });

        const toastButton = screen.getByRole('button', { name: 'Toast' });
        await fireEvent.click(toastButton);
        const toast = screen.getByText('message 1');
        // toBeInTheDocument does not work for child of custom elements
        // because element.ownerDocument.contains(element) is false
        // Use toBeVisible instead
        expect(toast).toBeVisible();
        await waitForElementToBeRemoved(() => screen.queryByText('message 1'));

        const changeButton = screen.getByRole('button', { name: 'Change Toaster'});
        await fireEvent.click(changeButton);
        await fireEvent.click(toastButton);
        expect(screen.getByText('message 2')).toBeVisible();
    });

    test('checkboxes', async () => {
        await renderWithCustomElements(App);

        const input = screen.getByLabelText('Yes');
        expect(input).not.toBeChecked();

        await fireEvent.click(input);
        await fireEvent.input(input);
        expect(input).toBeChecked();
        expect(screen.getByText('Your Choice: ["yes"]')).toBeVisible();
    });
});