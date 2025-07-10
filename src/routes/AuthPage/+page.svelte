<script lang="ts">
    import AuthComponent from "$lib/components/AuthComponent.svelte";
    import { page } from "$app/stores";
    import { derived } from "svelte/store";
    const isLogin = derived(page, ($page) =>
        $page.url.searchParams.get("isLogin") === "true"
    );
</script>

<AuthComponent isLogin={$isLogin} />