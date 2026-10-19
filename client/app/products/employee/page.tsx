'use client'

import { useState, useEffect, useCallback } from "react"
import RoleGuard from "@/guards/roleguard"
import { Get, Post, Put, Delete } from "@/lib/server"
import { Client } from "@/interfaces/client"
import { Order } from "@/interfaces/order"
import { Product } from "@/interfaces/product"

interface ProductFormData {
  name: string
  description: string
  in_stock: number | ""
  price: number | ""
}

interface OrderFormData {
  product_id: number | ""
  employee_id: number | ""
  client_id: number | ""
  placed_at: string
  completed_at: string
}

const initialOrderFormState: OrderFormData = {
  product_id: "",
  employee_id: "",
  client_id: "",
  placed_at: new Date().toISOString().slice(0, 16),
  completed_at: "",
}

const initialFormState: ProductFormData = {
  name: "",
  description: "",
  in_stock: "",
  price: "",
}

type ActiveTab = "overview" | "add_product" | "delete_product" | "orders" | "clients" | "add_order" | "delete_order"

export default function EmployeePanelPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("add_product")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState<ProductFormData>(initialFormState)
  const [orderFormData, setOrderFormData] = useState<OrderFormData>(initialOrderFormState)
  const [deleteId, setDeleteId] = useState<string>("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const clearNotifications = () => {
    setError(null)
    setSuccessMsg(null)
  }

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await Get<Client[]>("/clients")
      setClients(data)
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки клиентов")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await Get<Order[]>("/orders")
      setOrders(data)
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки заказов")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await Get<Product[]>("/products")
      setProducts(data)
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки товаров")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
    fetchOrders()
    fetchProducts()
  }, [fetchClients, fetchOrders, fetchProducts])

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    clearNotifications()

    if (!formData.name.trim() || formData.price === "" || formData.in_stock === "") {
      setError("Заполните обязательные поля: наименование, стоимость и наличие")
      return
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      in_stock: Number(formData.in_stock),
      price: Number(formData.price),
    }

    try {
      if (editingId) {
        await Put<Product>(`/products/${editingId}`, payload)
        setSuccessMsg(`Товар #${editingId} успешно обновлен`)
      } else {
        await Post<Product>("/products", payload)
        setSuccessMsg("Товар успешно добавлен в базу данных")
      }

      setFormData(initialFormState)
      setEditingId(null)
      await fetchProducts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteProduct = async (idToDelete?: number) => {
    clearNotifications()
    const targetId = idToDelete ?? Number(deleteId)

    if (!targetId || Number.isNaN(targetId)) {
      setError("Укажите корректный код (ID) товара")
      return
    }

    if (!confirm(`Вы действительно хотите удалить товар с кодом ${targetId}?`)) {
      return
    }

    try {
      await Delete<void>(`/products/${targetId}`)
      setSuccessMsg(`Товар с кодом ${targetId} удален`)
      if (!idToDelete) setDeleteId("")
      await fetchProducts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStartEditProduct = (prod: Product) => {
    setEditingId(prod.id)
    setFormData({
      name: prod.name,
      description: prod.description || "",
      in_stock: prod.in_stock,
      price: Number(prod.price),
    })
    setActiveTab("add_product")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    clearNotifications()

    if (!orderFormData.client_id || !orderFormData.product_id) {
      setError("Выберите клиента и телевизор")
      return
    }

    const payload = {
      product_id: Number(orderFormData.product_id),
      client_id: Number(orderFormData.client_id),
      employee_id: orderFormData.employee_id ? Number(orderFormData.employee_id) : undefined,
      placed_at: orderFormData.placed_at ? new Date(orderFormData.placed_at).toISOString() : new Date().toISOString(),
      completed_at: orderFormData.completed_at ? new Date(orderFormData.completed_at).toISOString() : null,
    }

    try {
      if (editingOrderId) {
        await Put<Order>(`/orders/${editingOrderId}`, payload)
        setSuccessMsg(`Заказ #${editingOrderId} успешно обновлен`)
      } else {
        await Post<Order>("/orders", payload)
        setSuccessMsg("Заказ успешно оформлен")
      }

      setOrderFormData(initialOrderFormState)
      setEditingOrderId(null)
      await fetchOrders()
      setActiveTab("orders")
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения заказа")
    }
  }

  const handleDeleteOrder = async (idToDelete?: number) => {
    clearNotifications()
    const targetId = idToDelete ?? Number(deleteId)

    if (!targetId || Number.isNaN(targetId)) {
      setError("Укажите корректный код (ID) заказа")
      return
    }

    if (!confirm(`Вы действительно хотите удалить заказ с кодом ${targetId}?`)) {
      return
    }

    try {
      await Delete<void>(`/orders/${targetId}`)
      setSuccessMsg(`Заказ с кодом ${targetId} удален`)
      if (!idToDelete) setDeleteId("")
      await fetchOrders()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStartEditOrder = (order: any) => {
    setEditingOrderId(order.id)
    setOrderFormData({
      product_id: order.product?.id ?? order.product_id ?? "",
      client_id: order.client?.id ?? order.client_id ?? "",
      employee_id: order.employee?.id ?? order.employee_id ?? "",
      placed_at: order.placed_at ? new Date(order.placed_at).toISOString().slice(0, 16) : "",
      completed_at: order.completed_at ? new Date(order.completed_at).toISOString().slice(0, 16) : "",
    })
    setActiveTab("add_order")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelOrderEdit = () => {
    setEditingOrderId(null)
    setOrderFormData(initialOrderFormState)
  }

  const handleDeleteClient = async (idToDelete?: number) => {
    clearNotifications()
    const targetId = idToDelete ?? Number(deleteId)

    if (!targetId || Number.isNaN(targetId)) {
      setError("Укажите корректный код (ID) клиента")
      return
    }

    if (!confirm(`Вы действительно хотите удалить клиента с кодом ${targetId}?`)) {
      return
    }

    try {
      await Delete<void>(`/clients/${targetId}`)
      setSuccessMsg(`Клиент с кодом ${targetId} удален`)
      if (!idToDelete) setDeleteId("")
      await fetchClients()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <RoleGuard allowedRoles={["employee"]}>
      <section className="h-full text-slate-100 p-4 md:p-8">
        <div className="max-w-10xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cyan-400">
                Панель сотрудника
              </h1>
              <p className="text-sm text-slate-400">
                Управление номенклатурой телевизоров, заказами и клиентами
              </p>
            </div>
            <button
              onClick={() => { fetchProducts(); fetchClients(); fetchOrders() }}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded border border-slate-700 transition"
            >
              {loading ? "Загрузка..." : "Обновить список"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 text-red-200 text-sm rounded flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs font-semibold px-2">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-sm rounded flex justify-between items-center">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-xs font-semibold px-2">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <aside className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-400 px-3 tracking-wider">
                Меню работника
              </span>
              <nav className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "overview" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Главная
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData(initialFormState)
                    setActiveTab("add_product")
                  }}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "add_product" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {editingId ? "Редактировать товар" : "Добавить товар"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("delete_product")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "delete_product" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Удалить товар
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCancelOrderEdit()
                    setActiveTab("add_order")
                  }}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "add_order" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {editingOrderId ? "Редактировать заказ" : "Добавить заказ"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("delete_order")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "delete_order" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Удалить заказ
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "orders" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Заказы
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("clients")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "clients" ? "bg-cyan-500/20 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Клиенты
                </button>
              </nav>
            </aside>

            <main className="md:col-span-3 space-y-6">
              {activeTab === "overview" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Перечень товаров в базе ({products.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Код</th>
                          <th className="px-4 py-3">Наименование товара</th>
                          <th className="px-4 py-3">Описание</th>
                          <th className="px-4 py-3 text-center">Наличие</th>
                          <th className="px-4 py-3 text-right">Цена</th>
                          <th className="px-4 py-3 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-500">
                              {loading ? "Загрузка данных..." : "Товары отсутствуют"}
                            </td>
                          </tr>
                        ) : (
                          products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{prod.id}</td>
                              <td className="px-4 py-3 font-medium">{prod.name}</td>
                              <td className="px-4 py-3 max-w-xs truncate" title={prod.description || ""}>
                                {prod.description || "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  prod.in_stock > 0
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                                    : "bg-rose-950 text-rose-300 border border-rose-800/50"
                                }`}>
                                  {prod.in_stock} шт.
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {Number(prod.price).toLocaleString("ru-RU")} ₽
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="text-xs px-2 py-1 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 rounded hover:bg-cyan-900 transition"
                                  >
                                    Изменить
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="text-xs px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded hover:bg-rose-900 transition"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "add_product" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-cyan-300 mb-4 pb-2 border-b border-slate-800">
                    {editingId ? `Редактирование товара #${editingId}` : "Добавление товара"}
                  </h2>
                  <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Наименование телевизора *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Например: Samsung UE40EH5300W"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Стоимость продажи (₽) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value === "" ? "" : Number(e.target.value) })
                        }
                        placeholder="18990.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Наличие на складе (шт.) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.in_stock}
                        onChange={(e) =>
                          setFormData({ ...formData, in_stock: e.target.value === "" ? "" : Number(e.target.value) })
                        }
                        placeholder="3"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Описание
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Диагональ экрана, разрешение, поддержка Smart TV..."
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded transition"
                      >
                        {editingId ? "Сохранить изменения" : "Добавить"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setFormData(initialFormState)
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded transition"
                        >
                          Отмена
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "delete_product" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-rose-400 mb-4 pb-2 border-b border-slate-800">
                    Удалить товар
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDeleteProduct()
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Код товара</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                        placeholder="Введите ID записи..."
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded transition"
                    >
                      Удалить
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "add_order" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-cyan-300 mb-4 pb-2 border-b border-slate-800">
                    {editingOrderId ? `Редактирование заказа #${editingOrderId}` : "Оформление нового заказа"}
                  </h2>
                  <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Выберите телевизор *
                      </label>
                      <select
                        required
                        value={orderFormData.product_id}
                        onChange={(e) =>
                          setOrderFormData({
                            ...orderFormData,
                            product_id: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Выберите модель --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({Number(p.price).toLocaleString("ru-RU")} ₽) — на складе: {p.in_stock} шт.
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Выберите клиента *
                      </label>
                      <select
                        required
                        value={orderFormData.client_id}
                        onChange={(e) =>
                          setOrderFormData({
                            ...orderFormData,
                            client_id: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Выберите клиента --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name} ({c.phone || "нет телефона"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Дата и время оформления
                      </label>
                      <input
                        type="datetime-local"
                        value={orderFormData.placed_at}
                        onChange={(e) => setOrderFormData({ ...orderFormData, placed_at: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Дата и время завершения (если готов)
                      </label>
                      <input
                        type="datetime-local"
                        value={orderFormData.completed_at}
                        onChange={(e) => setOrderFormData({ ...orderFormData, completed_at: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded transition"
                      >
                        {editingOrderId ? "Сохранить изменения" : "Оформить заказ"}
                      </button>
                      {editingOrderId && (
                        <button
                          type="button"
                          onClick={handleCancelOrderEdit}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded transition"
                        >
                          Отмена
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "delete_order" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-rose-400 mb-4 pb-2 border-b border-slate-800">
                    Удалить заказ
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDeleteOrder()
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Код заказа
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                        placeholder="Введите ID заказа..."
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded transition"
                    >
                      Удалить
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Список заказов ({orders.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Код</th>
                          <th className="px-4 py-3">Товар</th>
                          <th className="px-4 py-3">Клиент</th>
                          <th className="px-4 py-3">Сотрудник</th>
                          <th className="px-4 py-3">Размещен</th>
                          <th className="px-4 py-3">Статус / Завершен</th>
                          <th className="px-4 py-3 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-slate-500">
                              {loading ? "Загрузка данных..." : "Заказы отсутствуют"}
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-4 py-3 font-mono text-cyan-400 font-medium">
                                #{order.id}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {order.product?.name ?? "—"}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {order.client?.full_name ?? "—"}
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate text-slate-400">
                                {order.employee?.full_name ?? "Не назначен"}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-300">
                                {order.placed_at ? new Date(order.placed_at).toLocaleDateString("ru-RU") : "—"}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {order.completed_at ? (
                                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                                    {new Date(order.completed_at).toLocaleDateString("ru-RU")}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-xs bg-amber-950 text-amber-300 border border-amber-800/50">
                                    В обработке
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditOrder(order)}
                                    className="text-xs px-2 py-1 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 rounded hover:bg-cyan-900 transition"
                                  >
                                    Изменить
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-xs px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded hover:bg-rose-900 transition"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "clients" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Список клиентов ({clients.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">ФИО</th>
                          <th className="px-4 py-3">Адрес</th>
                          <th className="px-4 py-3">Телефон</th>
                          <th className="px-4 py-3 text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {clients.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-slate-500">
                              {loading ? "Загрузка данных..." : "Клиенты отсутствуют"}
                            </td>
                          </tr>
                        ) : (
                          clients.map((client) => (
                            <tr key={client.id || client.full_name} className="hover:bg-slate-800/40 transition">
                              <td className="px-4 py-3 font-medium text-cyan-300">
                                {client.full_name}
                              </td>
                              <td className="px-4 py-3 font-medium">{client.address}</td>
                              <td className="px-4 py-3 max-w-xs truncate" title={client.phone || ""}>
                                {client.phone || "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="text-xs px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded hover:bg-rose-900 transition"
                                >
                                  Удалить
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </RoleGuard>
  )
}