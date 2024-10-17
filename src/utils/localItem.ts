export function GetItemFromLocal<T = any>(key: string): T {
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) as string) : {};
}

export function SetItemToLocal(key: string, newValue: any) {
    localStorage.setItem(key, JSON.stringify(newValue));
}

export function GetLocationIdsFromLocal(key: string): string[] {
    if (key == 'selectedProvinces' || key == 'selectedProvinces-edit') {
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) as string) : [];
    }
    const selectedLocations = GetItemFromLocal<{[key: string]: {
        isOpen: boolean,
        selected: string[]
    }}>(key);
    return Object.keys(selectedLocations).length > 0 ? Object.keys(selectedLocations).map(key => selectedLocations[key].selected?.flat()).flat() : [];
}