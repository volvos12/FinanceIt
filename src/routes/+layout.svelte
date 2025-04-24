<script lang="ts">
    import '../app.css';
    import {currentUser, pb} from "$lib/pocketbase";

    let { children } = $props();

    import { onMount } from 'svelte';
    import Footer from "$lib/components/Footer.svelte";
    let brandName = "FinanceIt";
    let isMenuOpen = $state(false);
    let isNavbarVisible = $state(true);
    let lastScrollY = $state(0);

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
    };

    let navbar:any;

    onMount(() => {
        // Handle clicks outside the navbar to close the menu
        const handleClickOutside = (event:any) => {
            if (navbar && !navbar.contains(event.target) && isMenuOpen) {
                isMenuOpen = false;
            }
        };

        // Handle scroll events to show/hide navbar
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar when scrolling up or at the top
            if (currentScrollY <= 0) {
                isNavbarVisible = true;
            }
            // Hide navbar when scrolling down, show when scrolling up
            else isNavbarVisible = currentScrollY <= lastScrollY;

            lastScrollY = currentScrollY;
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    });

</script>

<div class="w-full h-full">
    <!-- Navbar with transition classes -->
    <nav
            bind:this={navbar}
            class={`bg-white shadow-sm border-b border-gray-100 py-5 w-full fixed z-40 transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Logo and brand -->
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-center">
                        <!-- Logo placeholder - replace with your logo -->
                        <div class="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-700 font-bold mr-2">
                            G
                        </div>
                        <span class="font-bold text-lg text-purple-900">{brandName}</span>
                    </div>

                    <!-- Desktop navigation -->
                    <div class="hidden sm:ml-8 sm:flex sm:space-x-6">
                        <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Home</a>
                        <a href="/GalList" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Galuri</a>
                        <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Counties</a>
                        <a href="/" class="text-purple-700 hover:text-purple-800 px-3 py-2 text-sm font-medium">Favorites</a>
                    </div>
                </div>

                <div class="hidden sm:flex sm:items-center sm:space-x-3">
                    {#if $currentUser}
                        <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                            My Account
                        </a>
                        <button onclick={(e:Event) => {pb.authStore.clear(); e.preventDefault(); e.stopPropagation();}} class="bg-gray-100 cursor-pointer hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                            Log Out
                        </button>
                    {:else}
                        <a href="/AuthPage?isLogin=true" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                            Log In
                        </a>
                        <a href="/AuthPage?isLogin=false" class="bg-purple-100 text-purple-700 hover:bg-purple-700 hover:text-white border border-purple-300 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                            Sign Up
                        </a>
                    {/if}
                </div>
                <div class="flex items-center sm:hidden">
                    <button
                            onclick={(e:Event) => {toggleMenu; e.preventDefault(); e.stopPropagation();}}
                            class="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                            aria-expanded={isMenuOpen}
                    >
                        <span class="sr-only">Open main menu</span>
                        {#if !isMenuOpen}
                            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        {:else}
                            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        {/if}
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state -->
        {#if isMenuOpen}
            <div class="sm:hidden">
                <div class="pt-2 pb-3 space-y-1">
                    <a href="/" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Home</a>
                    <a href="/" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Directory</a>
                    <a href="/" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Counties</a>
                    <a href="/" class="block px-3 py-2 text-base font-medium text-purple-700 hover:text-purple-800 hover:bg-purple-50">Favorites</a>
                </div>
                <div class="pt-4 pb-3 border-t border-gray-200">
                    {#if $currentUser}
                        <div class="flex items-center px-4">
                            <div class="flex-shrink-0">
                                <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                                    U
                                </div>
                            </div>
                            <div class="ml-3">
                                <div class="text-base font-medium text-gray-800">User Name</div>
                                <div class="text-sm font-medium text-gray-500">user@example.com</div>
                            </div>
                        </div>
                        <div class="mt-3 space-y-1">
                            <a href="/" class="cursor-pointer block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">My Account</a>
                            <a href="/" class="cursor-pointer block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Log Out</a>
                        </div>
                    {:else}
                        <div class="space-y-1 px-4">
                            <a href="/AuthPage?isLogin=true" class="cursor-pointer w-full text-left block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                                Log In
                            </a>
                            <a href="/AuthPage?isLogin=false" class="cursor-pointer w-full mt-2 bg-purple-100 text-purple-700 hover:bg-purple-700 hover:text-white border border-purple-300 px-4 py-2 rounded-md text-base font-medium transition-colors duration-200">
                                Sign Up
                            </a>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </nav>
        {@render children()}
    <Footer/>
    </div>
