import HeaderBar from "@/components/ui/HeaderBar";


export default async function page({
    params
} : {
    params: { user: string }
}) {

    const { user } = await params;

    return (
        <div>
            <HeaderBar title={user}/>
        </div>
    )
}
