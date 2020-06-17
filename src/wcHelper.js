export function loadWebComponents(wcArr) {
    if (window.WebComponents && window.WebComponents.ready) {
        importComponents(wcArr);
    } else {
        window.addEventListener('WebComponentsReady', () =>
            importComponents(wcArr)
        );
    }
}

function importComponents(wcArr) {
    wcArr.forEach(async function (wc) {
        if (wc === wcEnum.auroButton) {
            await import('@alaskaairux/ods-button/dist/auro-button');
        } else if (wc === wcEnum.odsCheckboxGroup) {
            await import('@alaskaairux/ods-inputoptions/dist/ods-inputoption-checkbox-group');
        } else if (wc === wcEnum.odsInputOption) {
            await import('@alaskaairux/ods-inputoptions/dist/ods-inputoption');
        } else if (wc === wcEnum.odsToast) {
            await import('@alaskaairux/ods-toast');
        }
    });
}

export const wcEnum = {
    auroButton: 'auro-button',
    odsCheckboxGroup: 'ods-inputoption-checkbox-group',
    odsInputOption: 'ods-inputoption',
    odsToast: 'ods-toast'
};
