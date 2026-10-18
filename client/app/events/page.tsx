import Image from 'next/image'

export default function EventsPage() {
    return (
        <div className="flex pt-64 justify-center items-center ">
            <Image
                src="/56861-7.jpg"
                alt="Мероприятие" 
                width={500}
                height={500}
                className="w-full h-auto max-w-md"
            />
        </div>
    )
}