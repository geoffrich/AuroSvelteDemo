import { render, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import {
    querySelectorAllDeep,
    querySelectorDeep
} from 'query-selector-shadow-dom';

import App from '../src/App';

import '@alaskaairux/ods-button/dist/auro-button';
import '@alaskaairux/ods-inputoptions/dist/ods-inputoption';
import '@alaskaairux/ods-inputoptions/dist/ods-inputoption-checkbox-group';
import '@alaskaairux/ods-toast';

// custom render function that allows querying of elements within a custom element
async function renderWithCustomElements(ui, options) {
    // testing-library uses querySelectorAll to find elements
    // Replace it with a function that will find elements in shadow roots
    document.body.querySelectorAll = querySelectorAllDeep;
    document.body.querySelector = querySelectorDeep;

    const renderResult = await render(ui, options);
    replaceSlotsWithContents();
    return renderResult;
}

function replaceSlotsWithContents() {
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
    // not sure why I need to await
    // does react have this problem?
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