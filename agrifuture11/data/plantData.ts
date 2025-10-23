
// Simple SVG thumbnails as data URIs. In a real app, these would be proper images.
const leafGeneric = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE2YTMyMSI+PHBhdGggZD0iTTEyIDE4YTYgNiAwIDAwNi02YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2YzAgMy4zMTQgMi42ODYgNiA2IDZ6TTExIDEyYTEgMSAwIDEwMiAwIDEgMSAwIDAwLTIgMHptMSA0YTMgMyAwIDEwMC02IDMgMyAwIDAwMCA2eiIvPjwvc3ZnPg==';
const leafHeart = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE2YTMyMSI+PHBhdGggZD0iTTEyIDIwLjI1bDgtOC4yNUE1LjUgNS41IDAgMDAtMTQuMjUgNEExMS45MiAxMS45MiAwIDAwMTIgNS4xIDEwLjQ3IDEwLjQ3IDAgMDAtMy43NSA0IDUuNSA1LjUgMCAwMC43NSAxMS45bDggOC4yNUwxMiAyMC4yNXoiLz48L3N2Zz4=';
const leafLobed = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE2YTMyMSI+PHBhdGggZD0iTTE5IDEyYTEgMSAwIDAwLTEtMWgtNGEyIDIgMCAwMS0yLTJWOUEzIDMgMCAwMDIgNnY5YTMgMyAwIDAwMyAzaDhhMiAyIDAgMDEyLTJ2LTNoMWExIDEgMCAwMDEgMXoiLz48L3N2Zz4=';

export const PLANT_DATA = [
    { id: 1, name: 'Tulsi (Holy Basil)', thumbnail: leafGeneric },
    { id: 2, name: 'Neem', thumbnail: leafLobed },
    { id: 3, name: 'Rose', thumbnail: leafGeneric },
    { id: 4, name: 'Mango', thumbnail: leafGeneric },
    { id: 5, name: 'Banyan', thumbnail: leafHeart },
    { id: 6, name: 'Peepal', thumbnail: leafHeart },
    { id: 7, name: 'Marigold', thumbnail: leafLobed },
    { id: 8, name: 'Hibiscus', thumbnail: leafGeneric },
    { id: 9, name: 'Tomato', thumbnail: leafLobed },
    { id: 10, name: 'Chilli', thumbnail: leafGeneric },
    { id: 11, name: 'Brinjal (Eggplant)', thumbnail: leafGeneric },
    { id: 12, name: 'Okra (Ladyfinger)', thumbnail: leafLobed },
    { id: 13, name: 'Cotton', thumbnail: leafLobed },
    { id: 14, name: 'Wheat', thumbnail: leafGeneric },
    { id: 15, name: 'Rice (Paddy)', thumbnail: leafGeneric },
    { id: 16, name: 'Sugarcane', thumbnail: leafGeneric },
    { id: 17, name: 'Aprajita (Butterfly Pea)', thumbnail: leafGeneric },
    { id: 18, name: 'Parijaat (Night Jasmine)', thumbnail: leafHeart },
];

export const FARMING_TOPIC_KEYS: { key: string; value: string }[] = [
    { key: 'topicHydroponics', value: "Hydroponics" },
    { key: 'topicVerticalFarming', value: "Vertical Farming" },
    { key: 'topicPrecisionAgriculture', value: "Precision Agriculture" },
    { key: 'topicAgroforestry', value: "Agroforestry" },
    { key: 'topicZBNF', value: "Zero Budget Natural Farming" },
    { key: 'topicDripIrrigation', value: "Drip Irrigation" },
    { key: 'topicIPM', value: "Integrated Pest Management" },
    { key: 'topicSoilHealth', value: "Soil Health Management" },
];
