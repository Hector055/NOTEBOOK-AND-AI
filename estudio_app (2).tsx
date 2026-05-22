import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS = ["Pendiente", "En progreso", "Completado"] as const;
type ColType = typeof COLS[number];

const COL_ACCENT: Record<ColType, string> = {
  "Pendiente": "#888780", "En progreso": "#378ADD", "Completado": "#1D9E75"
};
const COL_BG: Record<ColType, string> = {
  "Pendiente": "#F1EFE8", "En progreso": "#E6F1FB", "Completado": "#E1F5EE"
};
const COL_ICON: Record<ColType, string> = {
  "Pendiente": "○", "En progreso": "◑", "Completado": "●"
};
const COLORS = ["#7F77DD","#1D9E75","#D85A30","#D4537E","#378ADD","#BA7517"];
const COLOR_NAMES = ["Morado","Verde","Naranja","Rosa","Azul","Ámbar"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

// ─── Time Picker (interactive clock) ─────────────────────────────────────────
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<"hour"|"minute">("hour");
  const svgRef = useRef<SVGSVGElement>(null);

  const hRaw = value ? parseInt(value.split(":")[0]) : null;
  const mRaw = value ? parseInt(value.split(":")[1]) : null;
  const h = hRaw !== null && !isNaN(hRaw) ? hRaw : null;
  const m = mRaw !== null && !isNaN(mRaw) ? mRaw : null;

  const getAngle = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const angle = getAngle(e.clientX, e.clientY);
    if (mode === "hour") {
      const hourVal = Math.round(angle / 30) % 12 || 12;
      const isPM = h !== null && h >= 12;
      const hh = isPM ? (hourVal === 12 ? 12 : hourVal + 12) : (hourVal === 12 ? 0 : hourVal);
      onChange(`${String(hh).padStart(2,"0")}:${m !== null ? String(m).padStart(2,"0") : "00"}`);
      setMode("minute");
    } else {
      const minVal = Math.round(angle / 6) % 60;
      onChange(`${h !== null ? String(h).padStart(2,"0") : "00"}:${String(minVal).padStart(2,"0")}`);
    }
  };

  const SIZE = 180;
  const CX = SIZE / 2, CY = SIZE / 2, R = 68, DOT = 15;
  const isPM = h !== null && h >= 12;
  const displayH = h !== null ? (h % 12 || 12) : null;

  const handAngle = mode === "hour"
    ? ((displayH ?? 12) * 30 - 90)
    : ((m ?? 0) * 6 - 90);

  const handX = CX + (R - 6) * Math.cos(handAngle * Math.PI / 180);
  const handY = CY + (R - 6) * Math.sin(handAngle * Math.PI / 180);

  const items = mode === "hour"
    ? Array.from({length:12}, (_,i) => ({val:i+1, label:String(i+1)}))
    : Array.from({length:12}, (_,i) => ({val:i*5, label:String(i*5).padStart(2,"0")}));

  return (
    <div style={{display:"flex", gap:16, alignItems:"center"}}>
      {/* Clock face */}
      <div style={{flexShrink:0}}>
        <svg ref={svgRef} width={SIZE} height={SIZE} onClick={handleClick}
          style={{cursor:"crosshair", userSelect:"none", display:"block"}}>
          {/* Background circle */}
          <circle cx={CX} cy={CY} r={CX-4} fill="#f0f0f0" stroke="#e0e0e0" strokeWidth={1}/>
          {/* Hand */}
          {(h !== null || mode === "minute") && (
            <>
              <line x1={CX} y1={CY} x2={handX} y2={handY}
                stroke="#378ADD" strokeWidth={2.5} strokeLinecap="round"/>
              <circle cx={handX} cy={handY} r={DOT}
                fill="#378ADD"/>
              <circle cx={CX} cy={CY} r={4} fill="#378ADD"/>
            </>
          )}
          {/* Numbers */}
          {items.map(({val, label}, i) => {
            const ang = (i * 30 - 90) * Math.PI / 180;
            const x = CX + R * Math.cos(ang);
            const y = CY + R * Math.sin(ang);
            const sel = mode === "hour"
              ? (displayH === val)
              : (m !== null && m === val);
            return (
              <g key={val}>
                <circle cx={x} cy={y} r={DOT}
                  fill={sel ? "#378ADD" : "transparent"}/>
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                  fontSize={12} fontWeight={sel ? 700 : 400}
                  fill={sel ? "white" : "#555"}
                  style={{fontFamily:"inherit", pointerEvents:"none"}}>{label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls: display + AM/PM + hint */}
      <div style={{display:"flex", flexDirection:"column", gap:10, alignItems:"flex-start"}}>
        {/* Time display */}
        <div style={{display:"flex", alignItems:"center", gap:4, background:"#f5f5f5", borderRadius:10, padding:"6px 10px"}}>
          <button onClick={() => setMode("hour")} style={{
            minWidth:38, padding:"4px 8px", borderRadius:7, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:20, fontWeight:700, lineHeight:1,
            background: mode==="hour" ? "#378ADD" : "transparent",
            color: mode==="hour" ? "white" : "#333"
          }}>{h !== null ? String(h % 12 || 12).padStart(2,"0") : "--"}</button>
          <span style={{fontSize:20, fontWeight:700, color:"#555", lineHeight:1}}>:</span>
          <button onClick={() => setMode("minute")} style={{
            minWidth:38, padding:"4px 8px", borderRadius:7, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:20, fontWeight:700, lineHeight:1,
            background: mode==="minute" ? "#378ADD" : "transparent",
            color: mode==="minute" ? "white" : "#333"
          }}>{m !== null ? String(m).padStart(2,"0") : "--"}</button>
        </div>

        {/* AM / PM */}
        <div style={{display:"flex", flexDirection:"column", gap:4}}>
          {["AM","PM"].map(period => {
            const active = period==="AM" ? !isPM : isPM;
            return (
              <button key={period} onClick={() => {
                if (h===null) return;
                if (period==="AM" && h>=12) onChange(`${String(h-12).padStart(2,"0")}:${String(m??0).padStart(2,"0")}`);
                else if (period==="PM" && h<12) onChange(`${String(h+12).padStart(2,"0")}:${String(m??0).padStart(2,"0")}`);
              }} style={{
                padding:"3px 14px", borderRadius:6, fontSize:12, fontWeight:600,
                border: active ? "none" : "1px solid #ddd",
                cursor:"pointer", fontFamily:"inherit",
                background: active ? "#378ADD" : "white",
                color: active ? "white" : "#777"
              }}>{period}</button>
            );
          })}
        </div>

        <div style={{fontSize:11, color:"#999", lineHeight:1.4}}>
          {mode==="hour" ? "← elige hora" : "← elige minutos"}
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ size = 38 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg, #CECBF6, #9FE1CB)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:500, fontSize:size*0.35, color:"#3C3489", flexShrink:0 }}>MI</div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: {label:string; value:number; accent:string}) {
  return (
    <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"14px 18px", borderTop:`3px solid ${accent}` }}>
      <div style={{ fontSize:26, fontWeight:500, color:"var(--color-text-primary)", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:4 }}>{label}</div>
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ tasks }: {tasks: Task[]}) {
  const total = tasks.length;
  if (total === 0) return null;
  const done = tasks.filter(t => t.col === "Completado").length;
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ marginBottom:"1.25rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--color-text-secondary)", marginBottom:6 }}>
        <span>Progreso general</span>
        <span style={{ fontWeight:500, color:"#1D9E75" }}>{pct}% completado</span>
      </div>
      <div style={{ height:6, background:"var(--color-background-secondary)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg, #5DCAA5, #1D9E75)", borderRadius:99, transition:"width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task { id: number; title: string; desc: string; tag: string; col: ColType; color: string; dueDate?: string; }
interface CalEvent { title: string; desc: string; time: string; color: string; }
interface Note { id: number; title: string; text: string; created: string; updated?: string; }
interface StudyDoc { id: number; name: string; type: string; base64: string; mediaType: string; size: string; }

// ─── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onMove, onGoToCalendar }: {task:Task; onEdit:(t:Task)=>void; onDelete:(id:number)=>void; onMove:(id:number,col:ColType)=>void; onGoToCalendar:()=>void}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = task.dueDate ? new Date(task.dueDate+"T00:00:00") : null;
  const daysLeft = due ? Math.round((due.getTime()-today.getTime())/(1000*60*60*24)) : null;
  const dueBadgeColor = daysLeft === null ? "" : daysLeft < 0 ? "#D85A30" : daysLeft === 0 ? "#BA7517" : daysLeft <= 2 ? "#D4537E" : "#1D9E75";
  const dueLabel = daysLeft === null ? "" : daysLeft < 0 ? `Vencida hace ${Math.abs(daysLeft)}d` : daysLeft === 0 ? "Hoy" : daysLeft === 1 ? "Mañana" : `${daysLeft}d restantes`;
  return (
    <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"10px 12px", marginBottom:8, borderLeft:`3px solid ${task.color}` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
        <div style={{ flex:1 }}>
          <span style={{ fontWeight:500, fontSize:14, color:"var(--color-text-primary)" }}>{task.title}</span>
          {task.desc && <p style={{ fontSize:12, color:"var(--color-text-secondary)", margin:"4px 0 6px", lineHeight:1.5 }}>{task.desc}</p>}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:4, alignItems:"center" }}>
            {task.tag && <span style={{ background:task.color+"18", color:task.color, border:`1px solid ${task.color}40`, borderRadius:99, fontSize:11, padding:"2px 8px", fontWeight:500 }}>{task.tag}</span>}
            {due && <span onClick={onGoToCalendar} title="Ver en calendario" style={{ background:dueBadgeColor+"18", color:dueBadgeColor, border:`1px solid ${dueBadgeColor}40`, borderRadius:99, fontSize:11, padding:"2px 8px", fontWeight:500, cursor:"pointer", userSelect:"none" }}>📅 {dueLabel} →</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:2, flexShrink:0 }}>
          <button onClick={() => onEdit(task)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", fontSize:13, padding:"2px 4px" }}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", fontSize:13, padding:"2px 4px" }}>🗑️</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:4, marginTop:8 }}>
        {COLS.filter(c => c !== task.col).map(c => (
          <button key={c} onClick={() => onMove(task.id, c)} style={{ fontSize:10, padding:"2px 8px", borderRadius:99, cursor:"pointer", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-secondary)", fontFamily:"inherit" }}>{COL_ICON[c]} {c}</button>
        ))}
      </div>
    </div>
  );
}

// ─── TaskModal ────────────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose }: {task:Task|null; onSave:(d:Omit<Task,"id">)=>void; onClose:()=>void}) {
  const [t, setT] = useState(task?.title || "");
  const [d, setD] = useState(task?.desc || "");
  const [tag, setTag] = useState(task?.tag || "");
  const [col, setCol] = useState<ColType>(task?.col || "Pendiente");
  const [ci, setCi] = useState(task ? COLORS.indexOf(task.color) : 0);
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"#ffffff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:480, boxShadow:"0 -4px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", maxHeight:"92dvh" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 2px" }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"#ddd" }} />
        </div>
        <div style={{ padding:"8px 20px 12px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontWeight:600, fontSize:18, color:"#222" }}>{task ? "Editar tarea" : "Nueva tarea"}</div>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Título *</label>
            <input value={t} onChange={e => setT(e.target.value)} placeholder="Título de la tarea"
              style={{ width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:10, border:"1.5px solid #ddd", fontSize:16, fontFamily:"inherit", color:"#222", background:"#fafafa", outline:"none" }} />
          </div>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Descripción</label>
            <textarea value={d} onChange={e => setD(e.target.value)} placeholder="Descripción (opcional)" rows={3}
              style={{ width:"100%", boxSizing:"border-box", resize:"none", fontFamily:"inherit", fontSize:15, padding:"12px 14px", borderRadius:10, border:"1.5px solid #ddd", background:"#fafafa", color:"#222", outline:"none" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Etiqueta</label>
              <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Ej: Examen"
                style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10, border:"1.5px solid #ddd", fontSize:14, fontFamily:"inherit", color:"#222", background:"#fafafa", outline:"none" }} />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>📅 Fecha límite</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10, border:"1.5px solid #ddd", fontSize:14, fontFamily:"inherit", color:"#222", background:"#fafafa", outline:"none" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Estado</label>
            <select value={col} onChange={e => setCol(e.target.value as ColType)}
              style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10, border:"1.5px solid #ddd", fontSize:14, fontFamily:"inherit", background:"#fafafa", color:"#222" }}>
              {COLS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:8, fontWeight:500 }}>Color</label>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {COLORS.map((c,i) => (
                <button key={c} onClick={() => setCi(i)} title={COLOR_NAMES[i]} style={{ width:32, height:32, borderRadius:"50%", background:c, cursor:"pointer", border:ci===i?"3px solid #222":"2px solid transparent", outline:ci===i?`2px solid ${c}`:"none", flexShrink:0 }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:"12px 20px 28px", borderTop:"1px solid #f0f0f0", display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={() => { if (t.trim()) onSave({ title:t.trim(), desc:d.trim(), tag:tag.trim(), col, color:COLORS[ci], dueDate: dueDate || undefined }); }}
            style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background: t.trim() ? "var(--color-background-info)" : "#aaa", color: t.trim() ? "var(--color-text-info)" : "white", cursor:"pointer", fontFamily:"inherit", fontSize:16, fontWeight:600 }}>
            Guardar tarea
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:12, border:"1px solid #ddd", background:"#fff", color:"#555", cursor:"pointer", fontFamily:"inherit", fontSize:15 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── EventModal (mobile-friendly bottom sheet) ───────────────────────────────
function EventModal({ date, event, onSave, onClose }: {date:Date|null; event:CalEvent|null; onSave:(d:CalEvent)=>void; onClose:()=>void}) {
  const [title, setTitle] = useState(event?.title || "");
  const [desc, setDesc] = useState(event?.desc || "");
  const [time, setTime] = useState(event?.time || "");
  const [ci, setCi] = useState(event ? COLORS.indexOf(event.color) : 0);
  const label = date ? `${date.getDate()} de ${MONTHS[date.getMonth()]}` : "";

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background:"#ffffff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:560,
        boxShadow:"0 -4px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column",
        maxHeight:"92dvh",
      }}>
        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 2px" }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"#ddd" }} />
        </div>
        {/* Header */}
        <div style={{ padding:"8px 20px 12px", borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:11, color:"#999", marginBottom:2, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
          <div style={{ fontWeight:600, fontSize:18, color:"#222" }}>{event ? "Editar evento" : "Nuevo evento"}</div>
        </div>
        {/* Scrollable body */}
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          {/* Título primero para fácil acceso */}
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Título *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nombre del evento"
              style={{ width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:10, border:"1.5px solid #ddd", fontSize:16, fontFamily:"inherit", color:"#222", background:"#fafafa", outline:"none" }}
            />
          </div>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:6, fontWeight:500 }}>Descripción</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Opcional"
              rows={3}
              style={{ width:"100%", boxSizing:"border-box", resize:"none", fontFamily:"inherit", fontSize:15, padding:"12px 14px", borderRadius:10, border:"1.5px solid #ddd", background:"#fafafa", color:"#222", outline:"none" }}
            />
          </div>
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:8, fontWeight:500 }}>Color</label>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {COLORS.map((c,i) => (
                <button key={c} onClick={() => setCi(i)} title={COLOR_NAMES[i]} style={{
                  width:34, height:34, borderRadius:"50%", background:c, cursor:"pointer",
                  border: ci===i ? "3px solid #222" : "2px solid transparent",
                  outline: ci===i ? `2px solid ${c}` : "none", flexShrink:0
                }} />
              ))}
            </div>
          </div>
          {/* Reloj al final */}
          <div>
            <label style={{ fontSize:12, color:"#666", display:"block", marginBottom:8, fontWeight:500 }}>Hora del evento</label>
            <div style={{ background:"#fafafa", borderRadius:12, border:"1px solid #eee", padding:"16px", display:"flex", justifyContent:"center" }}>
              <TimePicker value={time} onChange={setTime} />
            </div>
          </div>
        </div>
        {/* Footer fijo */}
        <div style={{ padding:"12px 20px 28px", borderTop:"1px solid #f0f0f0", display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={() => {
            if (title.trim() && date) {
              const evData: CalEvent = { title:title.trim(), desc:desc.trim(), time, color:COLORS[ci] };
              onSave(evData);
              exportSingleEvent(date, evData);
            }
          }} style={{
            width:"100%", padding:"14px", borderRadius:12, border:"none",
            background: title.trim() ? "#378ADD" : "#aaa",
            color:"white", cursor:"pointer", fontFamily:"inherit", fontSize:16, fontWeight:600,
          }}>📅 Guardar y abrir en Google Calendar</button>
          <button onClick={onClose} style={{
            width:"100%", padding:"12px", borderRadius:12, border:"1px solid #ddd", background:"#fff",
            color:"#555", cursor:"pointer", fontFamily:"inherit", fontSize:15
          }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}



// ─── Google Calendar export helpers ──────────────────────────────────────────
function toGCalDate(date: Date, time?: string): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  if (time) {
    const [h,m] = time.split(":").map(Number);
    const hh = String(h).padStart(2,"0");
    const mm = String(m).padStart(2,"0");
    return `${y}${mo}${d}T${hh}${mm}00`;
  }
  return `${y}${mo}${d}`;
}

function openInGoogleCalendar(date: Date, ev: CalEvent) {
  const start = toGCalDate(date, ev.time || undefined);
  let end: string;
  if (ev.time) {
    const [h,m] = ev.time.split(":").map(Number);
    const endH = h+1 > 23 ? 23 : h+1;
    end = toGCalDate(date, `${String(endH).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  } else {
    // all-day: end = next day
    const next = new Date(date); next.setDate(date.getDate()+1);
    end = toGCalDate(next);
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${start}/${end}`,
    ...(ev.desc ? { details: ev.desc } : {}),
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
}

function exportSingleEvent(date: Date, ev: CalEvent) {
  openInGoogleCalendar(date, ev);
}

function exportMonthEvents(events: Record<string, CalEvent[]>, year: number, month: number) {
  const items: {date: Date; ev: CalEvent}[] = [];
  for (const [key, evArr] of Object.entries(events)) {
    const parts = key.split("-").map(Number);
    const d = new Date(parts[0], parts[1], parts[2]);
    if (d.getFullYear()===year && d.getMonth()===month) {
      for (const ev of evArr) items.push({date:d, ev});
    }
  }
  if (items.length===0) { alert("No hay eventos este mes."); return; }
  // Open each event in Google Calendar (with small delay to avoid popup blocker)
  items.forEach(({date, ev}, i) => {
    setTimeout(() => openInGoogleCalendar(date, ev), i * 400);
  });
}

// ─── UpcomingEventCard ────────────────────────────────────────────────────────
function UpcomingEventCard({ label, title, desc, color, icon, onGoTo, onDelete, onGCal }: {
  label: string; title: string; desc?: string; color: string; icon: string;
  onGoTo: () => void; onDelete?: () => void; onGCal?: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <div style={{ position:"relative", background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"10px 12px", borderLeft:`3px solid ${color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, cursor:"pointer" }} onClick={onGoTo}>
          <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginBottom:2 }}>{icon} {label}</div>
          <div style={{ fontWeight:500, fontSize:13, color:"var(--color-text-primary)" }}>{title}</div>
          {desc && <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:2 }}>{desc}</div>}
        </div>
        <button onClick={() => setMenu(m => !m)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--color-text-tertiary)", padding:"0 2px", flexShrink:0, lineHeight:1 }}>⋯</button>
      </div>
      {menu && (
        <div style={{ position:"absolute", right:8, top:32, background:"#fff", border:"1px solid #e0e0e0", borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", zIndex:50, minWidth:170, overflow:"hidden" }}
          onMouseLeave={() => setMenu(false)}>
          <button onClick={() => { onGoTo(); setMenu(false); }} style={{ display:"block", width:"100%", padding:"11px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"inherit", color:"#222" }}>📅 Ver en calendario</button>
          {onGCal && <button onClick={() => { onGCal(); setMenu(false); }} style={{ display:"block", width:"100%", padding:"11px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"inherit", color:"#222", borderTop:"1px solid #f0f0f0" }}>🗓️ Abrir en Google Calendar</button>}
          {onDelete && <button onClick={() => { onDelete(); setMenu(false); }} style={{ display:"block", width:"100%", padding:"11px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"inherit", color:"#D85A30", borderTop:"1px solid #f0f0f0" }}>🗑️ Eliminar evento</button>}
        </div>
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({ events, tasks, onAddEvent, onEditEvent, onDeleteEvent }: {
  events: Record<string, CalEvent[]>;
  tasks: Task[];
  onAddEvent: (key:string, data:CalEvent) => void;
  onEditEvent: (key:string, idx:number, data:CalEvent) => void;
  onDeleteEvent: (key:string, idx:number) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date|null>(null);
  const [modal, setModal] = useState(false);
  const [editEv, setEditEv] = useState<number|null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

  const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const taskDateKey = (t: Task) => {
    if (!t.dueDate) return null;
    const d = new Date(t.dueDate + "T00:00:00");
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };
  // Build a map of dateKey -> tasks with that due date
  const tasksByDate: Record<string, Task[]> = {};
  for (const t of tasks) {
    const k = taskDateKey(t);
    if (k) { if (!tasksByDate[k]) tasksByDate[k] = []; tasksByDate[k].push(t); }
  }
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const todayKey = dateKey(today);
  const dayEvents = selectedDate ? (events[selectedKey!] || []) : [];
  const dayTasks = selectedDate ? (tasksByDate[selectedKey!] || []) : [];

  const prevMonth = () => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  const saveEvent = (data: CalEvent) => {
    const key = dateKey(selectedDate!);
    if (editEv !== null) onEditEvent(key, editEv, data);
    else onAddEvent(key, data);
    setModal(false); setEditEv(null);
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>
      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:14, padding:"1.25rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <button onClick={prevMonth} style={{ background:"none", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, padding:"4px 10px", cursor:"pointer", color:"var(--color-text-secondary)", fontFamily:"inherit", fontSize:14 }}>‹</button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontWeight:500, fontSize:15, color:"var(--color-text-primary)" }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button
              onClick={() => exportMonthEvents(events, viewYear, viewMonth)}
              title="Exportar todos los eventos del mes al calendario"
              style={{ fontSize:11, padding:"3px 8px", borderRadius:6, border:"1px solid var(--color-border-secondary)", background:"var(--color-background-secondary)", color:"var(--color-text-secondary)", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}
            >📅 Añadir mes a Google Calendar</button>
          </div>
          <button onClick={nextMonth} style={{ background:"none", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, padding:"4px 10px", cursor:"pointer", color:"var(--color-text-secondary)", fontFamily:"inherit", fontSize:14 }}>›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2, marginBottom:4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", padding:"4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2 }}>
          {Array.from({length:totalCells}).map((_,i) => {
            const dayNum = i - startDow + 1;
            if (dayNum<1||dayNum>lastDay.getDate()) return <div key={i} />;
            const d = new Date(viewYear, viewMonth, dayNum);
            const key = dateKey(d);
            const isToday = key===todayKey, isSelected=key===selectedKey;
            const evs = events[key] || [];
            return (
              <div key={i} onClick={() => setSelectedDate(d)} style={{
                borderRadius:8, padding:"6px 4px", cursor:"pointer", textAlign:"center", minHeight:42,
                background:isSelected?"var(--color-background-info)":isToday?"var(--color-background-secondary)":"transparent",
                border:isToday?"1px solid var(--color-border-info)":"1px solid transparent", transition:"background 0.1s"
              }}>
                <div style={{ fontSize:13, fontWeight:isToday?500:400, color:isSelected?"var(--color-text-info)":"var(--color-text-primary)" }}>{dayNum}</div>
                <div style={{ display:"flex", justifyContent:"center", gap:2, marginTop:2, flexWrap:"wrap" }}>
                  {evs.slice(0,3).map((ev,ei) => <div key={"e"+ei} style={{ width:5, height:5, borderRadius:"50%", background:ev.color }} />)}
                  {(tasksByDate[key]||[]).slice(0,2).map((tk,ti) => <div key={"t"+ti} style={{ width:5, height:5, borderRadius:2, background:tk.color }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:14, padding:"1.25rem" }}>
        {selectedDate ? (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:500, fontSize:15, color:"var(--color-text-primary)" }}>{selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}</div>
                <div style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>{selectedDate.toLocaleDateString("es-ES", {weekday:"long"})}</div>
              </div>
              <button onClick={() => { setEditEv(null); setModal(true); }} style={{ fontSize:12, padding:"5px 10px", borderRadius:8, background:"var(--color-background-info)", color:"var(--color-text-info)", border:"1px solid var(--color-border-info)", cursor:"pointer", fontFamily:"inherit" }}>+ Añadir</button>
            </div>
            {dayEvents.length===0 && dayTasks.length===0 && <div style={{ color:"var(--color-text-tertiary)", fontSize:13, textAlign:"center", padding:"2rem 0" }}>Sin eventos este día</div>}
            {dayTasks.length>0 && (
              <>
                <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Tareas</div>
                {dayTasks.map((tk,i) => (
                  <div key={i} style={{ borderLeft:`3px solid ${tk.color}`, background:tk.color+"10", borderRadius:"0 8px 8px 0", padding:"8px 10px", marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:500, fontSize:13, color:"var(--color-text-primary)" }}>📋 {tk.title}</div>
                        {tk.desc && <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{tk.desc}</div>}
                      </div>
                      <span style={{ fontSize:11, background:tk.color+"18", color:tk.color, border:`1px solid ${tk.color}40`, borderRadius:99, padding:"2px 8px", fontWeight:500, flexShrink:0, marginLeft:6 }}>{tk.col}</span>
                    </div>
                    {tk.tag && <div style={{ marginTop:4 }}><span style={{ background:tk.color+"18", color:tk.color, border:`1px solid ${tk.color}40`, borderRadius:99, fontSize:11, padding:"2px 8px", fontWeight:500 }}>{tk.tag}</span></div>}
                  </div>
                ))}
              </>
            )}
            {dayEvents.length>0 && dayTasks.length>0 && <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Eventos</div>}
            {dayEvents.map((ev,i) => (
              <div key={i} style={{ borderLeft:`3px solid ${ev.color}`, background:ev.color+"10", borderRadius:"0 8px 8px 0", padding:"8px 10px", marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    {ev.time && <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginBottom:2 }}>🕐 {ev.time}</div>}
                    <div style={{ fontWeight:500, fontSize:13, color:"var(--color-text-primary)" }}>{ev.title}</div>
                    {ev.desc && <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{ev.desc}</div>}
                  </div>
                  <div style={{ display:"flex", gap:2, alignItems:"center" }}>
                    <button
                      onClick={() => exportSingleEvent(selectedDate!, ev)}
                      title="Abrir en Google Calendar"
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-tertiary)", padding:"2px 3px" }}>📅</button>
                    <button onClick={() => { setEditEv(i); setModal(true); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-tertiary)", padding:2 }}>✏️</button>
                    <button onClick={() => onDeleteEvent(dateKey(selectedDate!), i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-tertiary)", padding:2 }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ color:"var(--color-text-tertiary)", fontSize:13, textAlign:"center", padding:"3rem 0" }}>Selecciona un día para ver o añadir eventos</div>
        )}
      </div>

      {modal && (
        <EventModal
          date={selectedDate}
          event={editEv!==null ? dayEvents[editEv] : null}
          onSave={saveEvent}
          onClose={() => { setModal(false); setEditEv(null); }}
        />
      )}
    </div>
  );
}

// ─── Study Tab ────────────────────────────────────────────────────────────────
function StudyTab() {
  const [docs, setDocs] = useState<StudyDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<StudyDoc|null>(null);
  const [chatMsgs, setChatMsgs] = useState<{role:string; text:string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [chatMsgs]);

  const processFile = useCallback(async (file: File) => {
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPDF && !isImage) {
      alert("Solo se admiten PDFs e imágenes (JPG, PNG, GIF, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const size = file.size > 1024*1024
        ? `${(file.size/(1024*1024)).toFixed(1)} MB`
        : `${Math.round(file.size/1024)} KB`;
      const doc: StudyDoc = {
        id: Date.now(),
        name: file.name,
        type: isPDF ? "pdf" : "image",
        base64,
        mediaType: file.type,
        size,
      };
      setDocs(prev => [...prev, doc]);
      setSelectedDoc(doc);
      setChatMsgs([{role:"assistant", text:`He cargado **${file.name}**. Puedes preguntarme cualquier cosa sobre este documento: resúmenes, conceptos clave, preguntas de repaso, etc.`}]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const sendChat = async () => {
    if (!chatInput.trim() || loading || !selectedDoc) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMsgs(prev => [...prev, {role:"user", text:userMsg}]);
    setLoading(true);

    try {
      const contentBlocks: any[] = [];

      if (selectedDoc.type === "pdf") {
        contentBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: selectedDoc.base64 }
        });
      } else {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: selectedDoc.mediaType, data: selectedDoc.base64 }
        });
      }

      contentBlocks.push({ type: "text", text: userMsg });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Eres un tutor de estudio experto. Analiza el documento proporcionado y responde las preguntas del estudiante de forma clara, pedagógica y concisa en español. Usa markdown ligero cuando ayude (negritas, listas). Si se pide un resumen, sé estructurado. Si se piden preguntas de repaso, crea preguntas variadas.",
          messages: [{ role: "user", content: contentBlocks }]
        })
      });

      const data = await res.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "No pude generar una respuesta.";
      setChatMsgs(prev => [...prev, {role:"assistant", text}]);
    } catch {
      setChatMsgs(prev => [...prev, {role:"assistant", text:"Error al procesar. Inténtalo de nuevo."}]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "📋 Resume este documento",
    "🔑 Dame los conceptos clave",
    "❓ Crea 5 preguntas de repaso",
    "💡 Explícame la idea principal",
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16, height:"calc(100vh - 140px)", minHeight:500 }}>
      {/* Sidebar: doc list */}
      <div>
        <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", letterSpacing:1, marginBottom:10, textTransform:"uppercase" }}>Documentos</div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border:`2px dashed ${dragging ? "var(--color-text-info)" : "var(--color-border-secondary)"}`,
            borderRadius:10, padding:"16px 10px", textAlign:"center", cursor:"pointer",
            background: dragging ? "var(--color-background-info)" : "transparent",
            marginBottom:10, transition:"all 0.15s"
          }}
        >
          <div style={{ fontSize:22, marginBottom:4 }}>📎</div>
          <div style={{ fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.4 }}>Arrastra PDF o imagen<br/>o haz clic para subir</div>
          <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleFile} style={{ display:"none" }} />
        </div>

        {docs.length === 0 && (
          <div style={{ color:"var(--color-text-tertiary)", fontSize:12, padding:"0.5rem 0" }}>Aún no hay documentos.</div>
        )}
        {docs.map(doc => (
          <div
            key={doc.id}
            onClick={() => {
              setSelectedDoc(doc);
              setChatMsgs([{role:"assistant", text:`Documento cargado: **${doc.name}**. ¿Qué quieres saber sobre él?`}]);
            }}
            style={{
              background: selectedDoc?.id === doc.id ? "var(--color-background-primary)" : "transparent",
              border:`0.5px solid ${selectedDoc?.id===doc.id ? "var(--color-border-secondary)" : "transparent"}`,
              borderRadius:8, padding:"8px 10px", marginBottom:4, cursor:"pointer"
            }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, overflow:"hidden" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{doc.type==="pdf" ? "📄" : "🖼️"}</span>
                <span style={{ fontWeight:500, fontSize:12, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{doc.name}</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setDocs(prev => prev.filter(d => d.id !== doc.id));
                  if (selectedDoc?.id === doc.id) { setSelectedDoc(null); setChatMsgs([]); }
                }}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-tertiary)", padding:2, flexShrink:0 }}
              >✕</button>
            </div>
            <div style={{ fontSize:10, color:"var(--color-text-tertiary)", marginTop:2, paddingLeft:22 }}>{doc.size}</div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem", display:"flex", flexDirection:"column" }}>
        {!selectedDoc ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--color-text-tertiary)", gap:12 }}>
            <div style={{ fontSize:40 }}>📚</div>
            <div style={{ fontSize:15, fontWeight:500, color:"var(--color-text-secondary)" }}>Tu espacio de estudio</div>
            <div style={{ fontSize:13, textAlign:"center", maxWidth:280, lineHeight:1.6 }}>
              Sube un PDF o imagen para empezar a estudiar con ayuda de IA. Puedes pedir resúmenes, conceptos clave y preguntas de repaso.
            </div>
          </div>
        ) : (
          <>
            {/* Doc preview bar */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, padding:"8px 12px", background:"var(--color-background-secondary)", borderRadius:8 }}>
              <span style={{ fontSize:18 }}>{selectedDoc.type==="pdf" ? "📄" : "🖼️"}</span>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontWeight:500, fontSize:13, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selectedDoc.name}</div>
                <div style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>{selectedDoc.size} · {selectedDoc.type.toUpperCase()}</div>
              </div>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }} />
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
              {chatMsgs.map((msg, i) => (
                <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:8 }}>
                  {msg.role==="assistant" && (
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #CECBF6, #9FE1CB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>📚</div>
                  )}
                  <div style={{
                    maxWidth:"75%", padding:"10px 14px",
                    borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                    background:msg.role==="user"?"var(--color-background-info)":"var(--color-background-secondary)",
                    color:msg.role==="user"?"var(--color-text-info)":"var(--color-text-primary)",
                    border:"0.5px solid var(--color-border-tertiary)", fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap"
                  }}>
                    {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #CECBF6, #9FE1CB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>📚</div>
                  <div style={{ padding:"10px 14px", borderRadius:"14px 14px 14px 4px", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-secondary)", fontSize:14 }}><span style={{letterSpacing:3}}>···</span></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            {chatMsgs.length <= 1 && (
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {quickPrompts.map(p => (
                  <button key={p} onClick={() => { setChatInput(p.replace(/^[^\s]+\s/,"")); }} style={{
                    fontSize:12, padding:"5px 10px", borderRadius:99, cursor:"pointer",
                    background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-secondary)",
                    color:"var(--color-text-secondary)", fontFamily:"inherit", whiteSpace:"nowrap"
                  }}>{p}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && sendChat()}
                placeholder="Pregunta sobre el documento..."
                style={{ flex:1 }}
              />
              <button
                onClick={sendChat}
                disabled={loading || !chatInput.trim()}
                style={{ padding:"8px 18px", background:"var(--color-background-info)", color:"var(--color-text-info)", border:"1px solid var(--color-border-info)", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontWeight:500, opacity:loading||!chatInput.trim()?0.6:1 }}
              >Enviar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("board");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Record<string, CalEvent[]>>({});
  const [modal, setModal] = useState<string|null>(null);
  const [editTask, setEditTask] = useState<Task|null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [editNoteId, setEditNoteId] = useState<number|null>(null);
  const [chatMsgs, setChatMsgs] = useState([{role:"assistant", text:"Hola 👋 Puedo ayudarte con tus tareas, notas y eventos del calendario. ¿En qué te ayudo?"}]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const now = new Date().toLocaleDateString("es-ES", {weekday:"long", day:"numeric", month:"long"});

  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [chatMsgs]);

  const addTask = (data: Omit<Task,"id">) => {
    if (editTask) setTasks(ts => ts.map(t => t.id===editTask.id ? {...t,...data} : t));
    else setTasks(ts => [...ts, {id:Date.now(), ...data}]);
    setModal(null); setEditTask(null);
  };
  const deleteTask = (id: number) => setTasks(ts => ts.filter(t => t.id!==id));
  const moveTask = (id: number, col: ColType) => setTasks(ts => ts.map(t => t.id===id ? {...t, col} : t));
  const openEdit = (task: Task) => { setEditTask(task); setModal("task"); };

  const saveNote = () => {
    if (!noteTitle.trim() && !noteText.trim()) return;
    if (editNoteId) {
      setNotes(ns => ns.map(n => n.id===editNoteId ? {...n, title:noteTitle||"Sin título", text:noteText, updated:new Date().toLocaleDateString("es-ES")} : n));
      setEditNoteId(null);
    } else {
      setNotes(ns => [...ns, {id:Date.now(), title:noteTitle||"Sin título", text:noteText, created:new Date().toLocaleDateString("es-ES")}]);
    }
    setNoteTitle(""); setNoteText("");
  };
  const editNote = (n: Note) => { setNoteTitle(n.title); setNoteText(n.text); setEditNoteId(n.id); };
  const deleteNote = (id: number) => {
    setNotes(ns => ns.filter(n => n.id!==id));
    if (editNoteId===id) { setNoteTitle(""); setNoteText(""); setEditNoteId(null); }
  };

  const addEvent = (key: string, data: CalEvent) => setEvents(ev => ({...ev, [key]:[...(ev[key]||[]), data]}));
  const editEvent = (key: string, idx: number, data: CalEvent) => setEvents(ev => ({...ev, [key]:ev[key].map((e,i) => i===idx ? data : e)}));
  const deleteEvent = (key: string, idx: number) => setEvents(ev => ({...ev, [key]:ev[key].filter((_,i) => i!==idx)}));
  const totalEvents = Object.values(events).reduce((s,arr) => s+arr.length, 0);

  const sendChat = async () => {
    if (!chatInput.trim()||loading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMsgs(prev => [...prev, {role:"user", text:userMsg}]);
    setLoading(true);
    const evSummary = Object.entries(events).map(([k,arr]) => arr.map(e => `- [${k}] "${e.title}"${e.time?" a las "+e.time:""}${e.desc?": "+e.desc:""}`).join("\n")).join("\n");
    const context = `Eres un asistente de productividad personal. El usuario tiene guardado:\n\nTAREAS:\n${tasks.length===0?"No hay tareas.":tasks.map(t=>`- [${t.col}] "${t.title}"${t.desc?": "+t.desc:""}${t.tag?" ["+t.tag+"]":""}`).join("\n")}\n\nNOTAS:\n${notes.length===0?"No hay notas.":notes.map(n=>`- "${n.title}": ${n.text}`).join("\n")}\n\nEVENTOS:\n${totalEvents===0?"No hay eventos.":evSummary}\n\nResponde de forma concisa, amable y útil en español.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, system:context, messages:[{role:"user",content:userMsg}]})
      });
      const data = await res.json();
      setChatMsgs(prev => [...prev, {role:"assistant", text:data.content?.map((b:any)=>b.text||"").join("")||"No pude generar una respuesta."}]);
    } catch { setChatMsgs(prev => [...prev, {role:"assistant", text:"Error al conectar."}]); }
    setLoading(false);
  };

  const tabStyle = (active: boolean) => ({
    padding:"7px 13px", border:"none", cursor:"pointer", fontFamily:"inherit",
    fontSize:13, fontWeight:active?500:400, borderRadius:8,
    background:active?"var(--color-background-primary)":"transparent",
    color:active?"var(--color-text-primary)":"var(--color-text-secondary)",
    boxShadow:active?"0 0 0 0.5px var(--color-border-secondary)":"none",
    transition:"all 0.15s"
  });

  return (
    <div style={{ padding:"1.25rem 1rem 1rem", maxWidth:960, margin:"0 auto", fontFamily:"var(--font-sans)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Avatar />
          <div>
            <div style={{ fontWeight:500, fontSize:16, color:"var(--color-text-primary)", lineHeight:1.2 }}>Mi espacio</div>
            <div style={{ fontSize:12, color:"var(--color-text-secondary)", textTransform:"capitalize" }}>{now}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:3, background:"var(--color-background-secondary)", borderRadius:10, padding:4 }}>
          {[["board","📋 Tablero"],["calendar","📅 Calendario"],["notes","📝 Notas"],["study","📚 Estudio"],["chat","✨ Asistente"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab===id)}>{label}</button>
          ))}
        </div>
      </div>

      {tab==="board" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:"1.25rem" }}>
            <StatCard label="Total tareas" value={tasks.length} accent="#888780" />
            <StatCard label="Pendientes" value={tasks.filter(t=>t.col==="Pendiente").length} accent="#888780" />
            <StatCard label="En progreso" value={tasks.filter(t=>t.col==="En progreso").length} accent="#378ADD" />
            <StatCard label="Completadas" value={tasks.filter(t=>t.col==="Completado").length} accent="#1D9E75" />
          </div>
          <ProgressBar tasks={tasks} />
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <button onClick={() => { setEditTask(null); setModal("task"); }} style={{ padding:"8px 16px", borderRadius:8, background:"var(--color-background-info)", color:"var(--color-text-info)", border:"1px solid var(--color-border-info)", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500 }}>+ Nueva tarea</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
            {COLS.map(col => {
              const ct = tasks.filter(t => t.col===col);
              const pct = tasks.length ? Math.round((ct.length/tasks.length)*100) : 0;
              return (
                <div key={col} style={{ background:COL_BG[col]+"55", border:`0.5px solid ${COL_ACCENT[col]}30`, borderRadius:12, padding:12 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color:COL_ACCENT[col], fontSize:14 }}>{COL_ICON[col]}</span>
                      <span style={{ fontWeight:500, fontSize:13, color:COL_ACCENT[col] }}>{col}</span>
                    </div>
                    <span style={{ fontSize:11, background:COL_ACCENT[col]+"18", color:COL_ACCENT[col], borderRadius:99, padding:"2px 8px", fontWeight:500 }}>{ct.length}</span>
                  </div>
                  <div style={{ height:3, background:COL_ACCENT[col]+"22", borderRadius:99, marginBottom:10, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:COL_ACCENT[col], borderRadius:99, transition:"width 0.4s" }} />
                  </div>
                  {ct.map(task => <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={deleteTask} onMove={moveTask} onGoToCalendar={() => setTab("calendar")} />)}
                  {ct.length===0 && <div style={{ textAlign:"center", color:"var(--color-text-tertiary)", fontSize:12, padding:"1rem 0" }}>Sin tareas</div>}
                </div>
              );
            })}
          </div>

          {/* Upcoming events panel */}
          {(() => {
            const today = new Date();
            const upcoming: {date: Date; ev: CalEvent; key: string; idx: number}[] = [];
            for (let i=0; i<14; i++) {
              const d = new Date(today); d.setDate(today.getDate()+i);
              const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const evs = events[key] || [];
              evs.forEach((ev, idx) => upcoming.push({date:d, ev, key, idx}));
            }
            // Also include tasks with due date in next 14 days
            const upcomingTasks: {date: Date; task: Task}[] = [];
            for (const t of tasks) {
              if (!t.dueDate) continue;
              const d = new Date(t.dueDate+"T00:00:00");
              const diff = Math.round((d.getTime()-today.getTime())/(1000*60*60*24));
              if (diff>=0 && diff<14) upcomingTasks.push({date:d, task:t});
            }
            if (upcoming.length===0 && upcomingTasks.length===0) return null;
            return (
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", letterSpacing:1, marginBottom:10, textTransform:"uppercase" }}>Próximos 14 días</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:8 }}>
                  {upcoming.map(({date, ev, key, idx}, i) => (
                    <UpcomingEventCard key={"ev"+i}
                      label={date.toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"}) + (ev.time ? ` · ${ev.time}` : "")}
                      title={ev.title} desc={ev.desc} color={ev.color} icon="📅"
                      onGoTo={() => setTab("calendar")}
                      onDelete={() => deleteEvent(key, idx)}
                      onGCal={() => exportSingleEvent(date, ev)}
                    />
                  ))}
                  {upcomingTasks.map(({date, task}, i) => (
                    <UpcomingEventCard key={"tk"+i}
                      label={date.toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"})}
                      title={task.title} desc={task.desc} color={task.color} icon="📋"
                      onGoTo={() => setTab("calendar")}
                      onDelete={undefined}
                      onGCal={undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab==="calendar" && (
        <Calendar events={events} tasks={tasks} onAddEvent={addEvent} onEditEvent={editEvent} onDeleteEvent={deleteEvent} />
      )}

      {tab==="notes" && (
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:500, color:"var(--color-text-tertiary)", letterSpacing:1, marginBottom:10, textTransform:"uppercase" }}>Notas guardadas</div>
            <button onClick={() => { setEditNoteId(null); setNoteTitle(""); setNoteText(""); }} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"0.5px dashed var(--color-border-secondary)", background:"transparent", color:"var(--color-text-secondary)", cursor:"pointer", fontFamily:"inherit", fontSize:13, marginBottom:8 }}>+ Nueva nota</button>
            {notes.length===0 && <div style={{ color:"var(--color-text-tertiary)", fontSize:12, padding:"0.5rem 0" }}>Aún no hay notas.</div>}
            {notes.map(n => (
              <div key={n.id} onClick={() => editNote(n)} style={{ background:editNoteId===n.id?"var(--color-background-primary)":"transparent", border:`0.5px solid ${editNoteId===n.id?"var(--color-border-secondary)":"transparent"}`, borderRadius:8, padding:"8px 10px", marginBottom:4, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:500, fontSize:13, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>{n.title}</span>
                  <button onClick={e => { e.stopPropagation(); deleteNote(n.id); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--color-text-tertiary)", padding:2 }}>✕</button>
                </div>
                <div style={{ fontSize:11, color:"var(--color-text-tertiary)", marginTop:2 }}>{n.updated||n.created}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem", display:"flex", flexDirection:"column" }}>
            <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título de la nota" style={{ marginBottom:10, fontSize:16, fontWeight:500, border:"none", background:"transparent", color:"var(--color-text-primary)", fontFamily:"inherit", outline:"none", padding:0, borderBottom:"1px solid var(--color-border-tertiary)", paddingBottom:8 }} />
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Escribe tus apuntes aquí..." rows={12} style={{ flex:1, resize:"none", border:"none", background:"transparent", color:"var(--color-text-primary)", fontFamily:"inherit", fontSize:14, lineHeight:1.7, outline:"none", padding:0 }} />
            <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end", borderTop:"0.5px solid var(--color-border-tertiary)", paddingTop:12 }}>
              {editNoteId && <button onClick={() => { setEditNoteId(null); setNoteTitle(""); setNoteText(""); }}>Descartar</button>}
              <button onClick={saveNote} style={{ background:"var(--color-background-info)", color:"var(--color-text-info)", border:"1px solid var(--color-border-info)" }}>{editNoteId?"Actualizar nota":"Guardar nota"}</button>
            </div>
          </div>
        </div>
      )}

      {tab==="study" && <StudyTab />}

      {tab==="chat" && (
        <div>
          <div style={{ background:"var(--color-background-secondary)", borderRadius:12, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:10, border:"0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }} />
            <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>Acceso a <b style={{ fontWeight:500, color:"var(--color-text-primary)" }}>{tasks.length} tareas</b>, <b style={{ fontWeight:500, color:"var(--color-text-primary)" }}>{notes.length} notas</b> y <b style={{ fontWeight:500, color:"var(--color-text-primary)" }}>{totalEvents} eventos</b>.</span>
          </div>
          <div style={{ height:400, overflowY:"auto", marginBottom:12, display:"flex", flexDirection:"column", gap:10 }}>
            {chatMsgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:8 }}>
                {m.role==="assistant" && <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #CECBF6, #9FE1CB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>✨</div>}
                <div style={{ maxWidth:"72%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?"var(--color-background-info)":"var(--color-background-primary)", color:m.role==="user"?"var(--color-text-info)":"var(--color-text-primary)", border:"0.5px solid var(--color-border-tertiary)", fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #CECBF6, #9FE1CB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✨</div>
                <div style={{ padding:"10px 14px", borderRadius:"14px 14px 14px 4px", background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-secondary)", fontSize:14 }}><span style={{letterSpacing:3}}>···</span></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} placeholder="Pregunta sobre tus tareas, notas o eventos..." style={{ flex:1 }} />
            <button onClick={sendChat} disabled={loading} style={{ padding:"8px 18px", background:"var(--color-background-info)", color:"var(--color-text-info)", border:"1px solid var(--color-border-info)", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>Enviar</button>
          </div>
        </div>
      )}

      {modal==="task" && <TaskModal task={editTask} onSave={addTask} onClose={() => { setModal(null); setEditTask(null); }} />}
    </div>
  );
}
