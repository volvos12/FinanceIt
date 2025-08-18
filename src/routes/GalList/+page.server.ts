import { error } from "@sveltejs/kit";
import { pb } from "$lib/pocketbase";

export const load = () => {
    return {
        streamed: {
            GALs: (async () => {
                try {
                    const resultList = await pb.collection('GALs').getList(1, 500, {
                        sort: "created",
                    });
                    return structuredClone(resultList.items);
                } catch (err) {
                    console.error('Error loading GALs:', err);
                    console.error('Full error details:', JSON.stringify(err, null, 2));
                    throw error(500, { message: 'Error loading data' });
                }
            })()
        }
    };
};