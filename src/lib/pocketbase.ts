import PocketBase from 'pocketbase'
import {writable} from "svelte/store";
export const pb = new PocketBase('https://galsearch.onrender.com/')
export const currentUser = writable(pb.authStore.record)


pb.beforeSend = (url, options) => {
    options.signal = AbortSignal.timeout(5000); // 5 seconds timeout
    return { url, options };
};

pb.authStore.onChange((auth)=> {
    console.log('authStore Changed', auth)
    currentUser.set(pb.authStore.record)
})
