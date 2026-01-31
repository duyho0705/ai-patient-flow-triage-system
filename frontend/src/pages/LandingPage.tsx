import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Activity, // Corrected from 'activity'
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
  Check
} from 'lucide-react'

// CustomSelect Component
// CustomSelect Component
interface CustomSelectProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string; // Kept for compatibility but might default to options[0]
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
        className={`w-full bg-slate-50 border border-transparent rounded-xl py-3 px-4 text-slate-900 font-medium flex items-center justify-between transition-all duration-200 ${isOpen ? 'bg-white ring-2 ring-blue-500 shadow-md' : 'hover:bg-blue-50/50 hover:border-blue-200'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedValue}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
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
                className={`relative cursor-pointer select-none py-2.5 pl-4 pr-10 text-sm transition-colors ${option === selectedValue ? 'bg-blue-50/50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                onClick={() => handleSelect(option)}
              >
                <span className="block truncate">{option}</span>
                {option === selectedValue && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
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

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-blue-200 shadow-lg">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Modern<span className="text-blue-600">Clinic</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="#">Chuyên Khoa</NavLink>
            <NavLink to="#">Bác Sĩ</NavLink>
            <NavLink to="#">Công Nghệ</NavLink>
            <NavLink to="#">Cổng Bệnh Nhân</NavLink>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Đặt Lịch Khám
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-48 bg-slate-50 z-20">
        {/* Background Effects Wrapper - Clips the background but allows content (Booking Bar) to overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-30"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-4 py-2 text-sm font-bold text-teal-700 mb-8 uppercase tracking-wide">
                Tiêu Chuẩn Y Tế Xuất Sắc
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-[1.15]">
                An Tâm Tuyệt Đối <br />
                <span className="text-slate-900">Cho</span> <span className="text-blue-600">Sức Khỏe Gia Đình</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-slate-500 leading-relaxed mb-10">
                Trải nghiệm sự chăm sóc tận tâm và chuyên môn y tế tiên tiến tại cơ sở hiện đại của chúng tôi. Chúng tôi tập trung vào việc chữa lành bằng cả trái tim.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200/50"
                >
                  Đặt Lịch Ngay
                </Link>
                <button className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow">
                  <PlayCircle className="h-5 w-5 text-slate-900" />
                  Tham Quan Ảo
                </button>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-[500px] lg:max-w-none">
                <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
                    alt="Doctor with tablet"
                    className="w-full h-auto object-cover"
                  />
                  {/* Floating Badge */}
                  <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center">
                      <Shield className="h-7 w-7 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-slate-900">99%</p>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Hài Lòng</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Booking Bar */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6 lg:px-8 z-30">
          <div className="mx-auto max-w-6xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Chuyên Khoa</label>
                <CustomSelect
                  options={['Tim Mạch', 'Nhi Khoa', 'Da Liễu', 'Tổng Quát', 'Thần Kinh', 'Cơ Xương Khớp']}
                  placeholder="Chọn chuyên khoa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Bác Sĩ</label>
                <CustomSelect
                  options={['Bất kỳ Bác sĩ nào', 'BS. Nguyễn Văn A', 'BS. Trần Thị B', 'BS. Lê Văn C', 'BS. Phạm Thị D']}
                  placeholder="Chọn bác sĩ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ngày Khám</label>
                <div className="relative group">
                  {/* Visual custom style */}
                  <div className={`w-full bg-slate-50 border border-transparent rounded-xl py-3.5 px-4 font-medium flex items-center justify-between transition-all duration-200 group-hover:bg-blue-50/50 group-hover:border-blue-200 group-hover:text-blue-600 ${date ? 'text-slate-900' : 'text-slate-500'}`}>
                    <span>{date ? new Date(date).toLocaleDateString('vi-VN') : 'dd/mm/yyyy'}</span>
                    <Calendar className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  {/* Functional overlay date input - Placed after visual to ensure it receives clicks */}
                  <input
                    type="date"
                    value={date}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-6">
                <button className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-200/50 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0">
                  Kiểm Tra Lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos - In production use real SVGs */}
            <div className="h-10 font-bold text-2xl text-slate-600 flex items-center gap-3"><Shield className="h-8 w-8" /> MEDGROUP</div>
            <div className="h-10 font-bold text-2xl text-slate-600 flex items-center gap-3"><Heart className="h-8 w-8" /> CAREPLUS</div>
            <div className="h-10 font-bold text-2xl text-slate-600 flex items-center gap-3"><Activity className="h-8 w-8" /> HEALTHVIET</div>
            <div className="h-10 font-bold text-2xl text-slate-600 flex items-center gap-3"><PlayCircle className="h-8 w-8" /> VINMEC</div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">Chuyên Khoa Mũi Nhọn</h2>
              <p className="text-lg text-slate-500 max-w-xl">Chúng tôi cung cấp đa dạng các dịch vụ y tế được thực hiện bởi các chuyên gia hàng đầu cùng trang thiết bị chẩn đoán hiện đại nhất.</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-blue-600 font-bold hover:text-blue-800 hover:gap-2 transition-all group">
              Xem Tất Cả Dịch Vụ
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <SpecialtyCard
              icon={<Heart className="w-8 h-8 text-blue-600" />}
              title="Tim Mạch"
              desc="Chăm sóc sức khỏe tim mạch toàn diện từ phòng ngừa đến các thủ thuật phẫu thuật phức tạp."
            />
            <SpecialtyCard
              icon={<Stethoscope className="w-8 h-8 text-blue-600" />}
              title="Nhi Khoa"
              desc="Nuôi dưỡng thế hệ tương lai với dịch vụ chăm sóc chuyên biệt cho trẻ sơ sinh, trẻ em và thanh thiếu niên."
            />
            <SpecialtyCard
              icon={<Microscope className="w-8 h-8 text-blue-600" />}
              title="Chẩn Đoán"
              desc="Phòng xét nghiệm chính xác cung cấp kết quả nhanh chóng và chuẩn xác cho quy trình điều trị hiệu quả."
            />
            <SpecialtyCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Y Học Dự Phòng"
              desc="Theo dõi sức khỏe hàng ngày và khám sàng lọc định kỳ để giúp bạn luôn khỏe mạnh và năng động."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-[#eefbfb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-6">Tại Sao Chọn ModernClinic?</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">Chúng tôi kết hợp công nghệ tiên tiến với phương pháp lấy con người làm trung tâm để cung cấp dịch vụ y tế chất lượng cao nhất. Sứ mệnh của chúng tôi là làm cho việc chăm sóc sức khỏe trở nên dễ tiếp cận, hiệu quả và mang tính cá nhân sâu sắc.</p>

              <div className="space-y-6">
                <BenefitCard
                  icon={<Microscope className="w-6 h-6 text-teal-700" />}
                  title="Công Nghệ Hiện Đại"
                  desc="Trang bị các công cụ chẩn đoán và phẫu thuật mới nhất cho y học chính xác."
                  iconBg="bg-teal-100"
                />
                <BenefitCard
                  icon={<Stethoscope className="w-6 h-6 text-teal-700" />}
                  title="Đội Ngũ Chuyên Gia"
                  desc="Các bác sĩ chuyên khoa được chứng nhận với hàng chục năm kinh nghiệm trong nhiều lĩnh vực."
                  iconBg="bg-teal-100"
                />
                <BenefitCard
                  icon={<Heart className="w-6 h-6 text-teal-700" />}
                  title="Triết Lý Lấy Bệnh Nhân Làm Đầu"
                  desc="Chăm sóc cá nhân hóa phù hợp với hành trình sức khỏe và tiền sử gia đình của bạn."
                  iconBg="bg-teal-100"
                />
              </div>
            </div>

            {/* Bento Grid Images - 2x2 Layout - Refined */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-6 h-full">
              <div className="relative overflow-hidden rounded-[2rem] shadow-lg transition-transform hover:-translate-y-1 duration-500">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" className="w-full h-56 object-cover" alt="Sảnh bệnh viện" />
              </div>
              <div className="relative overflow-hidden rounded-[2rem] shadow-lg transition-transform hover:-translate-y-1 duration-500">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600" className="w-full h-56 object-cover" alt="Màn hình công nghệ" />
              </div>
              <div className="relative overflow-hidden rounded-[2rem] shadow-lg transition-transform hover:-translate-y-1 duration-500">
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" className="w-full h-56 object-cover" alt="Bác sĩ tư vấn" />
              </div>
              <div className="relative overflow-hidden rounded-[2rem] shadow-lg transition-transform hover:-translate-y-1 duration-500">
                <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600" className="w-full h-56 object-cover" alt="Thiết bị y tế" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Cảm Nhận Từ Bệnh Nhân</h2>
            <p className="mt-4 text-lg text-slate-600">Câu chuyện thật từ những người đã tin tưởng trao gửi sức khỏe cho chúng tôi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Nguyễn Thị Lan"
              role="Bệnh nhân từ 2021"
              text="Mức độ chăm sóc tôi nhận được vượt xa sự mong đợi. Cơ sở vật chất hiện đại, và nhân viên thực sự lắng nghe những lo lắng của bạn. Rất khuyến khích!"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            />
            <TestimonialCard
              name="Trần Văn Minh"
              role="Bệnh nhân từ 2019"
              text="Hiệu quả, chuyên nghiệp và rất thân thiện. Việc đặt lịch trực tuyến làm mọi thứ trở nên dễ dàng. Tôi đánh giá cao chuyên môn của đội ngũ tim mạch."
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
            />
            <TestimonialCard
              name="Phạm Thanh Hà"
              role="Mẹ của 3 bé"
              text="Khu khám nhi thật tuyệt vời. Các con tôi thực sự hào hứng khi đến gặp bác sĩ. Cảm ơn vì đã tạo ra một môi trường ấm áp như vậy!"
              avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
            />
          </div>
        </div>
      </section>

      {/* Footer Location Section (Redesigned to split card over map) */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            {/* Left Content */}
            <div className="lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide w-fit mb-6">
                Liên Hệ Với Chúng Tôi
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-6">Ghé Thăm ModernClinic</h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Chúng tôi tọa lạc thuận tiện ngay trung tâm thành phố. Đặt lịch hẹn ngay hôm nay để trải nghiệm dịch vụ y tế đẳng cấp.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <MapPin className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">Medical Center Plaza</p>
                    <p className="text-base text-slate-500">123 Đại Lộ Sức Khỏe, Quận 1, TP.HCM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <Phone className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">1900 123 456</p>
                    <p className="text-base text-slate-500">Hỗ trợ khẩn cấp 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">Giờ Làm Việc</p>
                    <p className="text-base text-slate-500">T2 - T7: 8:00 - 20:00</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button className="w-full sm:w-auto bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-200 hover:-translate-y-1">
                  Chỉ Đường Đến Phòng Khám
                </button>
              </div>
            </div>

            {/* Right Map */}
            <div className="lg:w-1/2 relative h-[400px] lg:h-auto bg-slate-200">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
                alt="Map Location"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10 pointer-events-none"></div>
              {/* Pin on map */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-600 border-4 border-white shadow-lg"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-white">Modern<span className="text-blue-500">Clinic</span></span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cung cấp dịch vụ y tế đẳng cấp quốc tế từ năm 2005. Cam kết vì sức khỏe cộng đồng và đổi mới công nghệ.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Liên Kết Nhanh</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Chuyên Khoa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tìm Bác Sĩ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cổng Bệnh Nhân</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển Dụng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Tài Nguyên</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Thông Tin Bảo Hiểm</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Thanh Toán Trực Tuyến</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hồ Sơ Y Tế</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Câu Hỏi Thường Gặp</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Đăng Ký Tin</h4>
              <p className="text-xs text-slate-400 mb-4">Nhận cập nhật các mẹo sức khỏe mới nhất.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email của bạn" className="bg-slate-800 border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-500" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; 2024 ModernClinic Medical Group. Bảo lưu mọi quyền.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Chính Sách Bảo Mật</a>
              <a href="#" className="hover:text-white">Điều Khoản Sử Dụng</a>
              <a href="#" className="hover:text-white">Trợ Giúp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
      {children}
    </Link>
  )
}

function SpecialtyCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100 group">
      <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="h-1 w-12 bg-blue-200 rounded-full group-hover:w-20 group-hover:bg-blue-600 transition-all"></div>
    </div>
  )
}

function BenefitCard({ icon, title, desc, iconBg }: { icon: React.ReactNode, title: string, desc: string, iconBg: string }) {
  return (
    <div className="flex gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-14 w-14 shrink-0 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ name, role, text, avatar }: { name: string, role: string, text: string, avatar: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
      <div className="flex gap-1 text-amber-400 mb-4">
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
      </div>
      <p className="text-slate-700 italic mb-6 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-bold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  )
}
