<script lang="ts">
    import {fade} from "svelte/transition";
    let {constant, functionName, message, GoodOrBad} = $props()


    let timeout: any;

    $effect(() => {
        if (constant) {
            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
                constant = false;
            }, 3000);
        } else {

            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };
    });
</script>

{#if GoodOrBad }
{#if constant }
    <div transition:fade class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full bg-gray-100 border-gray-200 text-gray-700">
        <div class="bg-gray-100 border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center">
            <div class="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                <span class="text-xs font-bold">✓</span>
            </div>
            <p class="text-gray-700 font-medium flex-grow">
                {message}
            </p>
            <button onclick={functionName} aria-label="close notification" class="cursor-pointer ml-3 text-gray-700 hover:text-gray-900 focus:outline-none">
                <svg class="w-4 h-4" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    </div>
{/if}
    {:else}

    {#if constant }
        <div transition:fade class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full bg-purple-100 border-purple-200 text-purple-700">
            <div class="bg-purple-100 border border-purple-200 rounded-lg shadow-lg px-4 py-3 flex items-center">
                <div class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="text-xs font-bold">✓</span>
                </div>
                <p class="text-purple-700 font-medium flex-grow">
                    {message}
                </p>
                <button onclick={functionName} aria-label="close notification" class="cursor-pointer ml-3 text-purple-700 hover:text-gray-900 focus:outline-none">
                    <svg class="w-4 h-4" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    {/if}
{/if}