export async function  getCategory(){
    const res = await fetch('https://dummyjson.com/products?limit=10');
    const data = await res.json();
    return data.products;
}

export async function getUsers(){
    const res = await fetch('https://dummyjson.com/users');
    const data = await res.json();
    return data.users;
}