<script lang="ts">
    import { fade } from 'svelte/transition';
    import { pb, currentUser } from '$lib/pocketbase';
    import {
        FavoritesList,
        AddedToFav,
        RemovedFromFav,
        isNotLoggedIn
    } from '$lib/stores';

    let {name, county, website, id} = $props()

    let isHovering = $state(false);
    let isProcessing = $state(false);

    // Display tweaks
    let displayWebsite:any = $state()
    let countyColor = $state<{ bg: string; text: string; border: string; hover: string }>({
        bg: '', text: '', border: '', hover: ''
    });

    $effect(()=>{
        displayWebsite = website ? website.replace(/^https?:\/\//, '') : '';
    })
    $effect(()=>{
        countyColor = getCountyColor(county);
    })

    function getCountyColor(county: string) {
        const hash = county
            .split('')
            .reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const colors = [
            { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', hover: 'hover:bg-orange-700' },
            { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-700' },
            { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', hover: 'hover:bg-green-700' },
            { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-700' },
            { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', hover: 'hover:bg-red-700' },
            { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', hover: 'hover:bg-yellow-700' },
            { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', hover: 'hover:bg-teal-700' }
        ];
        return colors[hash % colors.length];
    }

    // Derive favorite status
    let isFavorite:any = $state()
    $effect(()=>{
        isFavorite = $FavoritesList.some(item => item.id === id)
    })

    async function toggleFavorite() {
        if (isProcessing) return;
        if (!$currentUser) {
            isNotLoggedIn.set(true);
            return;
        }

        isProcessing = true;
        const original = [...$FavoritesList];

        try {
            if (isFavorite) {
                // Optimistic removal
                FavoritesList.update(list => list.filter(item => item.id !== id));
                RemovedFromFav.set(true);
            } else {
                // Optimistic addition
                const galData = { id, Denumire_GAL: name, Judet: county, Website: website };
                FavoritesList.update(list => [...list, galData]);
                AddedToFav.set(true);
            }

            // Background sync
            if (isFavorite) {
                const rec = await pb
                    .collection('favorites')
                    .getFirstListItem(`user.id="${$currentUser.id}"&&gal="${id}"`)
                    .catch(() => null);
                if (rec) {
                    await pb.collection('favorites').delete(rec.id);
                }
            } else {
                await pb.collection('favorites').create({
                    gal: id,
                    user: $currentUser.id
                });
            }
        } catch (err) {
            console.error('Favorite sync failed:', err);
            // Rollback
            FavoritesList.set(original);
            AddedToFav.set(false);
            RemovedFromFav.set(false);
        } finally {
            isProcessing = false;
        }
    }
</script>

<div
        onmouseover={() => (isHovering = true)}
        onmouseout={() => (isHovering = false)}
        onfocus={() => (isHovering = true)}
        onblur={() => (isHovering = false)}
        role="tooltip"
        class="relative w-[280px] h-[250px] bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
>
    <div class={`absolute top-0 left-0 w-full h-1 ${countyColor.bg}`}></div>

    <div class="p-4 flex flex-col h-full">
        <div class="mb-3">
            <h2 class="text-lg capitalize font-bold text-gray-800 mb-1.5 leading-tight">{name}</h2>
            <span class={`capitalize inline-block text-xs font-semibold px-2 py-0.5 rounded ${countyColor.bg} ${countyColor.text}`}>
        {county}
      </span>
        </div>

        <div class="flex-grow flex flex-col space-y-2.5 mb-3">
            <div class="flex flex-col">
                <span class="text-xs uppercase tracking-wider font-semibold text-gray-500">Website</span>
                <a
                        href={"https://" + website}
                        target="_blank"
                        rel="noopener noreferrer"
                        class={`text-sm ${countyColor.text} hover:underline truncate`}
                >
                    {displayWebsite}
                </a>
            </div>

            {#if isHovering}
                <div transition:fade={{ duration: 350 }}>
                    <button
                            onclick={toggleFavorite}
                            disabled={isProcessing}
                            class="button-one cursor-pointer hover:opacity-60"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {#if isFavorite}
                            ❤️
                        {:else}
                            🤍
                        {/if}
                    </button>
                </div>
            {/if}
        </div>

        <a
                href={`/GalList/${id}`}
                class={`w-full text-center py-2 text-xs font-semibold rounded ${countyColor.bg} ${countyColor.text} ${countyColor.border} border transition-colors duration-200 ${countyColor.hover} hover:text-white`}
        >
            See More
        </a>
    </div>
</div>