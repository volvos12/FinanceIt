<script lang="ts">
    import { pb } from "$lib/pocketbase";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    interface AuthForm {
        email: string;
        password: string;
        passwordConfirm?: string;
    }

    export let isLogin: boolean;
    let formData: AuthForm = {
        email: "",
        password: "",
        passwordConfirm: ""
    };
    let isLoading = false;
    let errorMessage: string | null = null;
    let isAuthenticated = pb.authStore.isValid; // Track auth state

    onMount(() => {
        // Listen for auth state changes
        pb.authStore.onChange(() => {
            console.log('Auth state changed:', pb.authStore.isValid);
            isAuthenticated = pb.authStore.isValid;
            // Only redirect if not already on the main page and authenticated
            if (isAuthenticated && window.location.pathname !== "/") {
                goto("/");
            }
        });
    });

    async function handleSubmit() {
        isLoading = true;
        errorMessage = null;

        try {
            if (isLogin) {
                await pb.collection('users').authWithPassword(
                    formData.email,
                    formData.password
                );
            } else {
                if (formData.password !== formData.passwordConfirm) {
                    throw new Error("Passwords don't match");
                }
                await pb.collection('users').create({
                    email: formData.email,
                    password: formData.password,
                    passwordConfirm: formData.passwordConfirm
                });

                await pb.collection('users').authWithPassword(
                    formData.email,
                    formData.password
                );
            }
            goto("/");
        } catch (err: any) {
            console.error('Auth error:', err);
            // Handle specific errors
            if (err.status === 400 && isLogin) {
                errorMessage = "User not found or invalid credentials";
            } else if (err.message === "Passwords don't match") {
                errorMessage = err.message;
            } else {
                errorMessage = "An error occurred. Please try again.";
            }
        } finally {
            isLoading = false;
        }
    }

    function toggleAuthMode() {
        isLogin = !isLogin;
        formData = {
            email: "",
            password: "",
            passwordConfirm: ""
        };
        errorMessage = null;
    }

    function handleLogout() {
        pb.authStore.clear();
        isAuthenticated = false;
        errorMessage = null;
    }

    function goToMainPage() {
        goto("/");
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-10">
    <div class="relative max-w-md w-full pt-[130px]">
        <!-- Decorative elements -->
        <div class="absolute -top-6 -left-6 w-24 h-24 bg-purple-200 rounded-full opacity-60 mix-blend-multiply blur-xl"></div>
        <div class="absolute -bottom-10 -right-10 w-36 h-36 bg-indigo-200 rounded-full opacity-70 mix-blend-multiply blur-xl"></div>

        <!-- Card -->
        <div class="relative bg-white rounded-2xl shadow-xl overflow-hidden z-10">
            {#if isAuthenticated}
                <!-- UI for authenticated users -->
                <div class="bg-gradient-to-r from-purple-500 to-indigo-600 pt-20 pb-16 px-8 text-center text-white">
                    <h2 class="text-3xl font-extrabold tracking-tight">Already Logged In</h2>
                    <p class="mt-2 text-purple-100">You are currently logged in as {pb.authStore.model?.email || 'user'}.</p>
                </div>
                <div class="px-8 py-6 text-center">
                    <button
                            on:click={goToMainPage}
                            class="group cursor-pointer inline-flex items-center justify-center py-3 px-4 mb-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                    >
                        Go to Main Page
                    </button>
                    <button
                            on:click={handleLogout}
                            class="inline-flex cursor-pointer items-center font-medium text-purple-600 hover:text-purple-500 transition-colors duration-150"
                    >
                        <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Log Out
                    </button>
                </div>
            {:else}
                <!-- UI for unauthenticated users -->
                <div class="bg-gradient-to-r from-purple-500 to-indigo-600 pt-20 pb-16 px-8 text-center text-white">
                    <h2 class="text-3xl font-extrabold tracking-tight">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h2>
                    <p class="mt-2 text-purple-100">
                        {isLogin ? "Sign in to access your account" : "Sign up to get started with our service"}
                    </p>
                </div>

                <!-- Form Container -->
                <div class="px-8 -mt-10">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        {#if errorMessage}
                            <p class="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
                        {/if}
                        <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                            <!-- Email Field -->
                            <div class="space-y-2">
                                <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                                <div class="relative rounded-md shadow-sm">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            bind:value={formData.email}
                                            class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-3"
                                            placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <!-- Password Field -->
                            <div class="space-y-2">
                                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                                <div class="relative rounded-md shadow-sm">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            bind:value={formData.password}
                                            class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-3"
                                            placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <!-- Confirm Password Field (Registration only) -->
                            {#if !isLogin}
                                <div class="space-y-2">
                                    <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <div class="relative rounded-md shadow-sm">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                                id="passwordConfirm"
                                                name="passwordConfirm"
                                                type="password"
                                                required
                                                bind:value={formData.passwordConfirm}
                                                class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-3"
                                                placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            {/if}

                            <!-- Remember Me (Login only) -->
                            {#if isLogin}
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                class="h-4 w-4 text-purple-600 cursor-pointer focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div class="text-sm">
                                        <a href="/" class="cursor-pointer text-purple-600 hover:text-purple-500">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                            {/if}

                            <!-- Submit Button -->
                            <div>
                                <button
                                        type="submit"
                                        disabled={isLoading}
                                        class="group cursor-pointer relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-150 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {#if isLoading}
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                      <!-- Loading spinner -->
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                                    {/if}
                                    <span class="flex items-center">
                    {#if !isLoading}
                      <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        {#if isLogin}
                          <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                        {:else}
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                          <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        {/if}
                      </svg>
                    {/if}
                                        {isLogin ? "Sign in" : "Create account"}
                  </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="px-8 py-6 text-center">
                    <button
                            type="button"
                            on:click={toggleAuthMode}
                            class="inline-flex cursor-pointer items-center font-medium text-purple-600 hover:text-purple-500 transition-colors duration-150"
                    >
                        <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" />
                        </svg>
                        {isLogin ? "Need an account? Register" : "Already have an account? Sign in"}
                    </button>
                </div>

                <!-- Social Login Options -->
                <div class="px-8 py-4 bg-gray-50 border-t border-gray-100">
                    <div class="text-sm text-center text-gray-600 mb-4">
                        Or continue with
                    </div>
                    <div class="flex space-x-3 justify-center">
                        <button type="button" class="flex-1 cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 max-w-[100px]">
                            <span class="sr-only">Sign in with Google</span>
                            <svg class="h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                            </svg>
                        </button>
                        <button type="button" class="flex-1 cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 max-w-[100px]">
                            <span class="sr-only">Sign in with GitHub</span>
                            <svg class="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button type="button" class="flex-1 cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 max-w-[100px]">
                            <span class="sr-only">Sign in with Microsoft</span>
                            <svg class="h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 0h11.5v11.5H0V0z" fill="#F25022"/>
                                <path d="M12.5 0H24v11.5H12.5V0z" fill="#7FBA00"/>
                                <path d="M0 12.5h11.5V24H0V12.5z" fill="#00A4EF"/>
                                <path d="M12.5 12.5H24V24H12.5V12.5z" fill="#FFB900"/>
                            </svg>
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        {#if !isAuthenticated}
            <div class="mt-6 text-center self-center flex-wrap w-[400px] text-xs text-gray-600 mx-auto">
                By signing in or creating an account, you agree to our
                <a href="/" class="text-purple-600 cursor-pointer hover:text-purple-500">Terms of Service</a> and
                <a href="/" class="text-purple-600 cursor-pointer hover:text-purple-500">Privacy Policy</a>.
            </div>
        {/if}
    </div>
</div>