"use client";

// The founder's edit form: bio + socials, and up to 3 products (one primary,
// which is the one that can be featured in the game). Loads and saves via
// /api/profile.
import { useEffect, useState } from "react";
import { SANS, MONO, card, btnBrand, btnGhost, monoLabel } from "@/components/slopdar/ui";
import { MAX_PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/founder";

interface ProductRow {
  key: string;
  id?: string;
  name: string;
  url: string;
  pitch: string;
  logoUrl: string;
  category: string;
  isPrimary: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "2px solid var(--ink)",
  borderRadius: 10,
  padding: "10px 12px",
  fontFamily: MONO,
  fontSize: 13,
  color: "var(--ink)",
  outline: "none",
};
const labelStyle: React.CSSProperties = { ...monoLabel, display: "block", marginBottom: 6 };

let keyN = 0;
const newKey = () => `p${keyN++}`;

export default function ProfileEditor() {
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setBio(d.bio ?? "");
        setRole(d.role ?? "");
        setTwitter(d.twitter ?? "");
        setLinkedin(d.linkedin ?? "");
        setProducts(
          (d.products ?? []).map((p: { id: string; name: string; url: string; pitch: string | null; logoUrl: string | null; category: string | null; isPrimary: boolean }) => ({
            key: newKey(),
            id: p.id,
            name: p.name,
            url: p.url,
            pitch: p.pitch ?? "",
            logoUrl: p.logoUrl ?? "",
            category: p.category ?? "",
            isPrimary: p.isPrimary,
          })),
        );
      })
      .catch(() => setError("could not load your profile"))
      .finally(() => setLoading(false));
  }, []);

  const setProduct = (key: string, patch: Partial<ProductRow>) =>
    setProducts((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const setPrimary = (key: string) => setProducts((rows) => rows.map((r) => ({ ...r, isPrimary: r.key === key })));
  const addProduct = () =>
    setProducts((rows) => (rows.length >= MAX_PRODUCTS ? rows : [...rows, { key: newKey(), name: "", url: "", pitch: "", logoUrl: "", category: "", isPrimary: rows.length === 0 }]));
  const removeProduct = (key: string) => setProducts((rows) => rows.filter((r) => r.key !== key));

  const uploadLogo = async (key: string, file: File | null) => {
    if (!file) return;
    setUploadingKey(key);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "upload failed");
      const { url } = (await res.json()) as { url: string };
      setProduct(key, { logoUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload = {
        bio,
        role,
        twitter,
        linkedin,
        products: products
          .filter((p) => p.name.trim() && p.url.trim())
          .map((p) => ({ id: p.id, name: p.name, url: p.url, pitch: p.pitch, logoUrl: p.logoUrl, category: p.category, isPrimary: p.isPrimary })),
      };
      const res = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ ...card, borderRadius: 16, padding: 24, fontFamily: MONO, color: "var(--mut)" }}>Loading your profile…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Founder */}
      <div style={{ ...card, borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 14 }}>About you</div>
        <label style={labelStyle}>Bio <span style={{ color: "var(--mut)", textTransform: "none", letterSpacing: 0 }}>({bio.length}/1000)</span></label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Tell people who you are and what you build. This shows on your public page."
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} maxLength={48} placeholder="indie founder" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>X / Twitter</label>
            <input value={twitter} onChange={(e) => setTwitter(e.target.value)} maxLength={100} placeholder="@you" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>LinkedIn</label>
            <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} maxLength={200} placeholder="linkedin.com/in/you" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ ...card, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Your products</div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)" }}>{products.length}/{MAX_PRODUCTS}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--mut)", margin: "0 0 14px" }}>
          The <b>primary</b> product is the one that can be featured in the game when you win.
        </p>

        {products.length === 0 && (
          <div style={{ fontFamily: MONO, fontSize: 12.5, color: "var(--mut)", padding: "8px 0 14px" }}>No products yet.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {products.map((p) => (
            <div key={p.key} style={{ border: "2px solid var(--ink)", borderRadius: 12, padding: 14, background: p.isPrimary ? "#FFF6E0" : "var(--bg)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input value={p.name} onChange={(e) => setProduct(p.key, { name: e.target.value })} maxLength={120} placeholder="Product name" style={inputStyle} />
                <input value={p.url} onChange={(e) => setProduct(p.key, { url: e.target.value })} maxLength={512} placeholder="yourproduct.com" style={inputStyle} />
              </div>
              <input value={p.pitch} onChange={(e) => setProduct(p.key, { pitch: e.target.value })} maxLength={160} placeholder="One line about it" style={{ ...inputStyle, marginTop: 10 }} />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 10 }}>
                {/* Logo upload */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" width={40} height={40} style={{ borderRadius: 9, border: "2px solid var(--ink)", objectFit: "cover", flexShrink: 0, display: "block" }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 9, border: "2px dashed var(--line2)", flexShrink: 0 }} />
                  )}
                  <label style={{ ...btnGhost, fontSize: 12, padding: "9px 13px", cursor: uploadingKey === p.key ? "default" : "pointer" }}>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }} onChange={(e) => uploadLogo(p.key, e.target.files?.[0] ?? null)} />
                    {uploadingKey === p.key ? "Uploading…" : p.logoUrl ? "Change logo" : "Upload logo"}
                  </label>
                  {p.logoUrl && (
                    <button onClick={() => setProduct(p.key, { logoUrl: "" })} style={{ background: "none", border: 0, cursor: "pointer", fontFamily: MONO, fontSize: 11, color: "var(--mut)" }}>remove</button>
                  )}
                </div>
                {/* Category */}
                <select value={p.category} onChange={(e) => setProduct(p.key, { category: e.target.value })} style={{ ...inputStyle, width: "auto", flex: 1, minWidth: 150, cursor: "pointer" }}>
                  <option value="">Category…</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>
                  <input type="radio" name="primary" checked={p.isPrimary} onChange={() => setPrimary(p.key)} />
                  Primary (in the game)
                </label>
                <button onClick={() => removeProduct(p.key)} style={{ background: "none", border: 0, cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "var(--t4)" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {products.length < MAX_PRODUCTS && (
          <button onClick={addProduct} style={{ ...btnGhost, marginTop: 14, fontSize: 13, padding: "10px 16px" }}>+ Add product</button>
        )}
      </div>

      {error && <div style={{ fontFamily: MONO, fontSize: 13, color: "var(--t4)" }}>{error}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={save} disabled={saving} className="h-brand" style={{ ...btnBrand, fontSize: 15, padding: "13px 26px", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save profile"}
        </button>
        {saved && <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--t1)", fontWeight: 700 }}>Saved ✓</span>}
      </div>
    </div>
  );
}
