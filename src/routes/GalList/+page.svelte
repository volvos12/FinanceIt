<script lang="ts">
    import Card from "$lib/components/card.svelte";
    import NotificationComponent from "$lib/components/NotificationComponent.svelte";
    import { pb, currentUser } from "$lib/pocketbase";
    import { onMount } from "svelte";
    import Filter from "$lib/components/Filter.svelte";
    import {
        AddedToFav, // To show added notification
        RemovedFromFav, //To show removed notif
        SelectedSearchQuery, // Ce a scris in casuta <string>
        selectedCounty, // Ce a selectat la Judet <string>
        SelectedSortOption, // Ce a ales ca metoda de sortare <string>
        SelectedFavorites, // Daca e pornit sau oprit ala de favorite <bool>
        FavoritesList, // Lista cu elementele favorite <string[]>
        isNotLoggedIn // In cazul in care adauga la favorite fara sa fie logati
    } from "$lib/stores";

    const Judete = [
        "Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita Nasaud", "Botosani", "Braila", "Brasov",
            "Buzau", "Calarasi", "Caras Severin", "Cluj", "Covasna", "Constanta", "Dambovita",
        "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomita", "Iasi", "Ilfov",
        "Maramures", "Mehedinti", "Mures", "Neamt", "Olt", "Prahova", "Salaj", "Satu Mare", "Sibiu",
        "Suceava", "Teleorman", "Timis", "Tulcea", "Vaslui", "Valcea", "Vrancea"
    ];
    let currentPage = 1;
    let itemsPerPage = 50;

    export let data;
    const GALs = data?.data?.GALs;
    onMount(async () => {
        try {
            if($currentUser){
                let resultList = await pb.collection("favorites").getFullList({
                    expand: "gal",
                    filter:`user.id = "${$currentUser.id}"`,
                })
                let Favorites = resultList
                    .map(item => item.expand?.gal)
                    .filter((gal)=> gal !== undefined);
                FavoritesList.set(Favorites);

            }
        } catch (error) {
            console.error('Error loading GALs:', error);
        }
    });

    $: filteredGALs = GALs.filter(gal => {
        const matchesSearch = $SelectedSearchQuery ? gal.Denumire_GAL.toLowerCase().includes($SelectedSearchQuery.toLowerCase()) : true;
        const matchesCounty = $selectedCounty ? gal.Judet.split(',').map(item => item.trim()).includes($selectedCounty) : true;

        return matchesSearch && matchesCounty;


    }).sort((a, b) => {
        switch ($SelectedSortOption) {
            case "name-asc":
                return a.Denumire_GAL.localeCompare(b.Denumire_GAL);
            case "name-desc":
                return b.Denumire_GAL.localeCompare(a.Denumire_GAL);
            case "county-asc":
                return a.Judet.localeCompare(b.Judet);
            case "county-desc":
                return b.Judet.localeCompare(a.Judet);
            default:
                return 0;
        }
    });

    // Paginate filtered items
    $: paginatedGALs = filteredGALs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    function nextPage() {
        if (currentPage * itemsPerPage < filteredGALs.length) {
            currentPage += 1;
        }
    }
    function prevPage() {
        if (currentPage > 1) {
            currentPage -= 1;
        }
    }


</script>

<div class="pt-[100px]"></div>

<NotificationComponent constant={$AddedToFav} functionName={()=>{AddedToFav.set(false)}} message="Adaugat la Favorite." GoodOrBad={false} />
<NotificationComponent constant={$isNotLoggedIn} functionName={()=>{isNotLoggedIn.set(false)}} message="Trebuie sa fii logat pentru asta." GoodOrBad={true}/>
<NotificationComponent constant={$RemovedFromFav} functionName={()=>{RemovedFromFav.set(false)}} message="Scos de la Favorite." GoodOrBad={true} />

<Filter counties={Judete} />

<div class="w-full overflow-auto mt-0 mr-0 mb-auto ml-auto h-full flex flex-wrap gap-4 justify-center items-center">
    {#if paginatedGALs.length === 0}

        <p>No results found.</p>

    {:else}
        {#if $SelectedFavorites }
            {#if $currentUser}
                {#if $FavoritesList.length === 0}
                    <p>You don't have any favorites</p>
                {:else}
                    {#each $FavoritesList as gal (gal.id)}
                    <Card name={gal.Denumire_GAL} county={gal.Judet} website={gal.Website} id={gal.id} />
                    {/each}
                {/if}
                {:else}
                <p>You need to login to see your favorites</p>
            {/if}
        {:else}
            {#each paginatedGALs as gal (gal.id)}
                    <Card name={gal.Denumire_GAL} county={gal.Judet} website={gal.Website} id={gal.id} />
            {/each}
        {/if}
    {/if}
</div>


<div class="w-full flex justify-center mt-10 mb-10 gap-5 items-center">
    <button
            class="cursor-pointer relative inline-flex items-center px-5 py-2.5 rounded-lg transition-all duration-200 group
        {currentPage === 1
        ? 'bg-gray-100 cursor-not-allowed'
        : 'bg-white hover:bg-purple-50 shadow-sm hover:shadow'}"
            onclick={prevPage}
            disabled={currentPage === 1}
            aria-label="Pagina Anterioară"
    >
        <div class="absolute inset-0 rounded-lg border {currentPage === 1 ? 'border-gray-200' : 'border-gray-200 group-hover:border-purple-300'} transition-  duration-200">
        </div>
        <div class="flex items-center">
            <div class="mr-2 {currentPage === 1 ? 'text-gray-300' : 'text-purple-600 group-hover:text-purple-700'}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
            </div>
            <span class="font-medium text-sm {currentPage === 1 ? 'text-gray-400' : 'text-gray-700 group-hover:text-purple-700'}">Pagina Anterioară</span>
        </div>
    </button>

    <span class="mx-2 text-sm">
        Page {currentPage} of {Math.ceil(filteredGALs.length / itemsPerPage)}
    </span>

    <button
            class="relative cursor-pointer inline-flex items-center px-5 py-2.5 rounded-lg transition-all duration-200 group
        {currentPage >= Math.ceil(filteredGALs.length / itemsPerPage)
        ? 'bg-gray-100 cursor-not-allowed'
        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-sm hover:shadow'}"
            aria-label="Pagina Următoare"
            onclick={nextPage}
            disabled={currentPage * itemsPerPage >= filteredGALs.length}
    >
        <div class="flex items-center">
            <span class="font-medium text-sm {currentPage >= Math.ceil(filteredGALs.length / itemsPerPage) ? 'text-gray-400' : 'text-white'}">Pagina Următoare</span>
            <div class="ml-2 {currentPage >= Math.ceil(filteredGALs.length / itemsPerPage) ? 'text-gray-300' : 'text-white'}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
            </div>
        </div>
    </button>
</div>