import useSWR from "swr";
import { getCategory } from "@/lib/cateogry";

export function  useCategory(){

    const {data, error, isLoading} = useSWR('/', getCategory);
    return {
        items: data || [],
        isLoading, 
        error
    }
    
}