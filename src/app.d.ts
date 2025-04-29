// src/app.d.ts
import type PocketBase from 'pocketbase';

declare global {
    namespace App {
        interface Locals {
            pb?: PocketBase;
            user?: {
                id: string;
                // add other user properties you need
            };
        }
    }
}

export {};