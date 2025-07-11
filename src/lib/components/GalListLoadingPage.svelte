<script>
    let hoveredCard = $state(null);
    const skeletonCards = Array.from({ length: 50 }, (_, i) => i);

    // Simulate different county colors for skeleton variety
    //@ts-ignore
    function getSkeletonColor(index) {
        const colors = [
            "bg-orange-50",
            "bg-blue-50",
            "bg-green-50",
            "bg-purple-50",
            "bg-red-50",
            "bg-yellow-50",
            "bg-teal-50",
        ];
        return colors[index % colors.length];
    }
</script>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6">
        <!-- Loading indicator -->
        <div class="flex items-center justify-center mb-8">
            <div class="flex items-center space-x-2 text-purple-600">
                <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-sm font-medium">Loading GAL Associations...</span>
            </div>
        </div>

        <!-- Cards Grid Skeleton -->

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
            {#each skeletonCards as _, index}
                <div
                        class="relative w-[280px] h-[250px] bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        role="button"
                        tabindex="0"
                        onmouseenter={() =>
                        //@ts-ignore
                         hoveredCard = index}
                        onmouseleave={() => hoveredCard = null}
                >
                    <!-- Colored top border skeleton -->
                    <div class="absolute top-0 left-0 w-full h-1 {getSkeletonColor(index)} animate-pulse"></div>

                    <div class="p-4 flex flex-col h-full">
                        <!-- Title and county section -->
                        <div class="mb-3">
                            <!-- Title skeleton - matches the real card's title -->
                            <div class="mb-1.5">
                                <div class="w-4/5 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div class="w-3/5 h-5 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <!-- Single county tag skeleton -->
                            <div class="w-16 h-5 {getSkeletonColor(index)} rounded animate-pulse"></div>
                        </div>

                        <!-- Content area -->
                        <div class="flex-grow flex flex-col space-y-2.5 mb-3">
                            <!-- Website section skeleton -->
                            <div class="flex flex-col">
                                <div class="w-12 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div class="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            <!-- Favorite button skeleton - only shows on hover -->
                            {#if hoveredCard === index}
                                <div class="transition-opacity duration-350">
                                    <div class="w-4 h-4 bg-yellow-200 rounded animate-pulse"></div>
                                </div>
                            {/if}
                        </div>

                        <!-- See More button skeleton -->
                        <div class="w-full h-8 {getSkeletonColor(index)} rounded animate-pulse"></div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Pagination skeleton -->
        <div class="flex justify-center mt-12">
            <div class="flex space-x-2">
                {#each Array(5) as _}
                    <div class="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>
