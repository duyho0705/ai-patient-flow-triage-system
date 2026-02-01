import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Activity,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  ChevronDown,
  Star,
  Heart,
  Stethoscope,
  Microscope,
  Shield,
  PlayCircle,
  Check,
  Baby,
  Monitor,
  Send,
  ShieldCheck
} from 'lucide-react'
import { LoginModal } from '@/pages/Login'

// CustomSelect Component
interface CustomSelectProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

function CustomSelect({ options, defaultValue, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || options[0]);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={`w-full bg-[#f6f7f8] border-none rounded-lg py-3 px-4 text-[#2d3436] font-medium flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-[#2b8cee] ${isOpen ? 'ring-2 ring-[#2b8cee]' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedValue}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2b8cee]' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full rounded-xl bg-white shadow-xl border border-slate-100 max-h-60 overflow-auto custom-scrollbar focus:outline-none"
          >
            {options.map((option) => (
              <li
                key={option}
                className={`relative cursor-pointer select-none py-2.5 pl-4 pr-10 text-sm transition-colors ${option === selectedValue ? 'bg-[#e0f2f1] text-[#004d40] font-medium' : 'text-[#2d3436] hover:bg-[#f6f7f8]'
                  }`}
                onClick={() => handleSelect(option)}
              >
                <span className="block truncate">{option}</span>
                {option === selectedValue && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#004d40]">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [date, setDate] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-sans text-[#2d3436]">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-[#2b8cee]" />
            <span className="text-xl font-bold tracking-tight text-[#2d3436]">ModernClinic</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="#">Chuyên Khoa</NavLink>
            <NavLink to="#">Bác Sĩ</NavLink>
            <NavLink to="#">Công Nghệ</NavLink>
            <NavLink to="#">Cổng Bệnh Nhân</NavLink>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#2b8cee] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#2b8cee]/90 transition-all shadow-md shadow-[#2b8cee]/20"
            >
              Đặt Lịch Khám
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-semibold text-[#2d3436] hover:text-[#2b8cee] transition"
            >
              Đăng Nhập
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-[#f2f2f2] pt-28 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f2f1] text-[#004d40] text-xs font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
              Tiêu Chuẩn Y Tế Xuất Sắc
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-[#2d3436] leading-tight">
              An Tâm Tuyệt Đối <br />
              Cho <span className="text-[#2b8cee]">Sức Khỏe Gia Đình</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              Trải nghiệm sự chăm sóc tận tâm và chuyên môn y tế tiên tiến tại cơ sở hiện đại của chúng tôi. Chúng tôi tập trung vào việc chữa lành bằng cả trái tim.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/dashboard"
                className="bg-[#2b8cee] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#2b8cee]/20 hover:-translate-y-1 transition-all text-center"
              >
                Đặt Lịch Ngay
              </Link>
              <button className="bg-white border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <PlayCircle className="h-6 w-6 text-[#2d3436]" />
                Tham Quan Ảo
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative w-full max-w-2xl">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d3436]/40 to-transparent z-10"></div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxurL_0mHkDSA7Xy8Ivzc16G0mL0tuBC-qzP2L6nAylR1tH6aJySP9Xn-h53lyWhTu0qDM3g7pHesLDfwkHbBck-H6ydTV0PNaAVqhWN9i5nv2I-CWCsMsPBEp1n_bN4FS3-FLfKSK5t0aJ5HIvpsYUxAxgiIv0bxmfQs6BqHY50b4qblQuxhm_of6WK5KgtBV4D-yb4o4vHDXodAgXHfj5xaNOCNpM1xNjEn2vkrm286YzltEXIO8pbuqOE8a2jQ-lyWDOUQLI3bx"
                alt="Doctor smiling"
                className="w-full h-full object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 pb- hidden sm:flex z-20">
                <div className="bg-[#e0f2f1] p-3 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-[#004d40]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#2d3436]">99%</p>
                  <p className="text-sm text-slate-500">Hài Lòng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Quick Form */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-10 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Chuyên Khoa</label>
              <CustomSelect
                options={['Tim Mạch', 'Nhi Khoa', 'Da Liễu', 'Tổng Quát', 'Thần Kinh', 'Cơ Xương Khớp']}
                placeholder="Chọn chuyên khoa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Bác Sĩ</label>
              <CustomSelect
                options={['Bất kỳ Bác sĩ nào', 'BS. Nguyễn Văn A', 'BS. Trần Thị B', 'BS. Lê Văn C', 'BS. Phạm Thị D']}
                placeholder="Chọn bác sĩ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Ngày Khám</label>
              <div className="relative">
                {/* Custom visual container matching CustomSelect style */}
                <div className={`w-full bg-[#f6f7f8] border-none rounded-lg py-3 px-4 text-[#2d3436] font-medium flex items-center justify-between transition-all duration-200 focus-within:ring-2 focus-within:ring-[#2b8cee] ${date ? 'text-[#2d3436]' : 'text-slate-500'}`}>
                  <span className="truncate">{date ? new Date(date).toLocaleDateString('vi-VN') : 'Chọn ngày khám'}</span>
                  <Calendar className={`h-4 w-4 transition-colors ${date ? 'text-[#2b8cee]' : 'text-slate-400'}`} />
                </div>

                {/* Invisible native date input overlay */}
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setDate(e.target.value)}
                  value={date}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-[#2b8cee] text-white h-[46px] rounded-lg font-bold hover:bg-[#2b8cee]/90 transition-colors shadow-lg shadow-[#2b8cee]/20">
                Kiểm Tra Lịch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-[#2d3436] mb-4">Chuyên Khoa Mũi Nhọn</h2>
              <p className="text-slate-500">Chúng tôi cung cấp đa dạng các dịch vụ y tế được thực hiện bởi các chuyên gia hàng đầu cùng trang thiết bị chẩn đoán hiện đại nhất.</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-[#2b8cee] font-bold hover:underline">
              Xem Tất Cả Dịch Vụ <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <SpecialtyCard
              icon={<Heart className="w-8 h-8" />}
              title="Tim Mạch"
              desc="Chăm sóc sức khỏe tim mạch toàn diện từ phòng ngừa đến các thủ thuật phẫu thuật phức tạp."
            />
            <SpecialtyCard
              icon={<Baby className="w-8 h-8" />}
              title="Nhi Khoa"
              desc="Nuôi dưỡng thế hệ tương lai với dịch vụ chăm sóc chuyên biệt cho trẻ sơ sinh, trẻ em và thanh thiếu niên."
            />
            <SpecialtyCard
              icon={<Microscope className="w-8 h-8" />}
              title="Chẩn Đoán"
              desc="Phòng xét nghiệm chính xác cung cấp kết quả nhanh chóng và chuẩn xác cho quy trình điều trị hiệu quả."
            />
            <SpecialtyCard
              icon={<Activity className="w-8 h-8" />}
              title="Y Học Dự Phòng"
              desc="Theo dõi sức khỏe hàng ngày và khám sàng lọc định kỳ để giúp bạn luôn khỏe mạnh và năng động."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-[#e0f2f1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#2d3436] mb-6">Tại Sao Chọn ModernClinic?</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Chúng tôi kết hợp công nghệ tiên tiến với phương pháp lấy con người làm trung tâm để cung cấp dịch vụ y tế chất lượng cao nhất. Sứ mệnh của chúng tôi là làm cho việc chăm sóc sức khỏe trở nên dễ tiếp cận, hiệu quả và mang tính cá nhân sâu sắc.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                  <div className="shrink-0 w-12 h-12 bg-[#e0f2f1] rounded-lg flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-[#004d40]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2d3436]">Công Nghệ Hiện Đại</h4>
                    <p className="text-sm text-slate-500">Trang bị các công cụ chẩn đoán và phẫu thuật mới nhất cho y học chính xác.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                  <div className="shrink-0 w-12 h-12 bg-[#e0f2f1] rounded-lg flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-[#004d40]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2d3436]">Đội Ngũ Chuyên Gia</h4>
                    <p className="text-sm text-slate-500">Các bác sĩ chuyên khoa được chứng nhận với hàng chục năm kinh nghiệm.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                  <div className="shrink-0 w-12 h-12 bg-[#e0f2f1] rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-[#004d40]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2d3436]">Triết Lý Lấy Bệnh Nhân Làm Đầu</h4>
                    <p className="text-sm text-slate-500">Chăm sóc cá nhân hóa phù hợp với hành trình sức khỏe và tiền sử gia đình của bạn.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  alt="Hospital hallway"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAOOjLfFJTdgpRZdw1zng855DUGtA1AJiA4EyXtDKLzMgJjQ83GsfS38Vzlj6iINmVGcrnInnLZ-vwmM7DqKZvy9YD7k-7-XZBtjnS7gc7Wbpq0cA_MyHenthDCCMo0CpjGPX6XWtcikMfbf92bQ2mubVTP0QAqfTfAVVg1_33BpWvt5XWi8j9Q4ZdxpvANZiQRyVFdEULZ0QEAmfanq3fBOwOCF19VCBsOyucMluF1IhEin-OkE7iu0_bsPz8l_wW2p62WrT-E8ei"
                />
                <img
                  alt="Researchers"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmzMC8yHpbw2jDGOipzrTcak2r6SIKVWbd_TRYJMtY8xXpbCyC9_RgRCyFurB5OsuLQBF6XVDl6uBJFUzeuNAPcuQbBgJywf7XASn5JHVcoQ0eaBOy4xN7EiAu0NeZoTOl6vhG2Ba-jHfzy8fpmFNUsjokYnaSbJhKnZ2KhJP586pqImPOeFfkOJii_pf_7IKvjj_IR0K_WLqqPSt2N2k6Dac-rVy7ZP2Hedc1yYW4dXBjKo6eBFGZ6BNo2Ls2Bmmmg3uMIju0tyZ1"
                />
                <img
                  alt="Doctor with patient"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover -mt-8"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADlytwG7uPmYlOhIDBZWEF3gILnz9iGE7PDduDVhopOsy4Ioa_dd-E6baOqkqBsekIC1CwlD9IfgXMQq8ejkGO1PvU0gPApKrU9nM0ibslPDynbUoc5Qrt8NB-6B-9RPrCAIiTWArnIUTHhozmOyl7Bp8pbncGJ0oh9ASFnkddJXpGT3T6o8pucve-Z2dmP3tNnHhdG0qC_kFZzF2d_tk5bAEMq8fvQtNd-gWaNjmcToDuUineP58A2qEEQIXCkluidv8EKY03_k75"
                />
                <img
                  alt="Equipment"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk5S5BAnvVnQz7j_A0YMO0bE7_PiyZUrV0j3-u1XsWsq3_WdjZYTDhsykSSZrbX6BMUXZ_9fJtDXqDv195xiT3h6wifcOh6iGqtRCHtvJLqtM7ShrdURFUH4B8fsqHKnFKOOfG4OaTBKrsoS3R6F6tgO_qTRl1Ia82ABY8kE_Nf4K2d8uhuStWvISZ9F0F6d1CCu6Dd45HmkyMR1DHNXOcXCV5yQwUifBUkfB5fwmmyU8NtQ7pLUsJa95DQSo95Rrdn0JXUkCum98j"
                />
              </div>
              <div className="absolute inset-0 bg-[#2b8cee]/10 rounded-3xl -z-10 transform translate-x-4 translate-y-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2d3436] mb-4">Cảm Nhận Từ Bệnh Nhân</h2>
            <p className="text-slate-500">Câu chuyện thật từ những người đã tin tưởng trao gửi sức khỏe cho chúng tôi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#f2f2f2] border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="italic text-slate-600 mb-6">"Mức độ chăm sóc tôi nhận được vượt xa sự mong đợi. Cơ sở vật chất hiện đại, và nhân viên thực sự lắng nghe những lo lắng của bạn."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                <div>
                  <p className="font-bold text-sm text-[#2d3436]">Nguyễn Thị Lan</p>
                  <p className="text-xs text-slate-500">Bệnh nhân từ 2021</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-[#f2f2f2] border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="italic text-slate-600 mb-6">"Hiệu quả, chuyên nghiệp và rất thân thiện. Việc đặt lịch trực tuyến làm mọi thứ trở nên dễ dàng. Rất khuyến khích bác sĩ tim mạch."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                <div>
                  <p className="font-bold text-sm text-[#2d3436]">Trần Văn Minh</p>
                  <p className="text-xs text-slate-500">Bệnh nhân từ 2019</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-[#f2f2f2] border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="italic text-slate-600 mb-6">"Khu khám nhi thật tuyệt vời. Các con tôi thực sự hào hứng khi đến gặp bác sĩ. Cảm ơn vì đã tạo ra một môi trường ấm áp như vậy!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                <div>
                  <p className="font-bold text-sm text-[#2d3436]">Phạm Thanh Hà</p>
                  <p className="text-xs text-slate-500">Mẹ của 3 bé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Contact */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <div className="p-12 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#2d3436] mb-2">Ghé Thăm Chúng Tôi</h2>
                <p className="text-slate-500">Chúng tôi tọa lạc thuận tiện ngay trung tâm thành phố với bãi đậu xe rộng rãi.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#2b8cee]" />
                  <div>
                    <p className="font-bold text-[#2d3436]">Medical Center Plaza</p>
                    <p className="text-sm text-slate-500">123 Đại Lộ Sức Khỏe, Quận 1, TP.HCM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-[#2b8cee]" />
                  <div>
                    <p className="font-bold text-[#2d3436]">1900 123 456</p>
                    <p className="text-sm text-slate-500">Hỗ trợ khẩn cấp 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-[#2b8cee]" />
                  <div>
                    <p className="font-bold text-[#2d3436]">T2 - T7: 8:00 - 20:00</p>
                    <p className="text-sm text-slate-500">CN: Đóng cửa</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-[#2b8cee] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                Chỉ Đường Đến Phòng Khám
              </button>
            </div>
            <div className="h-96 lg:h-auto min-h-[400px] relative bg-slate-200">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxDJenr-5_TqF-YeyghDuNQjDkteOa7qeaW8UtEU6P0d6j1bQGdWfbHuzkTkc7_zC9l-MTWE9KD73GJISG9cNtNgyLD8T8uG7xXhEVDck3KiQJDdUBDUmn6LnbCH6NMES2XRKQeCfPiCGsNjbXfDcAKsctZYFCHLdqpqIz650qJNMgY1BWZwHCF4wh9wQBb9iiaehi73gsmOrOpDquL8hlZ0WYFdQhOEsbMYWc685jgSrEZuj2z1O_XbEYY5afsKF8Y89GPGEda06E')" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d3436] text-slate-400 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6 text-white">
                <Stethoscope className="h-8 w-8 text-[#2b8cee]" />
                <span className="text-xl font-bold tracking-tight">ModernClinic</span>
              </div>
              <p className="text-sm leading-relaxed">Cung cấp dịch vụ y tế đẳng cấp quốc tế từ năm 2005. Cam kết vì sức khỏe cộng đồng và đổi mới công nghệ.</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Liên Kết Nhanh</h5>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Chuyên Khoa</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Tìm Bác Sĩ</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Cổng Bệnh Nhân</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Tuyển Dụng</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Tài Nguyên</h5>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Thông Tin Bảo Hiểm</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Thanh Toán Trực Tuyến</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Hồ Sơ Y Tế</a></li>
                <li><a href="#" className="hover:text-[#2b8cee] transition-colors">Câu Hỏi Thường Gặp</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Đăng Ký Tin</h5>
              <p className="text-sm mb-4">Nhận cập nhật các mẹo sức khỏe mới nhất.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="bg-slate-800 border-none rounded-lg text-sm w-full focus:ring-1 focus:ring-[#2b8cee] px-3 py-2"
                  placeholder="Email"
                />
                <button className="bg-[#2b8cee] text-white p-2 rounded-lg">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2024 ModernClinic Medical Group. Bảo lưu mọi quyền.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Chính Sách Bảo Mật</a>
              <a href="#" className="hover:text-white transition-colors">Điều Khoản Sử Dụng</a>
              <a href="#" className="hover:text-white transition-colors">Trợ Giúp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-[#2d3436] hover:text-[#2b8cee] transition-colors">
      {children}
    </Link>
  )
}

function SpecialtyCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-2xl bg-[#f6f7f8] border border-transparent hover:border-[#2b8cee]/20 hover:bg-white hover:shadow-xl transition-all">
      <div className="w-14 h-14 bg-[#2b8cee]/10 rounded-xl flex items-center justify-center mb-6 text-[#2b8cee] group-hover:bg-[#2b8cee] group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-[#2d3436]">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="h-1 w-12 bg-[#2b8cee]/20 rounded-full group-hover:w-full transition-all duration-500"></div>
    </div>
  )
}
