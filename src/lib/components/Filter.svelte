<script lang="ts">
    let currentCounty = $state("");
    let searchQuery = $state("");
    let showFavoritesOnly = $state(false);
    let sortOption = $state("");
    let showMobileFilters = $state(false);

    let { counties } = $props();

    import { SelectedSearchQuery, selectedCounty, SelectedSortOption, SelectedFavorites } from "$lib/stores";

    function toggleMobileFilters() {
        showMobileFilters = !showMobileFilters;
    }


</script>

<div class="bg-white border-b border-gray-100 shadow-sm pb-4 sm:pb-[35px] mb-10 z-30">
    <div class="max-w-7xl mx-auto">
        <!-- Desktop filters -->
        <div class="hidden sm:flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center space-x-4 flex-1">
                <!-- Search input -->
                <div class="relative flex-1 max-w-md">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input
                            type="text"
                            placeholder="Search by name..."
                            bind:value={searchQuery}
                            oninput={(e:Event) => { SelectedSearchQuery.set(searchQuery); e.preventDefault(); e.stopPropagation(); }}
                            class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                    />
                </div>

                <!-- County filter -->
                <div class="w-48">
                    <select
                            bind:value={currentCounty}
                            onchange={(e:Event) => { selectedCounty.set(currentCounty); e.preventDefault(); e.stopPropagation();}}
                            class="block w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                    >
                        <option value="">Toate Judetele</option>
                        {#each counties as county}
                            <option value={county}>{county}</option>
                        {/each}
                    </select>
                </div>

                <!-- Favorites toggle -->
                <button
                        onclick={(e:Event) => { showFavoritesOnly = !showFavoritesOnly; SelectedFavorites.set(showFavoritesOnly); e.preventDefault(); e.stopPropagation(); }}
                        class={`flex cursor-pointer items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    showFavoritesOnly
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-50'
                    }`}
                >
                    <svg
                            class={`mr-1.5 h-4 w-4 ${showFavoritesOnly ? 'text-purple-700' : 'text-gray-400'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Favorites Only
                </button>
            </div>

            <!-- Sort options -->
            <div class="w-48">
                <select
                        bind:value={sortOption}
                        onchange={(e:Event) => { SelectedSortOption.set(sortOption); e.preventDefault(); e.stopPropagation(); }}
                        class="block w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                >
                    <option value="">Nicio Optiune</option>
                    <option value="name-asc">Nume (A-Z)</option>
                    <option value="name-desc">Nume (Z-A)</option>
                    <option value="county-asc">Judet (A-Z)</option>
                    <option value="county-desc">Judet (Z-A)</option>
                </select>
            </div>
        </div>

        <!-- Mobile filters -->
        <div class="sm:hidden">
            <!-- Mobile search and filter toggle -->
            <div class="px-4 py-3 flex items-center justify-between">
                <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input
                            type="text"
                            placeholder="Search by name..."
                            bind:value={searchQuery}
                            oninput={(e:Event) => { SelectedSearchQuery.set(searchQuery); e.preventDefault(); e.stopPropagation(); }}
                            class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                    />
                </div>

                <button
                        onclick={(e:Event) => {toggleMobileFilters(); e.preventDefault(); e.stopPropagation();}}
                        class="ml-3 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-expanded={showMobileFilters}
                >
                    <span class="sr-only">Filters</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>


            <!-- Mobile filters panel (collapsible) -->
            {#if showMobileFilters}
                <div class="px-4 py-3 border-t border-gray-200 space-y-4">
                    <!-- County filter -->
                    <div>
                        <label for="mobile-county" class="block text-sm font-medium text-gray-700 mb-1">Judet</label>
                        <select
                                id="mobile-county"
                                bind:value={currentCounty}
                                onchange={(e:Event) => { selectedCounty.set(currentCounty); e.preventDefault(); e.stopPropagation(); }}
                                class="block w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                        >
                            <option value="">Toate Judetele</option>
                            {#each counties as county}
                                <option value={county}>{county}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Sort options -->
                    <div>
                        <label for="mobile-sort" class="block text-sm font-medium text-gray-700 mb-1">Sortare</label>
                        <select
                                id="mobile-sort"
                                bind:value={sortOption}
                                onchange={(e:Event) => { SelectedSortOption.set(sortOption); e.preventDefault(); e.stopPropagation(); }}
                                class="block w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                        >
                            <option value="">Nicio Optiune</option>
                            <option value="name-asc">Nume (A-Z)</option>
                            <option value="name-desc">Nume (Z-A)</option>
                            <option value="county-asc">Judet (A-Z)</option>
                            <option value="county-desc">Judet (Z-A)</option>
                        </select>
                    </div>

                    <!-- Favorites toggle -->
                    <div>
                        <button
                                onclick={(e:Event) => { showFavoritesOnly = !showFavoritesOnly; SelectedFavorites.set(showFavoritesOnly); e.preventDefault(); e.stopPropagation(); }}
                                class={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            showFavoritesOnly
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <svg
                                    class={`mr-1.5 h-4 w-4 ${showFavoritesOnly ? 'text-purple-700' : 'text-gray-400'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Favorites Only
                        </button>
                    </div>

                    <!-- Apply filters button -->
                    <div class="pt-2">
                        <button
                                onclick={(e:Event) => {toggleMobileFilters(); e.preventDefault(); e.stopPropagation();}}
                                class="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>