import HeaderBar from '../../../components/ui/HeaderBar'
import { PhotoIcon } from "@heroicons/react/24/outline";



export default function ChatBox({
    params
}: {
    params: {user: string}
}) {

    const {user} = params;

    return (
        <div className='h-screen relative'>
            <div>
                <HeaderBar title=""/>
            </div>

            <div className='flex gap-4 items-center absolute bottom-[100px] px-4 w-full'>
                    <PhotoIcon className="h-8 w-8 text-gray-500" />
                    <input type="text" className='w-full border rounded-full'/>
                </div>
        </div>
    )
}
