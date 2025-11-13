'use client';

import { getUsers } from "@/lib/users";
import useSWR from "swr";

export function useUsers(){
    const {data, error, isLoading} = useSWR('/', getUsers);

    return {
        users: data || [],
        isLoading,
        error
    }
}