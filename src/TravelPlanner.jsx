import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  X,
  Check,
  CloudSun,
  Plane,
  Map,
  Navigation,
  ArrowUp,
  ArrowDown,
  Car,
  GripVertical,
  CloudSnow,
  Sun,
  CloudRain,
  Edit3,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Info,
  Coins,
  Languages,
  ArrowRightLeft,
  Tag,
  FileText,
  User,
  UserPlus,
  MapPin,
  ShoppingBag,
  Wallet,
  Settings,
  Footprints,
  Bus,
} from "lucide-react";

// ==========================================
// 1. Constants & Helpers
// ==========================================

const DEFAULT_THEME_COLOR = "blue";

const THEMES = {
  blue: {
    primary: "bg-blue-600",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-600",
    border: "border-blue-600",
    ring: "ring-blue-600",
  },
  pink: {
    primary: "bg-pink-500",
    secondary: "bg-pink-50",
    text: "text-pink-600",
    dot: "bg-pink-500",
    border: "border-pink-500",
    ring: "ring-pink-500",
  },
  purple: {
    primary: "bg-purple-600",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-600",
    border: "border-purple-600",
    ring: "ring-purple-600",
  },
  green: {
    primary: "bg-teal-500",
    secondary: "bg-teal-50",
    text: "text-teal-600",
    dot: "bg-teal-500",
    border: "border-teal-500",
    ring: "ring-teal-500",
  },
  orange: {
    primary: "bg-orange-500",
    secondary: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-500",
    border: "border-orange-500",
    ring: "ring-orange-500",
  },
};

const INITIAL_TRIP = {
  destination: "北海道 Hokkaido",
  startDate: new Date().toISOString().split("T")[0],
  duration: 5,
  coverImage:
    "https://images.unsplash.com/photo-1542051841-863536f30d9e?q=80&w=2070&auto=format&fit=crop",
  currency: "JPY",
  exchangeRate: 0.21,
  members: ["我", "小明", "阿美"],
  locationQuery: "",
  weatherLat: null,
  weatherLon: null,
  weatherTimezone: "Asia/Tokyo",
};

const MOCK_WEATHER = {
  1: {
    temp: "0°",
    feel: "-5°",
    condition: "大雪/降雪",
    icon: CloudSnow,
    color: "text-blue-400",
    bg: "bg-blue-50",
  },
  2: {
    temp: "-2°",
    feel: "-8°",
    condition: "多雲時晴",
    icon: CloudSun,
    color: "text-gray-400",
    bg: "bg-gray-50",
  },
  3: {
    temp: "2°",
    feel: "-1°",
    condition: "晴朗",
    icon: Sun,
    color: "text-orange-400",
    bg: "bg-orange-50",
  },
  4: {
    temp: "-1°",
    feel: "-4°",
    condition: "小雪",
    icon: CloudSnow,
    color: "text-blue-300",
    bg: "bg-blue-50",
  },
  5: {
    temp: "1°",
    feel: "-2°",
    condition: "陰天",
    icon: CloudRain,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
};
// 簡單地把常用目的地對應到經緯度（可以自己再補）
const CITY_COORDS = {
  "北海道 Hokkaido": { lat: 43.0667, lon: 141.35 }, // 札幌附近
  北海道: { lat: 43.0667, lon: 141.35 },
};

// 把 Open-Meteo 的 weathercode 轉成文字
const getWeatherText = (code) => {
  if (code === 0) return "晴朗";
  if ([1, 2].includes(code)) return "多雲時晴";
  if (code === 3) return "陰天";
  if ([45, 48].includes(code)) return "霧";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "降雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "降雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "多變";
};

const getTripDateObj = (startDateStr, dayOffset) => {
  const base = new Date(startDateStr);

  // startDateStr 可能是 "" 或格式不合法，避免 Invalid Date
  const safeBase = isValidDate(base) ? base : new Date();

  const d = new Date(safeBase);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (Number(dayOffset || 1) - 1));
  return d;
};

const formatMMDD = (dateObj) => {
  return dateObj.toLocaleDateString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
  });
};

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

const formatDateForInput = (dateObj) => {
  if (!isValidDate(dateObj)) return "";
  return dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
};

const getDayDiff = (startDateStr, targetDateStr) => {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  const diffTime = target - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ==========================================
// 2. Shared Components
// ==========================================

const NavButton = ({ icon: Icon, label, active, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 transition-all duration-300 ${
      active ? `${theme.text} scale-110` : "text-gray-300 hover:text-gray-400"
    }`}
  >
    <Icon size={active ? 26 : 24} strokeWidth={active ? 2.5 : 2} />
    <span
      className={`text-[10px] mt-1 font-medium ${
        active ? "opacity-100" : "opacity-0"
      } transition-opacity`}
    >
      {label}
    </span>
  </button>
);

const InputGroup = ({ label, type = "text", value, onChange, placeholder }) => {
  const isPicker = type === "time" || type === "date";

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-500 mb-1 group-focus-within:text-blue-500 transition-colors">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent",
          "focus:bg-white focus:border-blue-500 outline-none transition-all",
          "font-medium text-gray-800 placeholder-gray-300",
          // ✅ 給 iOS time/date 右側 icon 留空間，避免被吃掉
          isPicker ? "pr-12" : "",
          // ✅ 避免某些手機/瀏覽器把內建 icon 裁切
          "overflow-visible",
          // ✅ 讓 iOS 的日期/時間欄位看起來更一致（可留可不留）
          "appearance-none",
        ].join(" ")}
      />
    </div>
  );
};


const MapButton = ({ type, query }) => {
  const openMap = (e) => {
    e.stopPropagation();
    window.open(
      type === "google"
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            query
          )}`
        : `https://map.naver.com/v5/search/${encodeURIComponent(query)}`,
      "_blank"
    );
  };
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={openMap}
      className="px-2.5 py-1.5 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-500 hover:bg-gray-100 flex items-center gap-1 transition-colors border border-gray-200"
    >
      {type === "google" ? <Map size={10} /> : <Navigation size={10} />}
      {type === "google" ? "Google" : "Naver"}
    </button>
  );
};

const ToolBtn = ({ icon: Icon, onClick, label }) => (
  <button
    onClick={onClick}
    className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
    title={label}
  >
    <Icon size={20} />
  </button>
);

const CoverUploadSection = ({ tempCoverImage, setTempCoverImage }) => {
  const coverFileInputRef = useRef(null);
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        封面照片
      </label>
      <div
        className="w-full h-40 rounded-xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors"
        onClick={() => coverFileInputRef.current.click()}
      >
        <img
          src={tempCoverImage}
          className="w-full h-full object-cover"
          alt="preview"
          onError={(e) =>
            (e.target.src = "https://via.placeholder.com/400x200?text=No+Image")
          }
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex flex-col items-center justify-center text-white transition-colors">
          <Camera size={24} className="mb-1" />
          <span className="text-xs font-bold">點擊更換封面</span>
        </div>
        <input
          type="file"
          ref={coverFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <LinkIcon size={14} className="text-gray-400" />
        <input
          type="text"
          placeholder="或貼上圖片網址..."
          value={
            tempCoverImage && tempCoverImage.startsWith("http")
              ? tempCoverImage
              : ""
          }
          onChange={(e) => setTempCoverImage(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

// ==========================================
// 3. Modals
// ==========================================

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      {/* 背景遮罩（只負責關閉） */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Modal 本體 */}
      <div className="relative z-10 bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content：一定要可滾動 + 底部留空，避免被底部工具列吃掉 */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 pb-28">
          {children}
        </div>
      </div>
    </div>
  );
};

const EventModal = ({
  isOpen,
  onClose,
  isEdit,
  formEvent,
  setFormEvent,
  onSave,
  theme,
}) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormEvent((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormEvent((prev) => ({ ...prev, image: null }));

  // ---- 交通時間：從總分鐘拆成時/分 ----
  const totalMinutes = formEvent.travelTime || 0;
  const travelHours = Math.floor(totalMinutes / 60);
  const travelMinutes = totalMinutes % 60;

  const clampNonNegative = (n) => (isNaN(n) || n < 0 ? 0 : n);

  const updateTravelTime = (minutes) => {
    const safe = clampNonNegative(minutes);
    setFormEvent((prev) => ({ ...prev, travelTime: safe }));
  };

  const handleHoursInput = (e) => {
    const h = clampNonNegative(parseInt(e.target.value, 10));
    updateTravelTime(h * 60 + travelMinutes);
  };

  const handleMinutesInput = (e) => {
    let m = clampNonNegative(parseInt(e.target.value, 10));
    let h = travelHours;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
    updateTravelTime(h * 60 + m);
  };

  const adjustHours = (delta) => {
    updateTravelTime(totalMinutes + delta * 60);
  };

  const adjustMinutes = (delta) => {
    updateTravelTime(totalMinutes + delta);
  };

  const transportMode = formEvent.travelMode || "car";
  const transportOptions = [
    { key: "walk", label: "步行", icon: Footprints },
    { key: "car", label: "汽車", icon: Car },
    { key: "transit", label: "大眾運輸", icon: Bus },
    { key: "plane", label: "飛機", icon: Plane },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "編輯行程" : "新增行程"}
    >
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <InputGroup
              label="時間"
              type="time"
              value={formEvent.time}
              onChange={(e) =>
                setFormEvent({ ...formEvent, time: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <InputGroup
              label="日期"
              type="date"
              value={formEvent.tempDate}
              onChange={(e) =>
                setFormEvent({ ...formEvent, tempDate: e.target.value })
              }
            />
          </div>
        </div>

        <InputGroup
          label="標題"
          placeholder="行程名稱"
          value={formEvent.title}
          onChange={(e) =>
            setFormEvent({ ...formEvent, title: e.target.value })
          }
        />

        <InputGroup
          label="地點"
          placeholder="用於地圖搜尋"
          value={formEvent.location}
          onChange={(e) =>
            setFormEvent({ ...formEvent, location: e.target.value })
          }
        />

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            相簿照片
          </label>
          <div className="space-y-3">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer bg-gray-50/50"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {formEvent.image ? (
                <div
                  className="relative inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={formEvent.image}
                    alt="preview"
                    className="h-32 rounded-lg object-cover shadow-sm border border-gray-200"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-white text-gray-500 rounded-full p-1 shadow-md hover:text-red-500 border border-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20">
                  <Camera size={24} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">
                    點擊選擇裝置照片
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <InputGroup
          label="備註"
          placeholder="航班、訂位代號..."
          value={formEvent.note}
          onChange={(e) => setFormEvent({ ...formEvent, note: e.target.value })}
        />

        {/* 交通方式 + 時間 */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Car size={16} />
            交通方式與時間 (前往下一站)
          </label>

          {/* 交通方式選擇 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {transportOptions.map(({ key, label, icon: Icon }) => {
              const active = transportMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setFormEvent((prev) => ({ ...prev, travelMode: key }))
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 border transition-all ${
                    active
                      ? `${theme.secondary} ${theme.text} border-transparent shadow-sm`
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* 時/分 手動輸入 + 上下加減 */}
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {/* 小時 */}
              <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 flex flex-col items-center w-24">
                <span className="text-[10px] text-gray-400 mb-1">小時</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustHours(-1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowDown size={14} className="text-gray-500" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={travelHours}
                    onChange={handleHoursInput}
                    className="w-10 text-center text-sm font-bold text-gray-800 outline-none appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => adjustHours(1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowUp size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* 分鐘 */}
              <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 flex flex-col items-center w-24">
                <span className="text-[10px] text-gray-400 mb-1">分鐘</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustMinutes(-5)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowDown size={14} className="text-gray-500" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={travelMinutes}
                    onChange={handleMinutesInput}
                    className="w-10 text-center text-sm font-bold text-gray-800 outline-none appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => adjustMinutes(5)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowUp size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 text-right text-xs text-gray-500 pr-1">
              總計&nbsp;
              <span className="font-bold text-gray-800">
                {formatDuration(totalMinutes)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          className={`w-full py-3 rounded-xl ${theme.primary} text-white font-bold mt-2 hover:opacity-90 active:scale-[0.98] transition-all`}
        >
          {isEdit ? "儲存變更" : "確認新增"}
        </button>
      </div>
    </Modal>
  );
};

const CurrencyModal = ({ isOpen, onClose, theme }) => {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState("TWD");
  const [toCurrency, setToCurrency] = useState("JPY");
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: "TWD", name: "新台幣" },
    { code: "JPY", name: "日圓" },
    { code: "KRW", name: "韓元" },
    { code: "USD", name: "美金" },
    { code: "CNY", name: "人民幣" },
    { code: "EUR", name: "歐元" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fromCurrency, toCurrency]);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();
      setRate(data.rates[toCurrency]);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = rate ? (amount * rate).toFixed(2) : "---";

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="即時匯率計算">
      <div className="space-y-6 py-2">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            金額
          </label>
          <input
            type="number"
            value={amount.toString()}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setAmount(isNaN(val) ? 0 : val);
            }}
            className="w-full text-3xl font-bold bg-transparent outline-none text-gray-800"
          />
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              持有貨幣
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none appearance-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className={`p-3 rounded-full ${theme.primary} text-white shadow-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10`}
          >
            <ArrowRightLeft size={18} />
          </button>

          <div className="flex-1 space-y-1 text-right">
            <label className="block text-xs font-medium text-gray-500">
              目標貨幣
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none appearance-none text-right"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[120px]">
          {loading ? (
            <div className="text-gray-400 flex items-center gap-2">
              <Coins size={16} className="animate-spin" /> 計算中...
            </div>
          ) : rate ? (
            <>
              <div className="text-sm text-gray-500 mb-1">換算結果</div>
              <div className={`text-4xl font-black ${theme.text}`}>
                {convertedAmount} <span className="text-xl">{toCurrency}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                匯率: 1 {fromCurrency} ≈ {rate.toFixed(4)} {toCurrency}
              </div>
            </>
          ) : (
            <div className="text-red-400">無法取得匯率資訊</div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          資料來源僅供參考，實際匯率請以銀行為準。
        </p>
      </div>
    </Modal>
  );
};

// ==========================================
// 4. Sub Views (Defined BEFORE usage)
// ==========================================

function SettingsView({
  trip,
  setTrip,
  tripList,
  activeTripId,
  setTripList,
  theme,
  setTheme,
  themes,
  onSelectTrip,
  onCreateTrip,
  onDeleteTrip,
}) {
  // ================================
  // State
  // ================================
  const [isTripEditOpen, setIsTripEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [draftTrip, setDraftTrip] = useState(null);
  // ✅ 地點搜尋（用來抓天氣）
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);

  const [tripForm, setTripForm] = useState({
    id: null,
    name: "",
    startDate: "",
    duration: 5,
    coverImage: "",
    participants: [],
  });

  useEffect(() => {
    const q = (draftTrip?.locationQuery || "").trim();
    if (q.length < 2) {
      setGeoResults([]);
      setGeoLoading(false);
      return;
    }

    let cancelled = false;
    setGeoLoading(true);

    fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        q
      )}&count=8&language=zh&format=json`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setGeoResults(Array.isArray(data?.results) ? data.results : []);
      })
      .catch(() => {
        if (!cancelled) setGeoResults([]);
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draftTrip?.locationQuery]);

  // 切換行程
  const handleSelectTripClick = (id) => {
    if (onSelectTrip) onSelectTrip(id);
  };

  // 新增行程：由 TravelPlanner 建立，這裡只負責「開啟編輯 modal」
  const handleCreateTripClick = () => {
    const newId = onCreateTrip?.(); // ✅ TravelPlanner 會 return newId
    if (!newId) return;

    const newTrip = tripList.find((x) => x.id === newId) || {
      id: newId,
      name: "新行程",
      startDate: "",
      duration: 5,
      coverImage: "",
      members: [],
    };

    openTripEdit(newTrip); // ✅ 直接跳編輯畫面
  };

  // 刪除行程
  const handleDeleteTripClick = (id) => {
    if (tripList.length <= 1) {
      alert("至少要保留一個行程。");
      return;
    }
    if (
      !window.confirm(
        "刪除此行程後，行程表 / 行李清單 / 分帳紀錄都會一併刪除，確定嗎？"
      )
    ) {
      return;
    }
    if (onDeleteTrip) onDeleteTrip(id);
  };

  const [participantInput, setParticipantInput] = useState("");
  const tripCoverFileRef = useRef(null);

  // ================================
  // Helper：顯示每個行程的日期區間
  // ================================
  const formatTripRange = (t) => {
    if (!t.startDate || !t.duration) return "尚未設定日期";

    const start = new Date(t.startDate);
    const end = new Date(t.startDate);
    end.setDate(end.getDate() + (t.duration || 1) - 1);

    const fmt = (d) =>
      d.toLocaleDateString("zh-TW", {
        month: "2-digit",
        day: "2-digit",
      });

    return `${fmt(start)} ~ ${fmt(end)}`;
  };
  // ================================
  // 行程設定 Modal：開啟 / 填入資料
  // ================================
  const openTripEdit = (t) => {
    setEditingTrip(t);

    setTripForm({
      id: t.id,
      name: t.name || "",
      startDate: t.startDate || "",
      duration: t.duration || 5,
      coverImage: t.coverImage || "",
      participants: t.members || [],
    });

    // ✅ 這行一定要有：地點/天氣相關都放 draftTrip
    setDraftTrip({
      locationQuery: t.locationQuery || "",
      weatherLat: t.weatherLat ?? null,
      weatherLon: t.weatherLon ?? null,
      weatherTimezone: t.weatherTimezone || "Asia/Taipei",
      weatherMode: t.weatherMode || "live",
      weatherSnapshot: t.weatherSnapshot || null,
      weatherUpdatedAt: t.weatherUpdatedAt || null,
    });

    setParticipantInput("");
    setIsTripEditOpen(true);
  };
  const closeTripEdit = () => {
    setIsTripEditOpen(false);
    setEditingTrip(null);
    setDraftTrip(null);
  };
  // ================================
  // 行程設定：圖片上傳（用圖庫）
  // ================================
  const handleTripCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTripForm((prev) => ({
        ...prev,
        coverImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ================================
  // 行程設定：參與成員
  // ================================
  const handleAddParticipant = () => {
    const name = participantInput.trim();
    if (!name) return;
    setTripForm((prev) =>
      prev.participants.includes(name)
        ? prev
        : { ...prev, participants: [...prev.participants, name] }
    );
    setParticipantInput("");
  };

  const handleRemoveParticipant = (name) => {
    setTripForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p !== name),
    }));
  };

  // Enter 新增成員
  const handleParticipantKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  // ================================
  // 行程設定：儲存
  // ================================
  const handleSaveTripSettings = () => {
    if (!tripForm?.id) return;

    const payload = {
      id: tripForm.id,
      name: tripForm.name?.trim() || "未命名行程",
      startDate: tripForm.startDate || "",
      duration: Number(tripForm.duration) || 5,
      coverImage: tripForm.coverImage || "",
      members: Array.isArray(tripForm.participants)
        ? tripForm.participants
        : [],
      locationQuery: (draftTrip?.locationQuery || "").trim(),
      weatherLat: draftTrip?.weatherLat ?? null,
      weatherLon: draftTrip?.weatherLon ?? null,
      weatherTimezone: draftTrip?.weatherTimezone || "Asia/Taipei",
      // 如果你有模式 / snapshot 也想保留，可一起帶
      weatherMode: draftTrip?.weatherMode || "live",
      weatherSnapshot: draftTrip?.weatherSnapshot || null,
      weatherUpdatedAt: draftTrip?.weatherUpdatedAt || null,
    };

    // ✅ 寫回 TravelPlanner 的 tripStore（透過 setTripList）
    setTripList((prev) =>
      prev.map((t) => (t.id === payload.id ? { ...t, ...payload } : t))
    );

    // ✅ 切到剛存的行程，讓主畫面立刻更新（封面/標題/天數）
    onSelectTrip?.(payload.id);

    setIsTripEditOpen(false);
    setEditingTrip(null);
  };

  // ================================
  // Render
  // ================================
  return (
    <div className="flex-1 bg-white overflow-y-auto p-6 space-y-8 pb-24">
      {/* 頁首標題 */}
      <header className="pt-4 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          設定
        </h1>
        <p className="text-sm text-gray-500 mt-1">個人化你的 APP</p>
      </header>

      {/* 行程管理 */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-800">行程管理</h3>

        <div className="space-y-3">
          {tripList.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTripClick(t.id)}
              className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between text-left transition-all ${
                t.id === activeTripId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div>
                <div className="font-bold text-gray-800">
                  {t.name || "未命名行程"}（{t.duration || 1}日）
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatTripRange(t)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 編輯 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTripEdit(t);
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <Edit3 size={16} />
                </button>

                {/* 刪除 */}
                {tripList.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTripClick(t.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 新增行程 */}
        <button
          type="button"
          onClick={handleCreateTripClick}
          className="w-full mt-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 flex items-center justify-center text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all"
        >
          <Plus size={16} className="mr-1" />
          新增行程
        </button>

        <p className="text-[11px] text-gray-400">
          每個行程都有自己的封面與設定，行程切換後會影響整體配色與內容，只有當前行程會套用中。
        </p>
      </section>

      {/* 介面主題色 */}
      <section className="space-y-3">
        <h3 className="font-bold text-gray-800">介面主題色</h3>
        <div className="flex gap-3">
          {Object.entries(themes).map(([key, tTheme]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)} // ✅ 存 key，而不是物件
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
            >
              <div
                className={`w-7 h-7 rounded-full ${tTheme.primary} border-2 border-white shadow`}
              />
              {theme === key && ( // ✅ 用 key 比較
                <Check size={16} className="absolute text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 行程設定 Modal */}
      <Modal isOpen={isTripEditOpen} onClose={closeTripEdit} title="行程設定">
        {editingTrip && (
          <div className="space-y-4 pt-2">
            {/* 行程名稱 */}
            <InputGroup
              label="行程名稱"
              value={tripForm.name}
              onChange={(e) =>
                setTripForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="例如：北海道、東京親子行…"
            />

            {/* 出發日 + 回程日期（自動計算天數） */}
            <div className="flex gap-3">
              {/* 出發日期 */}
              <div className="flex-1">
                <InputGroup
                  label="出發日期"
                  type="date"
                  value={tripForm.startDate}
                  onChange={(e) =>
                    setTripForm((f) => ({
                      ...f,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* 回程日期（改這裡） */}
              <div className="flex-1">
                <InputGroup
                  label="回程日期"
                  type="date"
                  value={
                    tripForm.startDate
                      ? new Date(
                          new Date(tripForm.startDate).setDate(
                            new Date(tripForm.startDate).getDate() +
                              (tripForm.duration || 1) -
                              1
                          )
                        )
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={(e) => {
                    if (!tripForm.startDate) {
                      alert("請先選擇出發日期");
                      return;
                    }

                    const start = new Date(tripForm.startDate);
                    const end = new Date(e.target.value);

                    // 算出天數（含出發日，所以 +1）
                    const diffDays =
                      Math.round(
                        (end.getTime() - start.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1;

                    if (Number.isNaN(diffDays) || diffDays < 1) {
                      alert("回程日期不能早於出發日期");
                      return;
                    }

                    // 直接寫回 duration，其他程式不用改
                    setTripForm((f) => ({
                      ...f,
                      duration: diffDays,
                    }));
                  }}
                />

                {/* 小字顯示自動計算出的天數 */}
                {tripForm.startDate && tripForm.duration && (
                  <p className="mt-1 text-[11px] text-gray-400">
                    共 {tripForm.duration} 天
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <InputGroup
                label="地點 / 地址（用來抓天氣）"
                placeholder="例如：宜蘭 / 礁溪 / 台北101 / 札幌"
                value={draftTrip?.locationQuery || ""}
                onChange={(e) =>
                  setDraftTrip((prev) => ({
                    ...(prev || {}),
                    locationQuery: e.target.value,
                  }))
                }
              />

              {(geoLoading || geoResults.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg">
                  {geoLoading && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      搜尋中…
                    </div>
                  )}

                  {!geoLoading && (
                    <div className="max-h-56 overflow-auto">
                      {geoResults.map((r) => (
                        <button
                          key={`${r.id}-${r.latitude}-${r.longitude}`}
                          type="button"
                          onClick={() => {
                            setDraftTrip((prev) => ({
                              ...(prev || {}),
                              locationQuery: `${r.name}${
                                r.admin1 ? `, ${r.admin1}` : ""
                              }${r.country ? `, ${r.country}` : ""}`,
                              weatherLat: r.latitude,
                              weatherLon: r.longitude,
                              weatherTimezone: r.timezone || "Asia/Taipei",
                            }));
                            setGeoResults([]);
                            setGeoLoading(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-t first:border-t-0 border-gray-100"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {r.name}
                            {r.admin1 ? `, ${r.admin1}` : ""}{" "}
                            {r.country ? `(${r.country})` : ""}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                            {r.timezone ? ` · ${r.timezone}` : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 封面圖片 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                封面圖片
              </label>
              <button
                type="button"
                onClick={() => tripCoverFileRef.current?.click()}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 flex items-center justify-between bg-gray-50"
              >
                <span className="truncate">
                  {tripForm.coverImage
                    ? "已選擇封面圖片，可重新上傳"
                    : "貼上圖片網址，或點此從圖庫上傳"}
                </span>
                <ImageIcon size={18} className="text-gray-400" />
              </button>
              <input
                ref={tripCoverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTripCoverUpload}
              />
            </div>

            {/* 參與成員 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                參與成員（會連動分帳）
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyDown={handleParticipantKeyDown}
                  placeholder="輸入名稱後按 Enter 新增"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>

              {tripForm.participants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tripForm.participants.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 text-[11px] flex items-center justify-center">
                        {name[0]}
                      </div>
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(name)}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">
                  目前尚未新增成員，可先輸入名稱，日後分帳會直接使用這份名單。
                </p>
              )}
            </div>

            {/* 儲存按鈕 */}
            <button
              type="button"
              onClick={handleSaveTripSettings}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold mt-2"
            >
              儲存行程設定
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

const getTransportIcon = (mode = "car") => {
  switch (mode) {
    case "walk":
      return Footprints;
    case "plane":
      return Plane;
    case "transit":
      return Bus;
    case "car":
    default:
      return Car;
  }
};

function ItineraryView({
  itinerary,
  setItinerary,
  selectedDay,
  setSelectedDay,
  trip,
  theme,
  onEdit,
  onDelete,
  onAdd,
  onWeatherForTips, // ✅ 新增
  onSaveWeatherSnapshot, // ✅ 新增
}) {
  // 🧷 安全保護：如果 itinerary 不是陣列，先轉空陣列
  const safeItinerary = Array.isArray(itinerary) ? itinerary : [];
  const days = Array.from({ length: trip.duration }, (_, i) => i + 1);
  const currentEvents = safeItinerary.filter((i) => i.day === selectedDay);

  // ======= 這裡開始：實際天氣（現在溫度 + 當天高低溫；圖示用 daily） =======
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUpdatedAt, setWeatherUpdatedAt] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    setLiveWeather(null);
    setWeatherUpdatedAt(null);
    setWeatherError("");

    // 沒座標就不抓
    if (!trip?.weatherLat || !trip?.weatherLon) {
      onWeatherForTips?.(null);
      return () => {
        alive = false;
        ac.abort();
      };
    }

    // ✅ 固定模式：直接吃 snapshot
    if (trip.weatherMode === "fixed" && trip.weatherSnapshot?.time?.length) {
      const daily = trip.weatherSnapshot;
      const idx = Math.min(selectedDay - 1, daily.time.length - 1);

      const hi = Math.round(daily.temperature_2m_max?.[idx]);
      const lo = Math.round(daily.temperature_2m_min?.[idx] ?? hi - 3);
      const feelHi = Math.round(daily.apparent_temperature_max?.[idx] ?? hi);
      const code = daily.weathercode?.[idx];

      let IconComp = Sun;
      let color = "text-orange-400";
      let bg = "bg-orange-50";
      if ([71, 73, 75, 77, 85, 86].includes(code)) {
        IconComp = CloudSnow;
        color = "text-blue-400";
        bg = "bg-blue-50";
      } else if ([61, 63, 65].includes(code)) {
        IconComp = CloudRain;
        color = "text-blue-500";
        bg = "bg-blue-50";
      } else if ([1, 2, 3].includes(code)) {
        IconComp = CloudSun;
        color = "text-gray-500";
        bg = "bg-gray-50";
      }

      const w = {
        nowTemp: null,
        hi: `${hi}°`,
        lo: `${lo}°`,
        feelHi: `${feelHi}°`,
        rainProb: "--",
        condition: getWeatherText(code),
        icon: IconComp,
        color,
        bg,
      };

      if (alive) {
        setLiveWeather(w);
        if (trip.weatherUpdatedAt)
          setWeatherUpdatedAt(new Date(trip.weatherUpdatedAt));
      }

      onWeatherForTips?.({
        temp: w.hi,
        feel: w.feelHi,
        condition: w.condition,
      });

      return () => {
        alive = false;
        ac.abort();
      };
    }

    const fetchWeather = async () => {
      try {
        if (!alive) return;
        setWeatherError("");
        setWeatherLoading(true);

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${Number(trip.weatherLat)}` +
          `&longitude=${Number(trip.weatherLon)}` +
          `&current_weather=true` +
          `&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,weathercode,precipitation_probability_max` +
          `&timezone=auto` +
          `&forecast_days=${Math.min(Number(trip.duration || 1), 16)}`;

        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data?.daily?.time?.length)
          throw new Error("API 回傳沒有 daily 資料");

        const idx = Math.min(selectedDay - 1, data.daily.time.length - 1);

        const nowTemp = Number.isFinite(data?.current_weather?.temperature)
          ? Math.round(data.current_weather.temperature)
          : null;

        const hi = Math.round(data.daily.temperature_2m_max[idx]);
        const lo = Math.round(data.daily.temperature_2m_min[idx]);
        const feelHi = Math.round(data.daily.apparent_temperature_max[idx]);
        const rainProb = Math.round(
          data.daily.precipitation_probability_max?.[idx] ?? 0
        );

        const code = data.daily.weathercode[idx];

        let IconComp = Sun;
        let color = "text-orange-400";
        let bg = "bg-orange-50";
        if ([71, 73, 75, 77, 85, 86].includes(code)) {
          IconComp = CloudSnow;
          color = "text-blue-400";
          bg = "bg-blue-50";
        } else if ([61, 63, 65].includes(code)) {
          IconComp = CloudRain;
          color = "text-blue-500";
          bg = "bg-blue-50";
        } else if ([1, 2, 3].includes(code)) {
          IconComp = CloudSun;
          color = "text-gray-500";
          bg = "bg-gray-50";
        }

        const w = {
          nowTemp, // ✅ 這裡真的塞 nowTemp
          hi: `${hi}°`,
          lo: `${lo}°`,
          feelHi: `${feelHi}°`,
          rainProb: `${rainProb}%`,
          condition: getWeatherText(code),
          icon: IconComp,
          color,
          bg,
        };

        if (!alive) return;
        setLiveWeather(w);

        const nowISO = new Date().toISOString();
        setWeatherUpdatedAt(new Date(nowISO));

        onWeatherForTips?.({
          temp: w.hi,
          feel: w.feelHi,
          condition: w.condition,
        });

        // 如果你要固定模式自動存快照（你原本那段保留）
        if (trip.weatherMode === "fixed" && !trip.weatherSnapshot) {
          onSaveWeatherSnapshot?.(data.daily, nowISO);
        }
      } catch (err) {
        // ✅ abort 不算錯，直接忽略
        if (err?.name === "AbortError") return;
        console.error("weather error", err);
        if (alive) setWeatherError(String(err?.message || err));
      } finally {
        if (alive) setWeatherLoading(false);
      }
    };

    fetchWeather().catch(() => {}); // ✅ 吃掉任何未預期的 rejection（含 abort）
    return () => {
      alive = false;
      try {
        ac.abort();
      } catch {}
    };
  }, [
    trip.weatherLat,
    trip.weatherLon,
    trip.duration,
    selectedDay,
    trip.weatherMode,
    trip.weatherSnapshot,
    trip.weatherUpdatedAt,
    trip.id,
  ]);

  // 顯示資料：抓不到就 fallback
  const weather = liveWeather || MOCK_WEATHER[selectedDay] || MOCK_WEATHER[1];
  const WeatherIcon = weather.icon || Sun;
  // ======= 實際天氣結束 =======

  const dragItem = useRef();
  const dragOverItem = useRef();

  const onDragStart = (e, position) => {
    dragItem.current = position;
  };
  const onDragEnter = (e, position) => {
    dragOverItem.current = position;
  };
  const onDragEnd = (e) => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const listCopy = [...currentEvents];
    const dragItemContent = listCopy[dragItem.current];
    listCopy.splice(dragItem.current, 1);
    listCopy.splice(dragOverItem.current, 0, dragItemContent);
    const otherEvents = safeItinerary.filter((i) => i.day !== selectedDay);
    setItinerary([...otherEvents, ...listCopy]);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <>
      <div className="px-4 pt-5 pb-2">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center justify-center min-w-[4.5rem] h-[4.5rem] shrink-0 rounded-2xl transition-all duration-300 ${
                selectedDay === day
                  ? `${theme.primary} text-white shadow-lg shadow-blue-500/30 scale-105`
                  : "bg-white border border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`text-sm font-bold tracking-tight mb-1 ${
                    selectedDay === day ? "opacity-100" : "text-gray-600"
                  }`}
                >
                  {formatMMDD(getTripDateObj(trip.startDate, day))}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    selectedDay === day ? "opacity-80" : "opacity-40"
                  }`}
                >
                  DAY {day}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div
          className={`relative mt-3 rounded-2xl p-4 flex items-center justify-between ${weather.bg} border border-gray-100`}
        >
          <div className="flex items-center gap-4">
            <WeatherIcon size={40} className={weather.color} />
            <div>
              {/* ✅ debug：確認有沒有拿到經緯度 */}
              <div className="px-1 mt-1 text-[11px] text-gray-400">
                lat: {String(trip.weatherLat || "")} / lon:{" "}
                {String(trip.weatherLon || "")}
                {weatherLoading ? " (loading...)" : ""}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">
                  {weather.nowTemp ?? weather.hi}
                </span>

                <span className="text-sm text-gray-500">
                  {weather.lo
                    ? `H:${weather.hi}  L:${weather.lo}`
                    : `H:${weather.hi}`}
                </span>
              </div>

              <div className="text-xs text-gray-500 mt-0.5">
                體感(高)：{weather.feelHi}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-700 text-sm">
              {weather.condition}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              降雨機率：{weather.rainProb ?? "--"}
            </div>
          </div>
          {weatherUpdatedAt && (
            <div className="absolute right-3 bottom-2 text-[10px] text-gray-400">
              更新於{" "}
              {weatherUpdatedAt.toLocaleString("zh-TW", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {currentEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Calendar size={24} className="text-gray-300" />
            </div>
            <p className="text-sm">尚未安排行程</p>
          </div>
        ) : (
          <div className="space-y-0 relative">
            <div className="absolute left-[4.5rem] top-6 bottom-6 w-0.5 bg-gray-100"></div>
            {currentEvents.map((item, index) => (
              <div
                key={item.id}
                className="draggable-item group relative mb-0"
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnter={(e) => onDragEnter(e, index)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex gap-4 relative z-10">
                  <div className="w-14 text-right pt-5 shrink-0">
                    <span className="font-bold text-gray-900 font-mono text-sm">
                      {item.time}
                    </span>
                  </div>
                  <div className="relative flex flex-col items-center w-6 shrink-0 pt-6">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm z-10 ${theme.dot}`}
                    ></div>
                  </div>
                  <div className="flex-1 pb-6 min-w-0">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-100 relative">
                      <div className="absolute top-3 right-3 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <GripVertical size={16} />
                      </div>
                      <h3 className="font-bold text-base text-gray-800 pr-6 truncate">
                        {item.title}
                      </h3>
                      {item.image && (
                        <div className="mt-2 mb-1">
                          <img
                            src={item.image}
                            alt="spot"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"
                          />
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 text-xs mt-1 truncate">
                        <MapPin size={12} className="mr-1 shrink-0" />
                        {item.location}
                      </div>
                      {item.note && (
                        <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-gray-50 text-xs text-gray-600 flex gap-2 border border-gray-100">
                          <span className="shrink-0">📝</span>
                          <span className="line-clamp-2">{item.note}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                        <div className="flex gap-2">
                          <MapButton type="google" query={item.location} />
                          <MapButton type="naver" query={item.location} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-50">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-green-500"
                          >
                            <Settings size={14} />
                          </button>

                          {/* 垃圾桶：Z-Index 50 + stopPropagation */}
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {index !== currentEvents.length - 1 &&
                      (() => {
                        const TransportIcon = getTransportIcon(item.travelMode);
                        return (
                          <div className="flex items-center gap-3 mt-3 ml-2">
                            <div className="px-2 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-400 flex items-center gap-1 border border-gray-200">
                              <TransportIcon size={10} />
                              {item.travelTime > 0 ? (
                                <span>{formatDuration(item.travelTime)}</span>
                              ) : (
                                <span>--</span>
                              )}
                            </div>
                            <div className="h-px bg-dashed border-t border-gray-200 flex-1"></div>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className={`fixed bottom-24 right-6 w-14 h-14 ${theme.primary} rounded-full shadow-lg shadow-blue-500/40 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30`}
      >
        <Plus size={28} />
      </button>
    </>
  );
}

const getPackingTipsFromWeather = (w) => {
  if (!w) return [];

  const tips = [];
  const tempNum = Number(String(w.temp || "").replace("°", ""));
  const condition = String(w.condition || "");

  if (!Number.isNaN(tempNum) && tempNum <= 10)
    tips.push("低溫：建議厚外套、保暖內搭");

  if (!Number.isNaN(tempNum) && tempNum <= 5)
    tips.push("很冷：手套、圍巾、帽子、暖暖包");

  if (condition.includes("雨")) tips.push("可能下雨：建議帶雨傘或雨衣");

  if (condition.includes("雪")) tips.push("可能下雪：防滑鞋、保暖襪、暖暖包");

  return tips;
};

function PackingView({ list, setList, theme, weatherForTips }) {
  const tips = getPackingTipsFromWeather(weatherForTips);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isManagingTags, setIsManagingTags] = useState(false);

  // 🔹 標籤列表（會存到 localStorage）
  const [tags, setTags] = useState(() => {
    const savedTags = localStorage.getItem("trip_tags_v24");
    return savedTags
      ? JSON.parse(savedTags)
      : [
          { name: "證件", color: "bg-red-100 text-red-600" },
          { name: "衣物", color: "bg-blue-100 text-blue-600" },
          { name: "電子", color: "bg-purple-100 text-purple-600" },
          { name: "盥洗", color: "bg-teal-100 text-teal-600" },
          { name: "藥品", color: "bg-green-100 text-green-600" },
          { name: "錢包", color: "bg-yellow-100 text-yellow-700" },
          { name: "一般", color: "bg-gray-100 text-gray-600" },
        ];
  });

  // 是否打開「新增/編輯標籤」區塊
  const [isAddingTag, setIsAddingTag] = useState(false);
  // 正在編輯哪一個標籤（用名稱當 key，null 代表新增）
  const [editingTag, setEditingTag] = useState(null);

  const [newTag, setNewTag] = useState({
    name: "",
    colorObj: { bg: "bg-gray-100", text: "text-gray-600" },
  });

  // 新增/編輯物品表單
  const [formData, setFormData] = useState({
    text: "",
    tag: "一般",
    tagColor: "bg-gray-100 text-gray-600",
    note: "",
    image: null,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("trip_tags_v24", JSON.stringify(tags));
  }, [tags]);

  // 🔹 顏色選項：多一點顏色
  const colorOptions = [
    { label: "紅", bg: "bg-red-100", text: "text-red-600" },
    { label: "橘", bg: "bg-orange-100", text: "text-orange-600" },
    { label: "黃", bg: "bg-yellow-100", text: "text-yellow-700" },
    { label: "黃綠", bg: "bg-lime-100", text: "text-lime-600" },
    { label: "綠", bg: "bg-green-100", text: "text-green-600" },
    { label: "青", bg: "bg-teal-100", text: "text-teal-600" },
    { label: "藍綠", bg: "bg-cyan-100", text: "text-cyan-600" },
    { label: "天藍", bg: "bg-sky-100", text: "text-sky-600" },
    { label: "藍", bg: "bg-blue-100", text: "text-blue-600" },
    { label: "靛", bg: "bg-indigo-100", text: "text-indigo-600" },
    { label: "紫", bg: "bg-purple-100", text: "text-purple-600" },
    { label: "粉", bg: "bg-pink-100", text: "text-pink-600" },
    { label: "玫瑰", bg: "bg-rose-100", text: "text-rose-600" },
    { label: "灰", bg: "bg-gray-100", text: "text-gray-600" },
  ];

  // 從 tag 的 color class 找回對應顏色物件（用在「編輯標籤」時讓顏色選擇跳到對的那顆）
  const findColorOptionByClass = (colorClass) => {
    return (
      colorOptions.find(
        (c) => `${c.bg} ${c.text}`.trim() === colorClass.trim()
      ) || { bg: "bg-gray-100", text: "text-gray-600" }
    );
  };

  // 儲存物品
  const handleSave = () => {
    if (!formData.text.trim()) return;
    if (editingId)
      setList(
        list.map((item) =>
          item.id === editingId
            ? { ...formData, id: editingId, isChecked: item.isChecked }
            : item
        )
      );
    else setList([...list, { ...formData, id: Date.now(), isChecked: false }]);
    closeModal();
  };

  // 新增 / 編輯 標籤
  const handleAddTag = () => {
    if (!newTag.name.trim()) return;
    const colorClass = `${newTag.colorObj.bg} ${newTag.colorObj.text}`;

    if (editingTag) {
      // ✅ 編輯既有標籤
      const oldName = editingTag;
      setTags((prev) =>
        prev.map((t) =>
          t.name === oldName ? { name: newTag.name, color: colorClass } : t
        )
      );
      // 同步更新清單上已使用這個標籤的物品
      setList((prev) =>
        prev.map((item) =>
          item.tag === oldName
            ? { ...item, tag: newTag.name, tagColor: colorClass }
            : item
        )
      );
    } else {
      // ✅ 新增標籤
      setTags((prev) => [...prev, { name: newTag.name, color: colorClass }]);
      // 同時把表單目前的 tag 換成新建的這個
      setFormData((prev) => ({
        ...prev,
        tag: newTag.name,
        tagColor: colorClass,
      }));
    }

    setIsAddingTag(false);
    setEditingTag(null);
    setNewTag({
      name: "",
      colorObj: { bg: "bg-gray-100", text: "text-gray-600" },
    });
  };

  // 刪除標籤
  const handleDeleteTag = (tagName) => {
    if (!window.confirm(`確定要刪除標籤「${tagName}」嗎？`)) return;
    setTags((prev) => prev.filter((t) => t.name !== tagName));

    // 已經用這個標籤的物品 → 改成「一般」
    setList((prev) =>
      prev.map((item) =>
        item.tag === tagName
          ? {
              ...item,
              tag: "一般",
              tagColor: "bg-gray-100 text-gray-600",
            }
          : item
      )
    );

    // 如果正在編輯這個標籤，就關掉編輯區
    if (editingTag === tagName) {
      setIsAddingTag(false);
      setEditingTag(null);
      setNewTag({
        name: "",
        colorObj: { bg: "bg-gray-100", text: "text-gray-600" },
      });
    }
  };

  // 開啟「新增標籤」模式
  const openCreateTag = () => {
    setIsAddingTag(true);
    setEditingTag(null);
    setNewTag({
      name: "",
      colorObj: { bg: "bg-gray-100", text: "text-gray-600" },
    });
  };

  // 開啟「編輯既有標籤」
  const openEditTag = (tagItem) => {
    setIsAddingTag(true);
    setEditingTag(tagItem.name);
    setNewTag({
      name: tagItem.name,
      colorObj: findColorOptionByClass(tagItem.color),
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      text: "",
      tag: "一般",
      tagColor: "bg-gray-100 text-gray-600",
      note: "",
      image: null,
    });
    setIsAddingTag(false);
    setEditingTag(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("確定要刪除這個項目嗎？")) {
      setList((prevList) => prevList.filter((item) => item.id !== id));
    }
  };

  const toggleCheck = (id) =>
    setList(
      list.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormData((prev) => ({ ...prev, image: null }));

  const progress =
    list.length > 0
      ? Math.round((list.filter((i) => i.isChecked).length / list.length) * 100)
      : 0;

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">行李清單</h2>
          <p className="text-sm text-gray-500 mt-1">出發前別忘了檢查！</p>
        </div>
        <div className="text-right">
          <span className={`text-3xl font-black ${theme.text}`}>
            {progress}%
          </span>
        </div>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full ${theme.primary} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
            <p>清單空空的，快按右下角新增！</p>
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className={`group bg-white border rounded-xl p-4 transition-all ${
                item.isChecked
                  ? "border-gray-100 opacity-60"
                  : "border-gray-200 shadow-sm hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    item.isChecked
                      ? `${theme.primary} border-transparent`
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {item.isChecked && <Check size={14} className="text-white" />}
                </button>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => handleEdit(item)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                    <h3
                      className={`font-bold text-gray-800 truncate ${
                        item.isChecked ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.text}
                    </h3>
                  </div>
                  {(item.note || item.image) && (
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      {item.note && (
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {item.note}
                        </span>
                      )}
                      {item.image && (
                        <div className="mt-1">
                          <img
                            src={item.image}
                            alt="preview"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-gray-300 hover:text-green-500"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleDelete(e, item.id)}
                    className="text-gray-300 hover:text-red-500 relative z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 右下角新增物品 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-24 right-6 w-14 h-14 ${theme.primary} rounded-full shadow-lg shadow-blue-500/40 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30`}
      >
        <Plus size={28} />
      </button>

      {/* 物品 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "編輯物品" : "新增物品"}
      >
        <div className="space-y-4 pt-2">
          <InputGroup
            label="物品名稱"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="例如：護照、充電器..."
          />

          {/* 標籤區塊 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-600">
                分類標籤
              </label>
              <div className="flex items-center gap-2">
                {/* 管理模式時才能快速新增標籤 */}
                {!isAddingTag && isManagingTags && (
                  <button
                    onClick={openCreateTag}
                    className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> 新增標籤
                  </button>
                )}
                <button
                  onClick={() => setIsManagingTags((v) => !v)}
                  className="text-xs text-gray-500 px-2 py-1 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-500"
                >
                  {isManagingTags ? "完成管理" : "管理標籤"}
                </button>
              </div>
            </div>

            {/* 新增 / 編輯 標籤面板 */}
            {isAddingTag ? (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 mb-3">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="標籤名稱"
                    value={newTag.name}
                    onChange={(e) =>
                      setNewTag({ ...newTag, name: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                  >
                    {editingTag ? "儲存標籤" : "新增標籤"}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTag(false);
                      setEditingTag(null);
                    }}
                    className="text-gray-400 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.label}
                      onClick={() =>
                        setNewTag((prev) => ({ ...prev, colorObj: c }))
                      }
                      className={`w-7 h-7 rounded-full ${
                        c.bg
                      } border-2 flex items-center justify-center text-[10px] ${
                        newTag.colorObj.bg === c.bg
                          ? "border-gray-500 scale-110"
                          : "border-transparent"
                      }`}
                      title={c.label}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 標籤列表 */}
            <div className="flex flex-wrap gap-2">
              {/* 管理模式下的「新增」Chip（另一個入口） */}
              {isManagingTags && !isAddingTag && (
                <button
                  onClick={openCreateTag}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-blue-300 text-blue-500 bg-blue-50/40"
                >
                  + 新增標籤
                </button>
              )}

              {tags.map((tagItem) => (
                <div key={tagItem.name} className="relative inline-block">
                  {/* 標籤本體：一般模式＝選擇；管理模式＝編輯 */}
                  <button
                    onClick={() => {
                      if (isManagingTags) {
                        openEditTag(tagItem); // 進入編輯標籤（會帶入名稱＆顏色）
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          tag: tagItem.name,
                          tagColor: tagItem.color,
                        }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      formData.tag === tagItem.name && !isManagingTags
                        ? `${tagItem.color} border-transparent ring-2 ring-offset-1 ring-gray-200`
                        : `bg-white border-gray-200 text-gray-600 hover:bg-gray-50 ${tagItem.color}`
                    }`}
                  >
                    {tagItem.name}
                  </button>

                  {/* 管理模式下：右上角小減號刪除 */}
                  {isManagingTags && tagItem.name !== "一般" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tagItem.name);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-red-300 flex items-center justify-center text-[10px] text-red-500 shadow-sm"
                      title="刪除標籤"
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <InputGroup
            label="備註 (選填)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="數量、放置位置..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              照片備忘 (選填)
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {formData.image ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image}
                    alt="preview"
                    className="h-32 rounded-lg object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                  <Camera size={24} className="mb-1" />
                  <span className="text-xs">點擊上傳照片</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl ${theme.primary} text-white font-bold mt-4 shadow-lg shadow-blue-500/30 hover:opacity-90 active:scale-[0.98] transition-all`}
          >
            {editingId ? "儲存變更" : "加入清單"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function BudgetView({ expenses, setExpenses, trip, setTrip, theme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 刪除成員確認用
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleteStage, setIsDeleteStage] = useState(false);

  // 頭像裁切
  const [avatarCropSrc, setAvatarCropSrc] = useState(null);
  const [avatarCropZoom, setAvatarCropZoom] = useState(1);
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);

  // 成員資料儲存：照片 / 備註
  const [memberProfiles, setMemberProfiles] = useState(() => {
    const saved = localStorage.getItem("trip_member_profiles_v25");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(
      "trip_member_profiles_v25",
      JSON.stringify(memberProfiles)
    );
  }, [memberProfiles]);

  // 成員編輯區
  const [editingMember, setEditingMember] = useState(null);
  const [memberNameInput, setMemberNameInput] = useState("");
  const [memberNoteInput, setMemberNoteInput] = useState("");
  const [memberAvatarInput, setMemberAvatarInput] = useState(null);
  const memberAvatarFileInputRef = useRef(null);

  // 支出表單
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    payer: "",
    date: "",
    time: "",
    note: "",
    involved: [],
  });

  // 計算結餘
  const calculateBalances = () => {
    const balances = {};
    trip.members.forEach((m) => (balances[m] = 0));

    expenses.forEach((exp) => {
      const amount = parseFloat(exp.amount);
      if (isNaN(amount)) return;
      if (exp.involved.length === 0) return;

      const split = amount / exp.involved.length;

      balances[exp.payer] += amount;
      exp.involved.forEach((person) => (balances[person] -= split));
    });

    return balances;
  };

  const balances = calculateBalances();

  const getMemberStats = (name) => {
    if (!name) return { totalPaid: 0, totalInvolved: 0 };

    const totalPaid = expenses
      .filter((e) => e.payer === name)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const totalInvolved = expenses
      .filter((e) => e.involved.includes(name))
      .reduce(
        (sum, e) => sum + parseFloat(e.amount || 0) / e.involved.length,
        0
      );

    return { totalPaid, totalInvolved };
  };

  const getSettlementFor = (name) => {
    const result = [];
    if (!name) return result;

    const me = balances[name];
    const others = trip.members.filter((m) => m !== name);

    if (me < 0) {
      let debt = -me;
      const creditors = others
        .filter((m) => balances[m] > 0)
        .sort((a, b) => balances[b] - balances[a]);

      for (const c of creditors) {
        if (debt <= 0) break;
        const canReceive = balances[c];
        const pay = Math.min(debt, canReceive);
        result.push({ type: "pay", to: c, amount: pay });
        debt -= pay;
      }
    }

    if (me > 0) {
      let receive = me;
      const debtors = others
        .filter((m) => balances[m] < 0)
        .sort((a, b) => balances[a] - balances[b]);

      for (const d of debtors) {
        if (receive <= 0) break;
        const owe = -balances[d];
        const take = owe > receive ? receive : owe;
        result.push({ type: "receive", from: d, amount: take });
        receive -= take;
      }
    }

    return result;
  };

  const getMemberExpenses = (name) =>
    expenses.filter((exp) => exp.payer === name || exp.involved.includes(name));

  // 添加成員
  const handleAddMember = () => {
    setEditingMember(null);
    setMemberNameInput("");
    setMemberNoteInput("");
    setMemberAvatarInput(null);
    setIsMemberModalOpen(true);
  };

  // 編輯成員
  const handleEditMember = (name) => {
    const profile = memberProfiles[name] || {};

    setEditingMember(name);
    setMemberNameInput(name);
    setMemberNoteInput(profile.note || "");
    setMemberAvatarInput(profile.avatar || null);
    setIsMemberModalOpen(true);
  };

  // 上傳頭像 → 打開裁切視窗
  const handleMemberAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarCropSrc(reader.result);
      setAvatarCropZoom(1);
      setIsAvatarCropOpen(true);
    };

    reader.readAsDataURL(file);
  };

  // 裁切確定
  const handleConfirmAvatarCrop = () => {
    if (!avatarCropSrc) return;

    const img = new Image();
    img.onload = () => {
      const size = 400;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      const baseScale = Math.max(size / img.width, size / img.height);
      const scale = baseScale * avatarCropZoom;

      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (size - drawW) / 2;
      const dy = (size - drawH) / 2;

      ctx.drawImage(img, dx, dy, drawW, drawH);

      const cropped = canvas.toDataURL("image/jpeg", 0.9);
      setMemberAvatarInput(cropped);

      setIsAvatarCropOpen(false);
      setAvatarCropSrc(null);
      setAvatarCropZoom(1);
    };
    img.src = avatarCropSrc;
  };

  // 裁切取消
  const handleCancelAvatarCrop = () => {
    setIsAvatarCropOpen(false);
    setAvatarCropSrc(null);
    setAvatarCropZoom(1);
  };

  // 儲存成員
  const saveMember = () => {
    const newName = memberNameInput.trim();
    if (!newName) return;

    // 修改名稱
    if (editingMember) {
      const newMembers = trip.members.map((m) =>
        m === editingMember ? newName : m
      );

      const newExpenses = expenses.map((e) => ({
        ...e,
        payer: e.payer === editingMember ? newName : e.payer,
        involved: e.involved.map((i) => (i === editingMember ? newName : i)),
      }));

      setTrip({ ...trip, members: newMembers });
      setExpenses(newExpenses);

      setMemberProfiles((prev) => {
        const copy = { ...prev };
        const old = copy[editingMember] || {};
        delete copy[editingMember];
        copy[newName] = {
          ...old,
          note: memberNoteInput,
          avatar: memberAvatarInput,
        };
        return copy;
      });
    } else {
      // 新增成員
      if (!trip.members.includes(newName)) {
        setTrip({ ...trip, members: [...trip.members, newName] });
      }

      setMemberProfiles((prev) => ({
        ...prev,
        [newName]: {
          note: memberNoteInput,
          avatar: memberAvatarInput,
        },
      }));
    }

    setIsMemberModalOpen(false);
  };

  // 刪除成員
  const deleteMember = () => {
    if (deleteConfirmText !== editingMember) {
      alert("請輸入正確的名稱確認刪除。");
      return;
    }

    const newMembers = trip.members.filter((m) => m !== editingMember);

    const newExpenses = expenses.map((e) => ({
      ...e,
      payer: e.payer === editingMember ? "" : e.payer,
      involved: e.involved.filter((i) => i !== editingMember),
    }));

    const newProfiles = { ...memberProfiles };
    delete newProfiles[editingMember];

    setTrip({ ...trip, members: newMembers });
    setExpenses(newExpenses);
    setMemberProfiles(newProfiles);

    setDeleteConfirmText("");
    setIsDeleteStage(false);
    setIsMemberModalOpen(false);
  };

  // ========= 支出處理 =========
  const handleAddExpense = () => {
    const now = new Date();
    setExpenseForm({
      title: "",
      amount: "",
      payer: trip.members[0] || "",
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      note: "",
      involved: [...trip.members],
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (exp) => {
    setEditingId(exp.id);
    setExpenseForm({ ...exp });
    setIsModalOpen(true);
  };

  const saveExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) return;

    if (editingId) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editingId ? expenseForm : e))
      );
    } else {
      setExpenses((prev) => [...prev, { ...expenseForm, id: Date.now() }]);
    }

    setIsModalOpen(false);
  };

  const deleteExpense = (id) => {
    if (window.confirm("確定刪除這筆支出？")) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const toggleInvolved = (m) => {
    setExpenseForm((prev) => {
      const list = prev.involved.includes(m)
        ? prev.involved.filter((i) => i !== m)
        : [...prev.involved, m];
      return { ...prev, involved: list };
    });
  };

  const statsName = editingMember || memberNameInput || "";
  const memberStats = getMemberStats(statsName);
  const memberBalance = balances[statsName];
  const settlementList = getSettlementFor(statsName);
  const memberExpenseList = getMemberExpenses(statsName);

  return (
    <div className="p-6 pb-24">
      {/* ================== 成員列表 ================== */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-black text-gray-900">分帳助手</h2>

          <button
            onClick={handleAddMember}
            className={`text-sm font-bold ${theme.text} flex items-center gap-1`}
          >
            <UserPlus size={16} /> 新增成員
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {trip.members.map((member) => {
            const profile = memberProfiles[member] || {};
            const bal = balances[member] || 0;

            return (
              <button
                key={member}
                onClick={() => handleEditMember(member)}
                className="flex flex-col items-center min-w-[4rem] group"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1 border-2 border-transparent group-hover:border-blue-200 overflow-hidden`}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={member}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      {member[0]}
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs font-medium ${
                    bal >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {bal >= 0 ? `+${Math.round(bal)}` : Math.round(bal)}
                </span>

                <span className="text-xs text-gray-400 truncate max-w-[4.5rem]">
                  {member}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================== 支出列表 ================== */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          近期支出
        </h3>

        {expenses.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            <Wallet size={48} className="mx-auto mb-3 opacity-20" />
            <p>還沒有支出紀錄</p>
          </div>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              onClick={() => handleEditExpense(exp)}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-start active:scale-[0.98] transition-transform"
            >
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${theme.secondary} flex items-center justify-center shrink-0`}
                >
                  <Wallet size={18} className={theme.text} />
                </div>

                <div>
                  <h4 className="font-bold text-gray-800">{exp.title}</h4>

                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <span className="font-medium text-gray-600">
                      {exp.payer}
                    </span>{" "}
                    付款<span className="mx-1">•</span>
                    <span>
                      {exp.date.slice(5)} {exp.time}
                    </span>
                  </div>

                  {exp.note && (
                    <div className="text-xs text-gray-400 mt-1">{exp.note}</div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.involved.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-gray-800 text-lg">
                  ${Number(exp.amount).toLocaleString()}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditExpense(exp);
                    }}
                    className="text-gray-300 hover:text-green-500"
                  >
                    <Settings size={16} />
                  </button>

                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteExpense(exp.id);
                    }}
                    className="text-gray-300 hover:text-red-500 relative z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================== 右下角新增支出按鈕 ================== */}
      <button
        onClick={handleAddExpense}
        className={`fixed bottom-24 right-6 w-14 h-14 ${theme.primary} rounded-full shadow-lg shadow-blue-500/40 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30`}
      >
        <Plus size={28} />
      </button>

      {/* ================== 成員資訊 Modal ================== */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title={editingMember ? "成員資訊" : "新增成員"}
      >
        <div className="space-y-4 pt-2">
          {/* 頭像 + 名稱 */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden cursor-pointer relative"
              onClick={() => memberAvatarFileInputRef.current?.click()}
            >
              {memberAvatarInput ? (
                <img
                  src={memberAvatarInput}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl text-gray-400">
                  {(memberNameInput || editingMember || "🙂")[0]}
                </span>
              )}

              <div className="absolute bottom-0 inset-x-0 bg-black/30 text-[10px] text-white text-center py-[2px]">
                更換照片
              </div>

              <input
                type="file"
                ref={memberAvatarFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleMemberAvatarUpload}
              />
            </div>

            <div className="flex-1">
              <InputGroup
                label="暱稱"
                value={memberNameInput}
                onChange={(e) => setMemberNameInput(e.target.value)}
                placeholder="輸入名字..."
              />

              {editingMember && (
                <p className="text-[10px] text-gray-400 mt-1">
                  修改名稱時，也會同步更新現有的支出紀錄。
                </p>
              )}
            </div>
          </div>

          {/* 統計 */}
          {editingMember && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">目前結餘</span>

                <span
                  className={
                    memberBalance >= 0
                      ? "text-green-600 font-bold"
                      : "text-red-500 font-bold"
                  }
                >
                  {memberBalance >= 0 ? "+" : ""}
                  {Math.round(memberBalance)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>已代付總額：{Math.round(memberStats.totalPaid)}</span>
                <span>應分攤總額：{Math.round(memberStats.totalInvolved)}</span>
              </div>
            </div>
          )}

          {/* 要給誰錢 / 收誰錢 */}
          {editingMember && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                要給誰錢 / 收誰錢（參考）
              </h4>

              {settlementList.length === 0 ? (
                <p className="text-xs text-gray-400 mt-1">看起來已經平衡了</p>
              ) : (
                <ul className="space-y-1 text-xs mt-1">
                  {settlementList.map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-gray-600">
                        {s.type === "pay"
                          ? `建議支付給 ${s.to}`
                          : `建議向 ${s.from} 收取`}
                      </span>

                      <span
                        className={
                          s.type === "pay" ? "text-red-500" : "text-green-600"
                        }
                      >
                        {s.type === "pay" ? "-" : "+"}
                        {Math.round(s.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 參與明細 */}
          {editingMember && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700">參與明細</h4>

              {memberExpenseList.length === 0 ? (
                <p className="text-xs text-gray-400 mt-1">
                  尚無此成員的分帳紀錄
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 mt-2 text-xs">
                  {memberExpenseList.map((exp) => {
                    const amt = Number(exp.amount);
                    const share = exp.involved.includes(editingMember)
                      ? Math.round(amt / exp.involved.length)
                      : 0;

                    return (
                      <div
                        key={exp.id}
                        className="border border-gray-100 rounded-lg px-2 py-1.5 flex justify-between bg-white"
                      >
                        <div>
                          <div className="font-semibold text-gray-700">
                            {exp.title}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {exp.date.slice(5)} {exp.time} · {exp.payer}
                          </div>
                        </div>

                        <div className="text-right text-[11px]">
                          <div className="font-bold">${amt}</div>
                          {share > 0 && (
                            <div className="text-gray-400">分攤：{share}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              備註 / 轉帳方式
            </label>

            <textarea
              value={memberNoteInput}
              onChange={(e) => setMemberNoteInput(e.target.value)}
              rows={3}
              placeholder="例如：玉山銀行 0000-1234567 / line pay"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 outline-none"
            />
          </div>

          {/* 刪除成員 */}
          {editingMember && (
            <div className="mt-4 border-t pt-4">
              {!isDeleteStage ? (
                <button
                  onClick={() => setIsDeleteStage(true)}
                  className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200"
                >
                  刪除成員
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-500 font-medium">
                    ⚠️ 無法恢復，請輸入「{editingMember}」確認刪除。
                  </p>

                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full border border-red-300 bg-red-50 text-red-600 px-3 py-2 rounded-lg outline-none"
                    placeholder={`輸入：${editingMember}`}
                  />

                  <button
                    onClick={deleteMember}
                    className="w-full py-3 rounded-xl bg-red-600 text-white font-bold"
                  >
                    確認刪除
                  </button>

                  <button
                    onClick={() => {
                      setIsDeleteStage(false);
                      setDeleteConfirmText("");
                    }}
                    className="w-full py-2 text-gray-500 text-sm"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 儲存按鈕 */}
          <button
            onClick={saveMember}
            className={`w-full py-3 rounded-xl ${theme.primary} text-white font-bold mt-2`}
          >
            確認
          </button>
        </div>
      </Modal>

      {/* ================== 支出 Modal ================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "編輯支出" : "新增支出"}
      >
        <div className="space-y-4 pt-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <InputGroup
                label="項目名稱"
                value={expenseForm.title}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, title: e.target.value })
                }
                placeholder="例如：早餐 / 交通"
              />
            </div>

            <div className="flex-1">
              <InputGroup
                label="金額"
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>

          {/* 日期與時間 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <InputGroup
                label="日期"
                type="date"
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, date: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <InputGroup
                label="時間"
                type="time"
                value={expenseForm.time}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* 付款者 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              誰支付？
            </label>

            <div className="flex flex-wrap gap-2">
              {trip.members.map((m) => (
                <button
                  key={m}
                  onClick={() => setExpenseForm({ ...expenseForm, payer: m })}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    expenseForm.payer === m
                      ? `${theme.primary} text-white border-transparent`
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 分給誰 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              分給誰？（可複選）
            </label>

            <div className="grid grid-cols-3 gap-2">
              {trip.members.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleInvolved(m)}
                  className={`px-2 py-2 rounded-lg text-sm border flex items-center justify-center gap-1 ${
                    expenseForm.involved.includes(m)
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {expenseForm.involved.includes(m) && <Check size={12} />}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 備註 */}
          <InputGroup
            label="備註"
            value={expenseForm.note}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, note: e.target.value })
            }
            placeholder="詳細內容（選填）"
          />

          {/* 儲存支出按鈕 */}
          <button
            onClick={saveExpense}
            className={`w-full py-3 rounded-xl ${theme.primary} text-white font-bold mt-4`}
          >
            {editingId ? "儲存變更" : "新增支出"}
          </button>
        </div>
      </Modal>

      {/* ================== 頭像裁切 Modal ================== */}
      <Modal
        isOpen={isAvatarCropOpen}
        onClose={handleCancelAvatarCrop}
        title="調整頭像裁切"
      >
        {avatarCropSrc && (
          <div className="space-y-4 pt-2">
            {/* 預覽區 */}
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-200 relative">
                <img
                  src={avatarCropSrc}
                  alt="裁切預覽"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: `scale(${avatarCropZoom})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>

            {/* 縮放滑桿 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                縮放大小
              </label>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={avatarCropZoom}
                onChange={(e) =>
                  setAvatarCropZoom(parseFloat(e.target.value) || 1)
                }
                className="w-full accent-blue-500"
              />
            </div>

            <p className="text-[11px] text-gray-400">
              會輸出為正方形，再以圓形顯示。
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleCancelAvatarCrop}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500"
              >
                取消
              </button>

              <button
                onClick={handleConfirmAvatarCrop}
                className={`flex-1 py-2 rounded-xl ${theme.primary} text-white font-bold`}
              >
                套用裁切
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ==========================================
// 5. Main Component (Defined LAST to access all above)
// ==========================================

export default function TravelPlanner() {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [editingTripId, setEditingTripId] = useState(null);
  const [draftTrip, setDraftTrip] = useState({
    locationQuery: "",
    weatherLat: null,
    weatherLon: null,
    weatherTimezone: "Asia/Taipei",
    weatherMode: "live",
    weatherSnapshot: null,
    weatherUpdatedAt: null,
  });
  const [isTripEditOpen, setIsTripEditOpen] = useState(false);

  // ✅👇👇👇【就在這一區，加 openTripEdit】👇👇👇

  const openTripEdit = (t) => {
    setEditingTrip(t);

    // 表單（名稱、日期、天數、成員）
    setTripForm({
      id: t.id,
      name: t.name || "",
      startDate: t.startDate || "",
      duration: t.duration || 1,
      coverImage: t.coverImage || "",
      participants: t.members || [],
    });

    // ✅ 地點 / 天氣用（重點）
    setDraftTrip({
      locationQuery: t.locationQuery || "",
      weatherLat: t.weatherLat ?? null,
      weatherLon: t.weatherLon ?? null,
      weatherTimezone: t.weatherTimezone || "Asia/Taipei",
      weatherMode: t.weatherMode || "live",
      weatherSnapshot: t.weatherSnapshot || null,
      weatherUpdatedAt: t.weatherUpdatedAt || null,
    });

    setIsTripEditOpen(true);
  };

  // ========= 多行程：建立新行程的模板 =========
  const createNewTripData = (name = "新行程") => ({
    name, // 行程名稱
    trip: {
      ...INITIAL_TRIP,
      destination: name,
    },
    itinerary: [],
    packingList: [],
    expenses: [],
  });

  // ✅ 新增行程：由 TravelPlanner 建立，回傳 newId 給 SettingsView 立刻開 modal
  const handleCreateTrip = () => {
    const newId = `trip-${Date.now()}`;
    const newName = `新行程 ${Object.keys(tripStore).length + 1}`;

    const newTrip = {
      id: newId,
      name: newName,
      startDate: "",
      duration: 1,
      coverImage: "",
      members: [],
      weatherLat: null,
      weatherLon: null,
      weatherMode: "live",
      locationQuery: "",
      weatherLat: null,
      weatherLon: null,
      weatherTimezone: "Asia/Taipei", // or "Asia/Tokyo" 看你預設
    };

    // 1) 先放進 tripStore
    setTripStore((prev) => ({
      ...prev,
      [newId]: {
        ...(prev?.[newId] || {}),
        trip: newTrip,
        itinerary: [],
        packingList: [],
        expenses: [],
      },
    }));

    // 2) 設為目前行程
    setActiveTripId(newId);

    // 3) 直接打開「同一個」編輯 modal
    setEditingTripId(newId);
    setDraftTrip(newTrip);
    setIsTripEditOpen(true);

    return newId;
  };

  const handleDeleteTrip = (id) => {
    const keys = Object.keys(tripStore);
    if (keys.length <= 1) {
      alert("至少要保留一個行程，無法全部刪掉。");
      return;
    }
    if (
      !window.confirm(
        "刪除此行程後，行程表 / 行李清單 / 分帳紀錄都會一併刪除，確定嗎？"
      )
    ) {
      return;
    }

    setTripStore((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });

    // 如果刪的是目前的，就切到剩下的第一個
    if (activeTripId === id) {
      const remaining = keys.filter((k) => k !== id);
      if (remaining.length > 0) {
        setActiveTripId(remaining[0]);
      }
    }
  };

  // ========= 多行程：資料存到一個大的 tripStore 裡 =========
  const [tripStore, setTripStore] = useState(() => {
    const saved = localStorage.getItem("trip_store_v1");
    if (saved) return JSON.parse(saved);

    // 第一次使用：用現在這個 INITIAL_TRIP 當作第一個行程
    return {
      "trip-1": {
        name: INITIAL_TRIP.destination,
        trip: INITIAL_TRIP,
        // 這裡你可以放原本 useState 裡的預設行程 / 行李清單
        itinerary: [
          {
            id: 1,
            day: 1,
            time: "06:00",
            title: "桃園機場報到",
            location: "桃園國際機場 (TPE)",
            type: "flight",
            note: "中華航空 CI0130",
            travelTime: 260,
            image: null,
          },
          {
            id: 2,
            day: 1,
            time: "14:00",
            title: "新千歲機場抵達",
            location: "新千歲機場",
            type: "flight",
            note: "領取行李、租車",
            travelTime: 90,
            image: null,
          },
          {
            id: 3,
            day: 1,
            time: "16:00",
            title: "前往飯店 Check-in",
            location: "札幌格蘭大飯店",
            type: "stay",
            note: "放行李",
            travelTime: 0,
            image: null,
          },
          {
            id: 4,
            day: 2,
            time: "10:00",
            title: "小樽運河漫步",
            location: "小樽運河",
            type: "spot",
            note: "拍照打卡點",
            travelTime: 15,
            image:
              "https://images.unsplash.com/photo-1589451433917-268393e50663?q=80&w=200&auto=format&fit=crop",
          },
        ],
        packingList: [
          {
            id: 1,
            text: "護照",
            isChecked: false,
            tag: "證件",
            tagColor: "bg-red-100 text-red-600",
            note: "效期檢查",
            image: null,
          },
          {
            id: 2,
            text: "日幣現金",
            isChecked: false,
            tag: "錢包",
            tagColor: "bg-yellow-100 text-yellow-700",
            note: "換 50000 円",
            image: null,
          },
        ],
        expenses: [],
      },
    };
  });

  // 目前顯示哪一個行程
  const [activeTripId, setActiveTripId] = useState(() => {
    return localStorage.getItem("trip_active_id_v1") || "trip-1";
  });

  // 把整個 tripStore 存到 localStorage（多行程都會被存起來）
  useEffect(() => {
    localStorage.setItem("trip_store_v1", JSON.stringify(tripStore));
  }, [tripStore]);

  // 記住上次打開的是哪一個行程
  useEffect(() => {
    localStorage.setItem("trip_active_id_v1", activeTripId);
  }, [activeTripId]);

  // ✅ 目前選到的行程資料
  const activeTrip = tripStore[activeTripId] ||
    Object.values(tripStore)[0] || { trip: INITIAL_TRIP };

  // ✅ 這幾個變數一定要在 component 最外層宣告
  const trip = activeTrip.trip || INITIAL_TRIP;
  const itinerary = activeTrip.itinerary || [];
  const packingList = activeTrip.packingList || [];
  const expenses = activeTrip.expenses || [];

  // ✅ 新增：地點搜尋（用來抓天氣）
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const q = (trip?.locationQuery || "").trim();
    if (q.length < 2) {
      setGeoResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setGeoLoading(true);

        // A) Open-Meteo（有時中文會空）
        const fetchOpenMeteo = async (lang) => {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              q
            )}&count=8&language=${lang}&format=json`
          );
          const data = await res.json();
          return Array.isArray(data?.results) ? data.results : [];
        };

        let results = await fetchOpenMeteo("zh");
        if (!results.length) results = await fetchOpenMeteo("en");

        // B) 備援：Nominatim（中文命中率通常更高）
        if (!results.length) {
          const res2 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q
            )}&limit=8&accept-language=zh-TW`
          );
          const data2 = await res2.json();

          // 轉成跟 open-meteo 一樣好用的欄位（latitude/longitude/name/...)
          results = (Array.isArray(data2) ? data2 : []).map((x) => ({
            id: x.place_id,
            name: (x.display_name || "").split(",")[0] || q,
            admin1: x.display_name || "",
            country: "", // Nominatim 的 display_name 已包含國家
            latitude: Number(x.lat),
            longitude: Number(x.lon),
            timezone: "", // 先留空，下面選擇時再用預設
          }));
        }

        setGeoResults(results);
      } catch (e) {
        console.error("geocoding error", e);
        setGeoResults([]);
      } finally {
        setGeoLoading(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [trip?.locationQuery]);

  // ✅ 封面暫存（Header 編輯用）
  useEffect(() => {
    setTempCoverImage(trip?.coverImage || "");
  }, [trip?.coverImage]);

  // 把 tripStore 轉成給 SettingsView 用的陣列
  const buildTripListFromStore = (store) =>
    Object.entries(store).map(([id, t]) => ({
      id,
      name: t.name || t.trip?.destination || "未命名行程",
      startDate: t.trip?.startDate || "",
      duration: t.trip?.duration || 5,
      coverImage: t.trip?.coverImage || "",
      members: t.trip?.members || [],
    }));

  const tripList = buildTripListFromStore(tripStore);

  // 提供給 SettingsView 的 setTripList（會回寫到 tripStore）
  const setTripList = (updater) => {
    setTripStore((prev) => {
      const prevList = buildTripListFromStore(prev);
      const nextList =
        typeof updater === "function" ? updater(prevList) : updater;

      const nextStore = {};
      nextList.forEach((item) => {
        const key = String(item.id);
        const old = prev[key] || createNewTripData(item.name);

        nextStore[key] = {
          ...old,
          name: item.name,
          trip: {
            ...old.trip,
            destination: item.name,
            startDate: item.startDate,
            duration: item.duration,
            coverImage: item.coverImage,
            members: item.members || [],

            // ✅ 保留天氣定位相關欄位（避免被洗掉）
            locationQuery: old.trip?.locationQuery || "",
            weatherLat: old.trip?.weatherLat,
            weatherLon: old.trip?.weatherLon,
            weatherTimezone: old.trip?.weatherTimezone,
          },
        };
      });

      return nextStore;
    });
  };

  // 包一層 setter，實際上是改 tripStore 裡 activeTrip 的內容
  const setTrip = (newTrip) => {
    setTripStore((prev) => {
      const current = prev[activeTripId];

      // 如果現在這個 activeTrip 還沒在 tripStore 裡，就幫它建一筆新的
      if (!current) {
        return {
          ...prev,
          [activeTripId]: {
            name: newTrip.destination || "未命名行程",
            trip: newTrip,
            itinerary: [],
            packingList: [],
            expenses: [],
          },
        };
      }

      // 一般情況：更新既有行程
      return {
        ...prev,
        [activeTripId]: {
          ...current,
          name: newTrip.destination || current.name,
          trip: newTrip,
        },
      };
    });
  };

  const setItinerary = (updater) => {
    setTripStore((prev) => {
      const current = prev[activeTripId] || createNewTripData("未命名行程");
      const prevArr = Array.isArray(current.itinerary) ? current.itinerary : [];
      const nextArr =
        typeof updater === "function" ? updater(prevArr) : updater;

      return {
        ...prev,
        [activeTripId]: {
          ...current,
          itinerary: Array.isArray(nextArr) ? nextArr : prevArr,
        },
      };
    });
  };

  const setPackingList = (updater) => {
    setTripStore((prev) => {
      const current = prev[activeTripId] || createNewTripData("未命名行程");
      const prevArr = Array.isArray(current.packingList)
        ? current.packingList
        : [];
      const nextArr =
        typeof updater === "function" ? updater(prevArr) : updater;

      return {
        ...prev,
        [activeTripId]: {
          ...current,
          packingList: Array.isArray(nextArr) ? nextArr : prevArr,
        },
      };
    });
  };

  const setExpenses = (updater) => {
    setTripStore((prev) => {
      const current = prev[activeTripId] || createNewTripData("未命名行程");
      const prevArr = Array.isArray(current.expenses) ? current.expenses : [];
      const nextArr =
        typeof updater === "function" ? updater(prevArr) : updater;

      return {
        ...prev,
        [activeTripId]: {
          ...current,
          expenses: Array.isArray(nextArr) ? nextArr : prevArr,
        },
      };
    });
  };

  // 主題色維持原本邏輯（全 App 共用）
  const [theme, setTheme] = useState(
    () => localStorage.getItem("trip_theme_v25") || DEFAULT_THEME_COLOR
  );
  useEffect(() => {
    localStorage.setItem("trip_theme_v25", theme);
  }, [theme]);

  // UI States
  const [selectedDay, setSelectedDay] = useState(1);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [tempCoverImage, setTempCoverImage] = useState("");
  // ✅ 天氣：提供行李清單提醒用（由 ItineraryView 回傳）
  const [weatherForTips, setWeatherForTips] = useState(null);

  const [formEvent, setFormEvent] = useState({
    title: "",
    time: "09:00",
    location: "",
    type: "spot",
    note: "",
    travelTime: 0,
    travelMode: "car", // 新增：交通方式
    image: null,
    tempDate: "",
  });

  useEffect(
    () => localStorage.setItem("trip_settings_v25", JSON.stringify(trip)),
    [trip]
  );
  useEffect(() => localStorage.setItem("trip_theme_v25", theme), [theme]);
  useEffect(
    () => localStorage.setItem("trip_itinerary_v25", JSON.stringify(itinerary)),
    [itinerary]
  );
  useEffect(
    () => localStorage.setItem("trip_packing_v25", JSON.stringify(packingList)),
    [packingList]
  );
  useEffect(
    () => localStorage.setItem("trip_expenses_v25", JSON.stringify(expenses)),
    [expenses]
  );

  const currentTheme = THEMES[theme] || THEMES[DEFAULT_THEME_COLOR];

  // --- Handlers ---
  const handleOpenAddItinerary = () => {
    const currentDate = formatDateForInput(
      getTripDateObj(trip.startDate, selectedDay)
    );
    setFormEvent({
      title: "",
      time: "09:00",
      location: "",
      type: "spot",
      note: "",
      travelTime: 0,
      travelMode: "car",
      image: null,
      tempDate: currentDate,
    });
    setEditingId(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditItinerary = (item) => {
    setEditingId(item.id);
    const itemDate = formatDateForInput(
      getTripDateObj(trip.startDate, item.day)
    );
    setFormEvent({ ...item, tempDate: itemDate });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("確定要刪除此行程嗎？")) {
      setItinerary((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSaveEvent = () => {
    let targetDay = selectedDay;
    if (formEvent.tempDate) {
      const calculatedDay = getDayDiff(trip.startDate, formEvent.tempDate);
      if (calculatedDay >= 1) targetDay = calculatedDay;
    }
    const eventToSave = { ...formEvent, day: targetDay, tempDate: undefined };

    if (editingId) {
      setItinerary((prev) =>
        prev.map((i) =>
          i.id === editingId ? { ...eventToSave, id: editingId } : i
        )
      );
    } else {
      setItinerary((prev) => [...prev, { ...eventToSave, id: Date.now() }]);
    }

    if (targetDay !== selectedDay && targetDay <= trip.duration) {
      setSelectedDay(targetDay);
    }
    setIsEventModalOpen(false);
  };

  const handleOpenAllMaps = () => {
    const currentEvents = itinerary.filter((i) => i.day === selectedDay);
    if (currentEvents.length === 0) {
      window.open("https://www.google.com/maps", "_blank");
      return;
    }
    const locations = currentEvents
      .filter((e) => e.location)
      .map((e) => encodeURIComponent(e.location))
      .join("/");
    if (!locations) window.open("https://www.google.com/maps", "_blank");
    else window.open(`https://www.google.com/maps/dir/${locations}`, "_blank");
  };

  const handleTranslate = () => {
    const textToTranslate = encodeURIComponent(trip.destination);
    window.open(
      `https://translate.google.com/?sl=auto&tl=zh-TW&text=${textToTranslate}`,
      "_blank"
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "itinerary":
        return (
          <ItineraryView
            key={activeTripId}
            itinerary={itinerary}
            setItinerary={setItinerary}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            trip={trip}
            theme={currentTheme}
            onEdit={handleOpenEditItinerary}
            onDelete={handleDeleteEvent}
            onAdd={handleOpenAddItinerary}
            // ✅ 給行李清單用的天氣資料（例如：低溫/下雨提醒）
            onWeatherForTips={(w) => setWeatherForTips(w)}
            // ✅ 固定預報：把 daily snapshot 存回 trip（鎖住）
            onSaveWeatherSnapshot={(daily, updatedAtISO) => {
              setTrip({
                ...trip,
                weatherSnapshot: daily,
                weatherUpdatedAt: updatedAtISO,
              });
            }}
          />
        );
      case "settings":
        return (
          <SettingsView
            trip={trip}
            setTrip={setTrip}
            tripList={buildTripListFromStore(tripStore)}
            activeTripId={activeTripId}
            theme={theme}
            setTheme={setTheme}
            themes={THEMES}
            setTripList={setTripList}
            onSelectTrip={(id) => setActiveTripId(id)} // ✅ 切換行程
            onCreateTrip={handleCreateTrip} // ✅ 新增行程（用外面那個）
            onDeleteTrip={handleDeleteTrip} // ✅ 刪除行程（用外面那個）
          />
        );

      case "packing":
        return (
          <PackingView
            list={packingList}
            setList={setPackingList}
            theme={currentTheme}
            weatherForTips={weatherForTips}
          />
        );
      case "budget":
        return (
          <BudgetView
            expenses={expenses}
            setExpenses={setExpenses}
            trip={trip}
            setTrip={setTrip}
            theme={currentTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* 2. 視差捲動容器 */}
      <div
        className="flex-1 overflow-y-auto relative no-scrollbar"
        id="main-scroll"
      >
        {/* 封面 */}
        <div className="sticky top-0 h-64 w-full shrink-0 z-0 relative group">
          <img
            src={trip?.coverImage || ""}
            className="w-full h-full object-cover brightness-90"
            alt="trip cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>

          {/* 左下角標題 */}
          <div className="absolute bottom-8 left-0 text-white w-full px-6 pointer-events-none text-left">
            <h2 className="text-xs font-medium tracking-wider uppercase opacity-80 mb-1 drop-shadow-md"></h2>
            <h1 className="text-3xl font-black tracking-tight drop-shadow-lg leading-tight">
              {trip?.destination || "未命名行程"}
            </h1>
          </div>
          {/* 右上角：鉛筆 + 地圖 / 匯率 / 翻譯（直式排列） */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
            {/* 編輯鈕（最上面） */}
            <button
              onClick={() => {
                setTempCoverImage(trip.coverImage);
                setIsHeaderEditOpen(true);
              }}
              className="p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors border border-white/20"
            >
              <Edit3 size={18} />
            </button>

            {/* 地圖 */}
            <ToolBtn icon={Map} onClick={handleOpenAllMaps} label="地圖" />

            {/* 匯率 */}
            <ToolBtn
              icon={Coins}
              onClick={() => setIsCurrencyModalOpen(true)}
              label="匯率"
            />

            {/* 翻譯 */}
            <ToolBtn icon={Languages} onClick={handleTranslate} label="翻譯" />
          </div>
        </div>

        {/* 內容卡片 */}
        <div className="bg-white rounded-t-3xl -mt-6 relative z-10 min-h-[calc(100vh-300px)] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-32">
          {/* 內容卡片 */}
          <div className="bg-white rounded-t-3xl -mt-6 relative z-10 min-h-[calc(100vh-300px)] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-32">
            {/* 目前行程切換列 */}
            <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">目前行程</span>
                <select
                  value={activeTripId}
                  onChange={(e) => setActiveTripId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm outline-none"
                >
                  {Object.entries(tripStore).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name || t.trip?.destination || "未命名行程"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>

      {/* 3. 底部導航 (標準 4 欄) - FIXED */}
     <div className="
    fixed left-1/2 bottom-[-2px] -translate-x-1/2
    w-full max-w-[480px]
    z-50
    px-4
    pb-[calc(12px+env(safe-area-inset-bottom))]
  ">
        <div
          className="
      bg-white/95 backdrop-blur
      border border-gray-200
      rounded-2xl
      shadow-[0_-8px_20px_rgba(0,0,0,0.08)]
      px-6 py-3
      flex justify-around items-center
    "
        >
          <NavButton
            icon={MapPin}
            label="行程"
            active={activeTab === "itinerary"}
            onClick={() => setActiveTab("itinerary")}
            theme={currentTheme}
          />
          <NavButton
            icon={ShoppingBag}
            label="清單"
            active={activeTab === "packing"}
            onClick={() => setActiveTab("packing")}
            theme={currentTheme}
          />
          <NavButton
            icon={Wallet}
            label="分帳"
            active={activeTab === "budget"}
            onClick={() => setActiveTab("budget")}
            theme={currentTheme}
          />
          <NavButton
            icon={Settings}
            label="設定"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            theme={currentTheme}
          />
        </div>
      </div>
      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        isEdit={!!editingId}
        formEvent={formEvent}
        setFormEvent={setFormEvent}
        onSave={handleSaveEvent}
        theme={currentTheme}
      />

      <Modal
        isOpen={isHeaderEditOpen}
        onClose={() => setIsHeaderEditOpen(false)}
        title="封面設定" // ✅ 改標題
      >
        <div className="space-y-5">
          <InputGroup
            label="旅遊名稱"
            value={trip.destination}
            onChange={(e) => setTrip({ ...trip, destination: e.target.value })}
          />

          {/* ✅ 出發日期整段拿掉（不要這個 InputGroup） */}

          <InputGroup
            label="地點 / 地址（用來抓天氣）"
            placeholder="例如：札幌 / 北海道 / 新宿 / 台北101"
            value={trip.locationQuery || ""}
            onChange={(e) =>
              setTrip({ ...trip, locationQuery: e.target.value })
            }
          />

          {/* ✅ 地點候選清單：點一下就寫入經緯度，天氣立刻連動 */}
          {(geoLoading || geoResults.length > 0) && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
              {geoLoading && (
                <div className="px-3 py-2 text-sm text-gray-500">搜尋中…</div>
              )}

              {!geoLoading &&
                geoResults.map((r) => (
                  <button
                    key={`${r.id}-${r.latitude}-${r.longitude}`}
                    type="button"
                    onClick={() => {
                      setTrip({
                        ...trip,
                        locationQuery: `${r.name}${
                          r.admin1 ? `, ${r.admin1}` : ""
                        }${r.country ? `, ${r.country}` : ""}`,
                        weatherLat: r.latitude,
                        weatherLon: r.longitude,
                        weatherTimezone: r.timezone || "Asia/Tokyo",
                      });

                      setGeoResults([]);
                      setGeoLoading(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-t first:border-t-0 border-gray-100"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {r.name}
                      {r.admin1 ? `, ${r.admin1}` : ""}{" "}
                      {r.country ? `(${r.country})` : ""}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                      {r.timezone ? ` · ${r.timezone}` : ""}
                    </div>
                  </button>
                ))}
            </div>
          )}

          <CoverUploadSection
            tempCoverImage={tempCoverImage}
            setTempCoverImage={setTempCoverImage}
          />

          <button
            onClick={() => {
              setTrip({
                ...trip,
                coverImage: tempCoverImage,
                weatherLat: trip.weatherLat,
                weatherLon: trip.weatherLon,
                weatherTimezone: trip.weatherTimezone,
              });
              setIsHeaderEditOpen(false);
            }}
            className={`w-full py-3 rounded-xl ${currentTheme.primary} text-white font-bold mt-2 shadow-lg shadow-blue-500/30`}
          >
            完成
          </button>
        </div>
      </Modal>

      {/* 貨幣換算 Modal */}
      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        theme={currentTheme}
      />
    </div>
  );
}
