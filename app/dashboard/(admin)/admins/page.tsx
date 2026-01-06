'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Key, RefreshCw } from 'lucide-react';
import styles from '../admins.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import SearchFilter, { FieldDef, SearchQuery } from '@/components/SearchFilter';
import Dropdown from '@/components/Dropdown';
import { addUser, deleteUser as deleteUserApi, getUsers, updateUser } from '@/app/lib/admins.service';

type Admin = {
  id: string;
  name: string;
  role: string;
  email: string;
  password?: string;
};

export default function AdminsPage() {
  const initialAdmins: Admin[] = useMemo(() => [], []);
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Admin>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState<SearchQuery>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fields = React.useMemo<FieldDef[]>(
    () => [
      { key: 'name', label: 'الاسم', type: 'text' },
      {
        key: 'role',
        label: 'الدور',
        type: 'select',
        options: [
          { label: 'مشرف', value: 'مشرف' },
          { label: 'مشرف عام', value: 'مشرف عام' },
          { label: 'محرر', value: 'محرر' },
        ],
      },
      { key: 'email', label: 'البريد الإلكتروني', type: 'text' },
      { key: 'id', label: 'المعرف', type: 'text' },
    ],
    []
  );

  const roleLabelFromApi = (role: string): string => {
    if (role === 'author') return 'محرر';
    if (role === 'admin') return 'مشرف';
    if (role === 'super_admin') return 'مشرف عام';
    return role;
  };
  const roleToApi = (label: string): string => {
    if (label === 'محرر') return 'author';
    if (label === 'مشرف') return 'admin';
    if (label === 'مشرف عام') return 'super_admin';
    return label;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const resp = await getUsers(page);
        if (!alive) return;
        const mapped: Admin[] = resp.data.map((u) => ({
          id: String(u.id),
          name: u.name,
          role: roleLabelFromApi(u.role),
          email: u.email,
        }));
        setAdmins(mapped);
        setLastPage(resp.last_page ?? 1);
        setPerPage(resp.per_page ?? 10);
        setTotal(resp.total ?? mapped.length);
      } catch {
        if (!alive) return;
        setAdmins([]);
        setLastPage(1);
        setPerPage(10);
        setTotal(0);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page]);

  const displayAdmins = React.useMemo(() => {
    const norm = (v: unknown) => String(v ?? '').toLowerCase().trim();
    const defSearchKeys = fields.filter((f) => f.type === 'text' || f.type === 'number').map((f) => f.key);
    const searchKeys = query.fields?.length ? query.fields : defSearchKeys;
    let arr = admins.slice();
    const t = norm(query.text);
    if (t) {
      arr = arr.filter((it) =>
        searchKeys.some((k) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return norm(val).includes(t);
        })
      );
    }
    const filters = query.filters ?? {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v == null || v === '' || v === 'any') return;
      const fdef = fields.find((f) => f.key === k);
      if (!fdef) return;
      if (fdef.type === 'select') {
        arr = arr.filter((it) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return String(val ?? '') === String(v);
        });
      }
    });
    if (query.sort?.key) {
      const dir = query.sort.dir === 'desc' ? -1 : 1;
      const key = query.sort.key;
      arr.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[key];
        const bv = (b as unknown as Record<string, unknown>)[key];
        return String(av ?? '').localeCompare(String(bv ?? ''), 'ar') * dir;
      });
    }
    return arr;
  }, [admins, query, fields]);

  const openAddModal = () => {
    setForm({});
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setForm(admin);
    setIsModalOpen(true);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, password: p }));
  };

  const saveAdmin = async () => {
    setIsLoading(true);
    try {
      const payload = {
        name: form.name ?? '',
        email: form.email ?? '',
        password: form.password ?? '',
        role: roleToApi(form.role ?? 'مشرف'),
      };
      if (form.id) {
        const u = await updateUser(form.id, payload);
        const next: Admin = {
          id: String(u.id),
          name: u.name,
          role: roleLabelFromApi(u.role),
          email: u.email,
        };
        setAdmins((prev) => prev.map((x) => (x.id === next.id ? next : x)));
      } else {
        const u = await addUser(payload);
        const next: Admin = {
          id: String(u.id),
          name: u.name,
          role: roleLabelFromApi(u.role),
          email: u.email,
        };
        setAdmins((prev) => [next, ...prev]);
      }
      setIsModalOpen(false);
      setForm({});
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAdmin = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteUserApi(id);
      setAdmins((prev) => prev.filter((x) => x.id !== id));
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة المشرفين</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={18} />
          <span>إضافة مشرف</span>
        </button>
      </div>

      <SearchFilter
        fields={fields}
        onChange={setQuery}
        totalCount={total}
        filteredCount={displayAdmins.length}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>الاسم</th>
              <th className={styles.th}>الدور</th>
              <th className={styles.th}>البريد الإلكتروني</th>
              <th className={styles.th}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {displayAdmins.map((admin) => (
              <tr key={admin.id} className={styles.row}>
                <td className={styles.td}>{admin.name}</td>
                <td className={styles.td}>{admin.role}</td>
                <td className={styles.td}>{admin.email}</td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button className={styles.iconBtn} onClick={() => openEditModal(admin)}>
                      <Pencil size={18} />
                      <span className={styles.iconLabel}>تعديل</span>
                    </button>
                    <button className={styles.iconBtn} onClick={() => deleteAdmin(admin.id)}>
                      <Trash2 size={18} />
                      <span className={styles.iconLabel}>حذف</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {displayAdmins.map((admin) => (
          <div key={admin.id} className={styles.card}>
            <div className={styles.cardTitle}>{admin.name}</div>
            <div className={styles.cardMeta}>
              <span>الدور: {admin.role}</span>
              <span>البريد: {admin.email}</span>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.iconBtn} onClick={() => openEditModal(admin)} title="تعديل">
                <Pencil size={18} />
              </button>
              <button className={styles.iconBtn} onClick={() => deleteAdmin(admin.id)} title="حذف">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.6rem 1rem', marginTop: '0.75rem' }}>
        <div style={{ color: 'var(--brown-900)', fontWeight: 700 }}>
          عرض {perPage} صف في الصفحة — الإجمالي: {total} — الصفحة {page} من {lastPage}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className={styles.iconBtn}
            aria-label="التالي"
            title="التالي"
          >
            ▶
          </button>

           {Array.from({ length: lastPage }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-label={`الانتقال إلى الصفحة ${p}`}
                className={styles.iconBtn}
                style={{
                  background: active ? 'var(--beige-100)' : '#fff',
                  borderColor: active ? 'var(--brown-700)' : '#e2e8f0',
                  fontWeight: active ? 800 : 700,
                  width: 40,
                  height: 36,
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={styles.iconBtn}
            aria-label="السابق"
            title="السابق"
          >
            ◀
          </button>
         
          
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>مشرف جديد</div>

            <div className={styles.modalGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>الاسم</label>
                <input
                  className={styles.input}
                  value={form.name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="اسم المشرف"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>الدور</label>
                <Dropdown
                  options={[
                    { value: 'مشرف', label: 'مشرف' },
                    { value: 'مشرف عام', label: 'مشرف عام' },
                    { value: 'محرر', label: 'محرر' },
                  ]}
                  value={form.role ?? 'مشرف'}
                  onChange={(v) => setForm((f) => ({ ...f, role: v }))}
                  ariaLabel="اختيار الدور"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>البريد الإلكتروني</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@site.com"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>كلمة المرور</label>
                <div className={styles.passwordField}>
                  <input
                    className={styles.input}
                    type="text"
                    value={form.password ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••••"
                  />
                  <button type="button" className={styles.generateBtn} onClick={generatePassword} title="توليد كلمة مرور">
                    <Key size={16} />
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>إلغاء</button>
              <button className={styles.saveBtn} onClick={saveAdmin}>حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
