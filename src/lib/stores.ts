import {writable,type Writable } from "svelte/store";

export const SelectedSearchQuery = writable("");
export const selectedCounty = writable("");
export const SelectedSortOption = writable("");
export const SelectedFavorites:Writable<boolean> = writable();
export const FavoritesList = writable<any[]>([]);
export const AddedToFav:Writable<boolean> = writable(false);
export const RemovedFromFav:Writable<boolean> = writable(false);
export const isNotLoggedIn:Writable<boolean> = writable(false);