"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  name_fr: string
  icon: string
  color: string
}

const ICON_OPTIONS = [
  { value: "file-text", label: "Document" },
  { value: "graduation-cap", label: "Éducation" },
  { value: "package", label: "Colis" },
  { value: "notebook-pen", label: "Cahier" },
  { value: "book-open", label: "Livre" },
  { value: "laptop", label: "Informatique" },
  { value: "palette", label: "Art" },
  { value: "music", label: "Musique" },
]

const COLOR_OPTIONS = [
  { value: "#f59e0b", label: "Ambre" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#10b981", label: "Vert" },
  { value: "#ec4899", label: "Rose" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newNameFr, setNewNameFr] = useState("")
  const [newIcon, setNewIcon] = useState("package")
  const [newColor, setNewColor] = useState("#6366f1")
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim() || !newNameFr.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("categories").insert({
        name: newName.trim().toLowerCase().replace(/\s+/g, "-"),
        name_fr: newNameFr.trim(),
        icon: newIcon,
        color: newColor,
      })
      if (error) throw error
      setShowAdd(false)
      setNewName("")
      setNewNameFr("")
      setNewIcon("package")
      setNewColor("#6366f1")
      fetchCategories()
    } catch (err) {
      console.error("Error adding category:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("categories")
        .update({
          name: newName.trim().toLowerCase().replace(/\s+/g, "-"),
          name_fr: newNameFr.trim(),
          icon: newIcon,
          color: newColor,
        })
        .eq("id", id)
      if (error) throw error
      setEditId(null)
      fetchCategories()
    } catch (err) {
      console.error("Error updating category:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
      fetchCategories()
    } catch (err) {
      console.error("Error deleting category:", err)
    }
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setNewName(cat.name)
    setNewNameFr(cat.name_fr)
    setNewIcon(cat.icon)
    setNewColor(cat.color)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Catégories</h1>
              <p className="text-muted-foreground">Gérez les catégories d'annonces</p>
            </div>
            <Button onClick={() => { setShowAdd(true); setEditId(null); setNewName(""); setNewNameFr(""); setNewIcon("package"); setNewColor("#6366f1") }}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {showAdd && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-4 font-semibold">Nouvelle catégorie</h3>
                  <div className="space-y-3">
                    <Input placeholder="Nom (slug)" value={newName} onChange={e => setNewName(e.target.value)} />
                    <Input placeholder="Nom (français)" value={newNameFr} onChange={e => setNewNameFr(e.target.value)} />
                    <div className="flex gap-4">
                      <select value={newIcon} onChange={e => setNewIcon(e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                        {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <select value={newColor} onChange={e => setNewColor(e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                        {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAdd} disabled={saving || !newName || !newNameFr}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Ajouter
                      </Button>
                      <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
                    </div>
                  </div>
                </div>
              )}

              {categories.map((cat) => (
                <div key={cat.id} className="rounded-lg border border-border bg-card p-4">
                  {editId === cat.id ? (
                    <div className="space-y-3">
                      <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom (slug)" />
                      <Input value={newNameFr} onChange={e => setNewNameFr(e.target.value)} placeholder="Nom (français)" />
                      <div className="flex gap-4">
                        <select value={newIcon} onChange={e => setNewIcon(e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                          {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <select value={newColor} onChange={e => setNewColor(e.target.value)} className="rounded-lg border border-border bg-background p-2 text-sm">
                          {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(cat.id)} disabled={saving}>
                          <Check className="mr-2 h-4 w-4" />Sauvegarder
                        </Button>
                        <Button variant="outline" onClick={() => setEditId(null)}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: cat.color + "20" }}>
                          <span style={{ color: cat.color }}>{cat.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">{cat.name_fr}</p>
                          <p className="text-xs text-muted-foreground">slug: {cat.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Les annonces liées à cette catégorie ne seront pas supprimées mais perdront leur catégorie.
                            </AlertDialogDescription>
                            <div className="flex gap-3">
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive">Supprimer</AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
