export default function ContactsPage() {
    return (
        <section className="text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold">Наши контакты</h1>
            <p className="pt-5 text-xl">Адрес: г. Дзержинск, ул.Владимирская, д.15</p>
            <p className="pt-5 text-xl">Если у вас есть вопросы пишите<a className="hover:text-blue-300 transition-colors" href="mailto:televonline@mail.ru"> televonline@mail.ru</a></p>
        </section>
    )
}