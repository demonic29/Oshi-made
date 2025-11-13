import { getUsers } from "@/lib/cateogry";
import useSWR from "swr";

export function useUsers(){
    const {data, error, isLoading} = useSWR('users', getUsers);

    return {
        users: data || [],
        isLoading,
        error
    }
}