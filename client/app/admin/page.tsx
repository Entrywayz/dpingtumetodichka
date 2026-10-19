"use client"

import { useState, useEffect, useCallback } from "react"
import RoleGuard from "@/guards/roleguard"
import { Get, Post, Put, Delete } from "@/lib/server"
import { Employee } from "@/interfaces/employee"

interface EmployeeFormData {
  full_name: string
  position: string
  birth_date: string
  address: string
  phone: string
  note: string
}

const initialFormState: EmployeeFormData = {
  full_name: "",
  position: "",
  birth_date: "",
  address: "",
  phone: "",
  note: "",
}

type ActiveTab = "overview" | "add_employee" | "delete_employee" | "edit_employee"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState)
  const [deleteId, setDeleteId] = useState<string>("")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const clearNotifications = () => {
    setError(null)
    setSuccessMsg(null)
  }

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await Get<Employee[]>("/employees")
      setEmployees(data)
      
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки списка сотрудников")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    clearNotifications()

    if (!formData.full_name.trim()) {
      setError("Укажите ФИО сотрудника")
      return
    }

    if (formData.phone && formData.phone.length > 11) {
      setError("Номер телефона не должен превышать 11 символов")
      return
    }

    const payload = {
      full_name: formData.full_name.trim(),
      position: formData.position.trim() || null,
      birth_date: formData.birth_date || null,
      address: formData.address.trim() || null,
      phone: formData.phone.trim() || null,
      note: formData.note.trim() || null,
    }

    try {
      if (editingId) {
        await Put<Employee>(`/employees/${editingId}`, payload)
        setSuccessMsg(`Информация о сотруднике #${editingId} успешно обновлена`)
      } else {
        await Post<Employee>("/employees", payload)
        setSuccessMsg("Сотрудник успешно добавлен")
      }

      setFormData(initialFormState)
      setEditingId(null)
      await fetchEmployees()
      setActiveTab("overview")
    } catch (err: any) {
      setError(err.message || "Ошибка при сохранении данных сотрудника")
    }
  }

  const handleDeleteEmployee = async (idToDelete?: number) => {
    clearNotifications()
    const targetId = idToDelete ?? Number(deleteId)

    if (!targetId || Number.isNaN(targetId)) {
      setError("Укажите корректный код (ID) сотрудника")
      return
    }

    if (!confirm(`Вы действительно хотите удалить сотрудника #${targetId}?`)) {
      return
    }

    try {
      await Delete<void>(`/employees/${targetId}`)
      setSuccessMsg(`Сотрудник #${targetId} успешно удален`)
      if (!idToDelete) setDeleteId("")
      await fetchEmployees()
      if (activeTab === "delete_employee") {
        setActiveTab("overview")
      }
    } catch (err: any) {
      setError(err.message || "Ошибка при удалении сотрудника")
    }
  }

  const handleStartEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setFormData({
      full_name: emp.full_name,
      position: emp.position || "",
      birth_date: emp.birth_date ? emp.birth_date.toString().slice(0, 10) : "",
      address: emp.address || "",
      phone: emp.phone || "",
      note: emp.note || "",
    })
    setActiveTab("edit_employee")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(initialFormState)
    setActiveTab("overview")
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <section className="h-full text-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cyan-400">
                Панель администратора
              </h1>
              <p className="text-sm text-slate-400">
                Управление учетными записями и анкетами сотрудников
              </p>
            </div>
            <button
              onClick={fetchEmployees}
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
                Меню администратора
              </span>
              <nav className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "overview"
                      ? "bg-cyan-500/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Главная
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData(initialFormState)
                    setActiveTab("add_employee")
                  }}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "add_employee"
                      ? "bg-cyan-500/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Добавить работника
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("delete_employee")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "delete_employee"
                      ? "bg-cyan-500/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Удалить работника
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("edit_employee")}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    activeTab === "edit_employee"
                      ? "bg-cyan-500/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Изменить информацию о работнике
                </button>
              </nav>
            </aside>

            <main className="md:col-span-3 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  

                  <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-200">
                        Список сотрудников ({employees.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">ФИО</th>
                            <th className="px-4 py-3">Должность</th>
                            <th className="px-4 py-3">Дата рожд.</th>
                            <th className="px-4 py-3">Телефон</th>
                            <th className="px-4 py-3">Адрес / Примечание</th>
                            <th className="px-4 py-3 text-center">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200">
                          {employees.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-6 text-slate-500">
                                {loading ? "Загрузка данных..." : "Сотрудники не найдены"}
                              </td>
                            </tr>
                          ) : (
                            employees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-cyan-400 font-medium">#{emp.id}</td>
                                <td className="px-4 py-3 font-medium text-white">{emp.full_name}</td>
                                <td className="px-4 py-3 text-slate-300">{emp.position || "—"}</td>
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                  {emp.birth_date ? new Date(emp.birth_date).toLocaleDateString("ru-RU") : "—"}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-300">{emp.phone || "—"}</td>
                                <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={`${emp.address || ""} ${emp.note ? `(${emp.note})` : ""}`}>
                                  {emp.address || emp.note ? (
                                    <span>
                                      {emp.address}
                                      {emp.note && <span className="text-slate-500 italic ml-1">[{emp.note}]</span>}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(emp)}
                                      className="text-xs px-2.5 py-1 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 rounded hover:bg-cyan-900 transition"
                                    >
                                      Изменить
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEmployee(emp.id)}
                                      className="text-xs px-2.5 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded hover:bg-rose-900 transition"
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
                </div>
              )}

              {activeTab === "add_employee" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-base font-semibold text-cyan-300 mb-4 pb-2 border-b border-slate-800">
                    Добавление нового работника
                  </h2>
                  <form onSubmit={handleSubmitEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        ФИО работника *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Например: Смирнов Алексей Петрович"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Должность
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Консультант / Старший специалист"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Дата рождения
                      </label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Телефон (до 11 цифр)
                      </label>
                      <input
                        type="tel"
                        maxLength={11}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="79991234567"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Адрес проживания
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="г. Москва, ул. Ленина, д. 5"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Примечание
                      </label>
                      <textarea
                        rows={3}
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Дополнительные сведения, навыки, отметки..."
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded transition"
                      >
                        Добавить работника
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "delete_employee" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                  <h2 className="text-base font-semibold text-rose-400 pb-2 border-b border-slate-800">
                    Удаление работника
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDeleteEmployee()
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Код (ID) работника для удаления
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={deleteId}
                        onChange={(e) => setDeleteId(e.target.value)}
                        placeholder="Введите ID..."
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

              {activeTab === "edit_employee" && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <h2 className="text-base font-semibold text-cyan-300 pb-2 border-b border-slate-800">
                    {editingId ? `Редактирование работника #${editingId}` : "Изменение информации о работнике"}
                  </h2>

                  {!editingId && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">
                        Выберите работника из списка для редактирования данных:
                      </p>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded">
                        {employees.map((emp) => (
                          <div
                            key={emp.id}
                            className="p-3 flex justify-between items-center hover:bg-slate-800/40 text-sm"
                          >
                            <div>
                              <span className="font-mono text-cyan-400 mr-2">#{emp.id}</span>
                              <span className="font-medium text-slate-200">{emp.full_name}</span>
                              <span className="text-slate-500 ml-2 text-xs">
                                ({emp.position || "без должности"})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(emp)}
                              className="text-xs px-3 py-1 bg-cyan-950 border border-cyan-700/60 text-cyan-300 rounded hover:bg-cyan-900"
                            >
                              Выбрать
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingId && (
                    <form onSubmit={handleSubmitEmployee} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ФИО работника *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={255}
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Должность
                        </label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Дата рождения
                        </label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Телефон (до 11 цифр)
                        </label>
                        <input
                          type="tel"
                          maxLength={11}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Адрес
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Примечание
                        </label>
                        <textarea
                          rows={3}
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded transition"
                        >
                          Сохранить изменения
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded transition"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </RoleGuard>
  )
}