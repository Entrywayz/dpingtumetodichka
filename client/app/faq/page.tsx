'use client';

import Link from 'next/link';
import { useState } from 'react';

const faqData = [
  {
    question: 'Как я могу найти ваш магазин?',
    answer: 'Мы находимся по адресу г. Дзержинск, ул. Владимирская д.15',
  },
  {
    question: 'Как я могу купить у вас телевизор?',
    answer: 'Вы можете прийти в магазин или написать нам на адрес',
  },
  {
    question: 'Как мне посмотреть, какие телевизоры есть в наличии?',
    answer: (
      <>
        Пройдите по ссылке{' '}
        <a href="/products" className="text-white no-underline hover:text-blue-300">
          Телевизоры
        </a>
        , и воспользуйтесь полным списком
      </>
    ),
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-white text-4xl mt-4 text-center">
        Часто задаваемые вопросы
      </h1>

      {faqData.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="w-1/2 border-2 border-white rounded-xl overflow-hidden m-2">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex justify-between items-center p-4 text-left bg-black hover:bg-gray-800 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white">{item.question}</span>
              <span
                className={`text-2xl transition-transform duration-300 text-white ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden hover:bg-gray-800">
                <p className="p-4 pt-5 text-gray-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}

    <h1 className="text-white text-3xl mt-4">
        <Link href="/">На главную</Link>
    </h1>
    </section>
  );
}