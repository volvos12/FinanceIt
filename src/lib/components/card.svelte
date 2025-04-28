<script lang="ts">
    export let name:string;
    export let county:string;
    export let website:string;
    export let id:string;


    let isHovering:boolean = false;
    import {fade} from "svelte/transition";
    import{pb, currentUser} from "$lib/pocketbase";

    $: displayWebsite = website ? website.replace(/^https?:\/\//, '') : '';

    $: countyColor = getCountyColor(county);

    function getCountyColor(county:string) {
        const hash = county.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);


        const colors = [
            { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", hover: "hover:bg-orange-700" },
            { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", hover: "hover:bg-blue-700" },
            { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", hover: "hover:bg-green-700" },
            { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300", hover: "hover:bg-purple-700" },
            { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", hover: "hover:bg-red-700" },
            { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", hover: "hover:bg-yellow-700" },
            { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-300", hover: "hover:bg-teal-700" }
        ];

    return colors[hash % colors.length];
    }

    async function toggleFavorite() {
        try {
            if ($currentUser) {
                const existingFavorite = await pb.collection('favorites').getFirstListItem(
                    `user.id = "${$currentUser.id}" && gal = "${id}"`
                ).catch(() => null);

                if (existingFavorite) {
                    await pb.collection('favorites').delete(existingFavorite.id);
                    RemovedFromFav.set(true)
                    AddedToFav.set(false)

                } else {
                    await pb.collection('favorites').create({
                        gal: id,
                        user: $currentUser.id
                    });
                    AddedToFav.set(true)
                    RemovedFromFav.set(false)
                }


                const resultList = await pb.collection("favorites").getFullList({
                    expand: "gal",
                    filter: `user.id = "${$currentUser.id}"`,
                });
                const Favorites = resultList
                    .map(item => item.expand?.gal)
                    .filter((gal) => gal !== undefined);
                FavoritesList.set(Favorites);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }



    import {FavoritesList,AddedToFav, RemovedFromFav} from '$lib/stores'

</script>


<div onmouseover={() => isHovering = true}
     onmouseout={() => isHovering = false}
     onfocus={() => isHovering = true}
     onblur={() => isHovering = false}
     role="tooltip"
    class="relative w-[280px] h-[250px] bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
    <div class={`absolute top-0 left-0 w-full h-1 ${countyColor.bg}`}></div>

    <div class="p-4 flex flex-col h-full">
        <div class="mb-3">
            <h2 class="text-lg capitalize font-bold text-gray-800 mb-1.5 leading-tight">{name}</h2>
            <span class={`inline-block lowercase text-xs font-semibold px-2 py-0.5 rounded ${countyColor.bg} ${countyColor.text}`}>
        {county}
      </span>
        </div>

        <div class="flex-grow flex flex-col space-y-2.5 mb-3">
            <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wider font-semibold text-gray-500">Website</span>
                <a href={"https://"+ website} target="_blank" rel="noopener noreferrer"
                   class={`text-sm ${countyColor.text} hover:underline truncate`}>
                    {displayWebsite}
                </a>
            </div>

            {#if isHovering}
                <div transition:fade={{duration:350}}>
                    <button onclick={toggleFavorite} class=" button-one cursor-pointer hover:opacity-60" aria-label="favorite button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256" xml:space="preserve">
                        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
	                    <path d="M 45.002 75.502 c 2.862 0 5.72 0.684 8.326 2.051 l 19.485 10.243 l -3.721 -21.678 c -1.002 -5.815 0.926 -11.753 5.164 -15.877 L 90 34.895 l -21.768 -3.161 c -5.838 -0.85 -10.884 -4.514 -13.499 -9.806 L 44.998 2.205 l -9.73 19.717 c -2.615 5.292 -7.661 8.962 -13.499 9.811 L 0 34.895 L 15.749 50.25 c 4.224 4.111 6.156 10.044 5.16 15.863 l -3.721 21.682 l 19.466 -10.238 C 39.268 76.19 42.135 75.502 45.002 75.502 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,207,100); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
                        </g>
                        </svg>
                    </button>
                </div>
            {/if}
        </div>
        <a
                href="/GalList/{id}"
                class={`w-full text-center py-2 text-xs font-semibold rounded ${countyColor.bg} ${countyColor.text} ${countyColor.border} border transition-colors duration-200 ${countyColor.hover} hover:text-white`}>
            See More
        </a>
    </div>
</div>