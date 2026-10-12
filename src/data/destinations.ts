import { Destination, Region } from "@/types"

type DestinationCategory =
  | "Văn hóa – Đô thị"
  | "Di sản"
  | "Tâm linh – Cảnh quan"
  | "Nghỉ dưỡng"
  | "Nghỉ dưỡng – Đô thị"
  | "Nghỉ dưỡng – Nông nghiệp"
  | "Biển đảo – Lịch sử"
  | "Biển đảo"
  | "Văn hóa – Tâm linh"
  | "Văn hóa sông nước"
  | "Đô thị – Cảnh quan"
  | "Thiên nhiên – Địa chất"
  | "Lịch sử"
  | "Thiên nhiên – Văn hóa dân tộc"
  | "Cảnh quan nông nghiệp"
  | "Thiên nhiên"
  | "Sinh thái – Ẩm thực"
  | "Tâm linh – Lịch sử"
  | "Thiên nhiên – Tâm linh"
  | "Thiên nhiên – Nghỉ dưỡng"
  | "Văn hóa phi vật thể"
  | "Lịch sử – Văn hóa"
  | "Kiến trúc – Tâm linh"
  | "Di sản thiên nhiên"
  | "Biển"
  | "Lịch sử – Tri ân"
  | "Biển – Thiên nhiên"
  | "Biển – Cảnh quan"
  | "Văn hóa Tây Nguyên"
  | "Thiên nhiên – Văn hóa Tây Nguyên"
  | "Thiên nhiên – Cảnh quan"
  | "Sinh thái"
  | "Tâm linh – Thiên nhiên"
  | "Tâm linh – Kiến trúc"
  | "Sinh thái miệt vườn"
  | "Sinh thái sông nước"
  | "Văn hóa – Nông nghiệp"
  | "Thiên nhiên – Địa đầu"
  | "Văn hóa – Lịch sử"
  | "Tâm linh"
  | "Cảnh quan – Văn hóa dân tộc"
  | "Thiên nhiên – Săn mây"
  | "Cảnh quan"

interface DestinationSeed {
  id: number
  name: string
  province: string
  region: Region
  category: DestinationCategory
  angle: string
  bestTime: string
  votes: number
  hasImage?: boolean
}

const seeds: DestinationSeed[] = [
  // Miền Bắc
  { id: 69, name: "Hà Giang", province: "Tuyên Quang", region: "Bắc", category: "Thiên nhiên – Cảnh quan", angle: "cột cờ Lũng Cú, dốc Mã Pí Lèng và sắc hoa tam giác mạch", bestTime: "Tháng 10 – tháng 12", votes: 0 },
  { id: 13, name: "Đồng Văn", province: "Tuyên Quang", region: "Bắc", category: "Thiên nhiên – Địa chất", angle: "núi đá tai mèo, cung đường đèo và văn hóa vùng cao", bestTime: "Tháng 9 – tháng 11", votes: 11320 },
  { id: 14, name: "Tuyên Quang", province: "Tuyên Quang", region: "Bắc", category: "Lịch sử", angle: "không gian căn cứ cách mạng, rừng núi và những địa chỉ tri ân", bestTime: "Tháng 9 – tháng 4", votes: 4380 },
  { id: 61, name: "Cao Bằng", province: "Cao Bằng", region: "Bắc", category: "Thiên nhiên", angle: "dòng thác nhiều tầng, sông xanh và cảnh quan biên giới", bestTime: "Tháng 9 – tháng 11", votes: 10370 },
  { id: 17, name: "Ba Bể", province: "Thái Nguyên", region: "Bắc", category: "Thiên nhiên", angle: "mặt hồ xanh, núi đá, hang động và nếp sống ven hồ", bestTime: "Tháng 3 – tháng 6", votes: 7320 },
  { id: 18, name: "Thái Nguyên", province: "Thái Nguyên", region: "Bắc", category: "Sinh thái – Ẩm thực", angle: "đồi chè xanh, văn hóa thưởng trà và khung cảnh trung du dịu mắt", bestTime: "Tháng 9 – tháng 12", votes: 5290 },
  { id: 59, name: "Lạng Sơn", province: "Lạng Sơn", region: "Bắc", category: "Văn hóa – Tâm linh", angle: "hang đá, chùa trong động, thơ khắc và không gian phố núi", bestTime: "Tháng 9 – tháng 4", votes: 3920 },
  { id: 15, name: "Sa Pa", province: "Lào Cai", region: "Bắc", category: "Thiên nhiên – Văn hóa dân tộc", angle: "biển mây, bản làng, ruộng bậc thang và đỉnh núi hùng vĩ", bestTime: "Tháng 9 – tháng 11", votes: 12000 },
  { id: 16, name: "Mù Cang Chải", province: "Lào Cai", region: "Bắc", category: "Cảnh quan nông nghiệp", angle: "mùa vàng, triền núi uốn lượn và kỹ thuật canh tác bản địa", bestTime: "Tháng 9 – tháng 10", votes: 11560 },
  { id: 67, name: "Mộc Châu", province: "Sơn La", region: "Bắc", category: "Nghỉ dưỡng – Nông nghiệp", angle: "đồi chè, hoa theo mùa, thung lũng và sản vật cao nguyên", bestTime: "Tháng 10 – tháng 4", votes: 9560 },
  { id: 65, name: "Điện Biên Phủ", province: "Điện Biên", region: "Bắc", category: "Lịch sử", angle: "đồi di tích, bảo tàng, hầm chỉ huy và ký ức chiến thắng", bestTime: "Tháng 3 – tháng 5", votes: 8320 },
  { id: 63, name: "Lai Châu", province: "Lai Châu", region: "Bắc", category: "Thiên nhiên – Cảnh quan", angle: "cung đèo mây phủ, núi cao và tầm nhìn Tây Bắc hùng vĩ", bestTime: "Tháng 9 – tháng 4", votes: 7770 },
  { id: 1, name: "Hà Nội", province: "Hà Nội", region: "Bắc", category: "Văn hóa – Đô thị", angle: "mặt hồ xanh, phố nghề lâu đời, nhịp sống đô thị giàu ký ức", bestTime: "Tháng 10 – tháng 4", votes: 11870 },
  { id: 70, name: "Ba Vì", province: "Hà Nội", region: "Bắc", category: "Thiên nhiên – Nghỉ dưỡng", angle: "rừng thông bạt ngàn, đồi hoa dã quỳ và bầu không khí mát mẻ", bestTime: "Tháng 4 – tháng 11", votes: 0 },
  { id: 20, name: "Tam Đảo", province: "Phú Thọ", region: "Bắc", category: "Thiên nhiên – Nghỉ dưỡng", angle: "rừng núi mát lành, mây phủ và những tuyến đi bộ sinh thái", bestTime: "Tháng 4 – tháng 10", votes: 6480 },
  { id: 71, name: "Mai Châu", province: "Phú Thọ", region: "Bắc", category: "Cảnh quan – Văn hóa dân tộc", angle: "thung lũng lúa xanh, nếp nhà sàn người Thái và không gian thanh bình", bestTime: "Tháng 10 – tháng 4", votes: 0 },
  { id: 19, name: "Phú Thọ", province: "Phú Thọ", region: "Bắc", category: "Tâm linh – Lịch sử", angle: "không gian nguồn cội, rừng núi Nghĩa Lĩnh và nghi lễ cộng đồng", bestTime: "Tháng 2 – tháng 4", votes: 9630 },
  { id: 25, name: "Ninh Bình", province: "Ninh Bình", region: "Bắc", category: "Di sản thiên nhiên", angle: "sông nước, hang xuyên thủy, núi đá vôi và di tích cố đô", bestTime: "Tháng 1 – tháng 4", votes: 11730 },
  { id: 57, name: "Hạ Long", province: "Quảng Ninh", region: "Bắc", category: "Di sản thiên nhiên", angle: "núi đá vôi, mặt vịnh xanh và những hành trình du thuyền", bestTime: "Tháng 10 – tháng 4", votes: 11980 },
  { id: 72, name: "Cô Tô", province: "Quảng Ninh", region: "Bắc", category: "Biển đảo", angle: "bãi đá Cầu Mỵ, biển xanh trong và bờ cát trắng hoang sơ", bestTime: "Tháng 4 – tháng 9", votes: 0 },
  { id: 73, name: "Móng Cái", province: "Quảng Ninh", region: "Bắc", category: "Biển – Cảnh quan", angle: "mũi Sa Vĩ địa đầu Tổ quốc, bãi biển Trà Cổ và nhịp sống biên mậu", bestTime: "Tháng 4 – tháng 8", votes: 0 },
  { id: 74, name: "Hải Phòng", province: "Hải Phòng", region: "Bắc", category: "Đô thị – Cảnh quan", angle: "thành phố hoa phượng đỏ, kiến trúc phố cổ và ẩm thực đất cảng", bestTime: "Tháng 4 – tháng 10", votes: 0 },
  { id: 9, name: "Cát Bà", province: "Hải Phòng", region: "Bắc", category: "Biển đảo", angle: "vịnh xanh, đảo đá, làng chài và hệ sinh thái ven biển", bestTime: "Tháng 4 – tháng 10", votes: 8430 },
  { id: 21, name: "Bắc Ninh", province: "Bắc Ninh", region: "Bắc", category: "Văn hóa phi vật thể", angle: "làng cổ, mái chùa, làn điệu quan họ và sinh hoạt cộng đồng", bestTime: "Tháng 1 – tháng 3", votes: 4710 },
  { id: 23, name: "Hưng Yên", province: "Hưng Yên", region: "Bắc", category: "Lịch sử – Văn hóa", angle: "dấu xưa thương cảng, đình chùa cổ và nhịp sống ven sông", bestTime: "Tháng 10 – tháng 4", votes: 3420 },

  // Miền Trung & Tây Nguyên
  { id: 27, name: "Thanh Hóa", province: "Thanh Hóa", region: "Bắc", category: "Di sản", angle: "tường thành đá, cảnh quan làng quê và dấu ấn kiến trúc độc đáo", bestTime: "Tháng 10 – tháng 4", votes: 4970 },
  { id: 28, name: "Sầm Sơn", province: "Thanh Hóa", region: "Bắc", category: "Biển", angle: "bãi cát dài, nhịp nghỉ dưỡng sôi động và hải sản ven biển", bestTime: "Tháng 4 – tháng 8", votes: 7440 },
  { id: 75, name: "Pù Luông", province: "Thanh Hóa", region: "Bắc", category: "Thiên nhiên – Nghỉ dưỡng", angle: "ruộng bậc thang xanh ngát, guồng nước và bản làng yên bình", bestTime: "Tháng 5 – tháng 10", votes: 0 },
  { id: 29, name: "Vinh", province: "Nghệ An", region: "Trung", category: "Lịch sử", angle: "làng quê xứ Nghệ, nếp nhà truyền thống và câu chuyện lịch sử gần gũi", bestTime: "Tháng 3 – tháng 8", votes: 6720 },
  { id: 30, name: "Cửa Lò", province: "Nghệ An", region: "Trung", category: "Biển", angle: "bờ cát rộng, làng biển và nhịp nghỉ dưỡng thân thiện", bestTime: "Tháng 4 – tháng 8", votes: 7130 },
  { id: 31, name: "Hà Tĩnh", province: "Hà Tĩnh", region: "Trung", category: "Lịch sử – Tri ân", angle: "không gian tưởng niệm, câu chuyện thanh niên xung phong và vùng đồi yên tĩnh", bestTime: "Tháng 3 – tháng 7", votes: 4510 },
  { id: 76, name: "Đồng Hới", province: "Quảng Trị", region: "Trung", category: "Biển – Cảnh quan", angle: "bãi biển Nhật Lệ, tượng đài Mẹ Suốt và dấu ấn thành cổ", bestTime: "Tháng 4 – tháng 8", votes: 0 },
  { id: 33, name: "Phong Nha", province: "Quảng Trị", region: "Trung", category: "Di sản thiên nhiên", angle: "hang động, sông ngầm, rừng xanh và địa hình đá vôi kỳ vĩ", bestTime: "Tháng 3 – tháng 8", votes: 11210 },
  { id: 34, name: "Quảng Trị", province: "Quảng Trị", region: "Trung", category: "Lịch sử", angle: "không gian tưởng niệm, tường thành và những ký ức chiến tranh", bestTime: "Tháng 4 – tháng 7", votes: 5360 },
  { id: 3, name: "Huế", province: "Huế", region: "Trung", category: "Di sản", angle: "thành quách, điện miếu, sắc màu cung đình và nhịp sông Hương", bestTime: "Tháng 1 – tháng 4", votes: 10620 },
  { id: 6, name: "Đà Nẵng", province: "Đà Nẵng", region: "Trung", category: "Nghỉ dưỡng", angle: "khí hậu mát, cảnh quan núi cao và các công trình tham quan nổi bật", bestTime: "Tháng 3 – tháng 9", votes: 9850 },
  { id: 5, name: "Hội An", province: "Đà Nẵng", region: "Trung", category: "Di sản", angle: "mái ngói rêu phong, đèn lồng, bến sông và nếp sống thương cảng", bestTime: "Tháng 2 – tháng 8", votes: 11940 },
  { id: 77, name: "Cù Lao Chàm", province: "Đà Nẵng", region: "Trung", category: "Biển đảo", angle: "khu dự trữ sinh quyển thế giới, lặn ngắm san hô và bãi biển xanh", bestTime: "Tháng 3 – tháng 8", votes: 0 },
  { id: 78, name: "Quảng Ngãi", province: "Quảng Ngãi", region: "Trung", category: "Cảnh quan", angle: "núi Thiên Ấn, sông Trà Khúc và cảnh sắc duyên hải miền Trung", bestTime: "Tháng 3 – tháng 9", votes: 0 },
  { id: 35, name: "Lý Sơn", province: "Quảng Ngãi", region: "Trung", category: "Biển đảo", angle: "đảo núi lửa, ruộng tỏi, biển xanh và đời sống làng chài", bestTime: "Tháng 4 – tháng 8", votes: 8610 },
  { id: 36, name: "Kon Tum", province: "Quảng Ngãi", region: "Tây Nguyên", category: "Thiên nhiên – Nghỉ dưỡng", angle: "rừng thông, hồ thác, khí hậu mát và nhịp nghỉ dưỡng chậm", bestTime: "Tháng 11 – tháng 4", votes: 6290 },
  { id: 37, name: "Quy Nhơn", province: "Gia Lai", region: "Trung", category: "Biển", angle: "vách đá ven biển, nước xanh và cung đường ngắm gió", bestTime: "Tháng 3 – tháng 8", votes: 9780 },
  { id: 38, name: "Pleiku", province: "Gia Lai", region: "Tây Nguyên", category: "Thiên nhiên – Văn hóa Tây Nguyên", angle: "mặt hồ núi lửa, rừng thông và sắc thái cao nguyên yên bình", bestTime: "Tháng 11 – tháng 3", votes: 5940 },
  { id: 44, name: "Tuy Hòa", province: "Đắk Lắk", region: "Trung", category: "Thiên nhiên – Địa chất", angle: "những khối đá xếp lớp, sóng biển và cảnh quan địa chất lạ mắt", bestTime: "Tháng 2 – tháng 8", votes: 7090 },
  { id: 43, name: "Buôn Ma Thuột", province: "Đắk Lắk", region: "Tây Nguyên", category: "Văn hóa Tây Nguyên", angle: "nhà dài, bến nước, rừng khộp và câu chuyện đại ngàn", bestTime: "Tháng 11 – tháng 3", votes: 5720 },
  { id: 39, name: "Nha Trang", province: "Khánh Hòa", region: "Trung", category: "Biển đảo", angle: "vịnh biển xanh, đảo gần bờ, san hô và nhịp du lịch biển", bestTime: "Tháng 2 – tháng 8", votes: 10880 },
  { id: 40, name: "Phan Rang", province: "Khánh Hòa", region: "Trung", category: "Biển – Thiên nhiên", angle: "vịnh kín gió, núi đá, nước trong và trải nghiệm biển sinh thái", bestTime: "Tháng 3 – tháng 8", votes: 7990 },
  { id: 41, name: "Đà Lạt", province: "Lâm Đồng", region: "Tây Nguyên", category: "Nghỉ dưỡng – Đô thị", angle: "rừng thông, hồ nước, phố núi và khí hậu se lạnh", bestTime: "Tháng 11 – tháng 4", votes: 11040 },
  { id: 79, name: "Bảo Lộc", province: "Lâm Đồng", region: "Tây Nguyên", category: "Nghỉ dưỡng – Nông nghiệp", angle: "đồi chè Tâm Châu, thác Dambri hùng vĩ và sương mù lãng đãng", bestTime: "Tháng 12 – tháng 4", votes: 0 },
  { id: 80, name: "Phan Thiết", province: "Lâm Đồng", region: "Trung", category: "Biển", angle: "bãi cát trải dài, ngọn hải đăng Kê Gà và làng chài nhộn nhịp", bestTime: "Tháng 11 – tháng 4", votes: 0 },
  { id: 42, name: "Mũi Né", province: "Lâm Đồng", region: "Trung", category: "Biển – Cảnh quan", angle: "đồi cát, biển nắng, làng chài và sắc màu duyên hải", bestTime: "Tháng 11 – tháng 4", votes: 8240 },

  // Miền Nam
  { id: 7, name: "TP. Hồ Chí Minh", province: "TP. Hồ Chí Minh", region: "Nam", category: "Văn hóa – Đô thị", angle: "dấu ấn kiến trúc đô thị, quảng trường trung tâm và nhịp sống hiện đại", bestTime: "Tháng 12 – tháng 4", votes: 8760 },
  { id: 81, name: "Vũng Tàu", province: "TP. Hồ Chí Minh", region: "Nam", category: "Biển", angle: "bờ biển Thùy Vân, ngọn hải đăng trên núi Nhỏ và tượng Chúa Kito", bestTime: "Tháng 11 – tháng 4", votes: 0 },
  { id: 8, name: "Côn Đảo", province: "TP. Hồ Chí Minh", region: "Nam", category: "Biển đảo – Lịch sử", angle: "biển xanh, rừng nguyên sinh, ký ức lịch sử và không gian lắng đọng", bestTime: "Tháng 3 – tháng 9", votes: 10110 },
  { id: 45, name: "Đồng Nai", province: "Đồng Nai", region: "Nam", category: "Sinh thái", angle: "rừng nhiệt đới, tuyến trekking, cây cổ thụ và sinh cảnh hoang dã", bestTime: "Tháng 12 – tháng 5", votes: 6420 },
  { id: 47, name: "Tây Ninh", province: "Tây Ninh", region: "Nam", category: "Tâm linh – Thiên nhiên", angle: "núi cao, mây phủ, không gian hành hương và tầm nhìn rộng", bestTime: "Tháng 12 – tháng 4", votes: 10030 },
  { id: 82, name: "Mỹ Tho", province: "Đồng Tháp", region: "Nam", category: "Sinh thái miệt vườn", angle: "cù lao Thới Sơn, vườn cây trĩu quả và đờn ca tài tử Nam Bộ", bestTime: "Tháng 5 – tháng 9", votes: 0 },
  { id: 52, name: "Sa Đéc", province: "Đồng Tháp", region: "Nam", category: "Văn hóa – Nông nghiệp", angle: "vườn hoa rực rỡ, nhà vườn và nghề trồng hoa lâu đời", bestTime: "Tháng 12 – tháng 2", votes: 7540 },
  { id: 50, name: "Bến Tre", province: "Vĩnh Long", region: "Nam", category: "Sinh thái sông nước", angle: "cù lao xanh, xuồng chèo, vườn dừa và trải nghiệm miệt vườn", bestTime: "Tháng 11 – tháng 5", votes: 4630 },
  { id: 49, name: "Vĩnh Long", province: "Vĩnh Long", region: "Nam", category: "Sinh thái miệt vườn", angle: "vườn cây, kênh rạch, nhà vườn và nhịp sống sông nước", bestTime: "Tháng 5 – tháng 9", votes: 4170 },
  { id: 11, name: "Cần Thơ", province: "Cần Thơ", region: "Nam", category: "Văn hóa sông nước", angle: "ghe thuyền buôn bán, bữa sáng trên sông và sinh hoạt miền Tây", bestTime: "Tháng 11 – tháng 4", votes: 10480 },
  { id: 83, name: "Sóc Trăng", province: "Cần Thơ", region: "Nam", category: "Văn hóa – Tâm linh", angle: "chùa Dơi, chùa Chén Kiểu và lễ hội Oóc Om Bóc rộn ràng", bestTime: "Tháng 10 – tháng 4", votes: 0 },
  { id: 55, name: "Châu Đốc", province: "An Giang", region: "Nam", category: "Tâm linh", angle: "không gian hành hương, núi thấp, đồng bằng và văn hóa biên giới", bestTime: "Tháng 1 – tháng 5", votes: 8120 },
  { id: 84, name: "Hà Tiên", province: "An Giang", region: "Nam", category: "Cảnh quan", angle: "Thập cảnh Hà Tiên, Thạch Động và biển Mũi Nai êm đềm", bestTime: "Tháng 11 – tháng 4", votes: 0 },
  { id: 56, name: "Phú Quốc", province: "An Giang", region: "Nam", category: "Biển đảo", angle: "biển xanh, rừng nguyên sinh, làng chài và trải nghiệm nghỉ dưỡng", bestTime: "Tháng 11 – tháng 4", votes: 10990 },
  { id: 85, name: "Rạch Giá", province: "An Giang", region: "Nam", category: "Đô thị – Cảnh quan", angle: "khu đô thị lấn biển, bến tàu Rạch Giá và cổng Tam Quan", bestTime: "Tháng 12 – tháng 4", votes: 0 },
  { id: 54, name: "Bạc Liêu", province: "Cà Mau", region: "Nam", category: "Văn hóa – Lịch sử", angle: "không gian nhà cổ, câu chuyện Nam Bộ và dấu ấn kiến trúc xưa", bestTime: "Tháng 11 – tháng 4", votes: 3310 },
  { id: 53, name: "Cà Mau", province: "Cà Mau", region: "Nam", category: "Thiên nhiên – Địa đầu", angle: "rừng ngập mặn, cột mốc cuối đất và đường chân trời biển", bestTime: "Tháng 12 – tháng 4", votes: 8890 },
]

const videoIds = new Set([1, 3, 5, 8, 9, 11, 15, 16, 25, 29, 33, 35, 37, 39, 41, 43, 47, 52, 53, 55, 56, 57, 61, 65, 67])

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toTag(category: DestinationCategory): Destination["tag"] {
  if (category.includes("Di sản")) return category.includes("thiên nhiên") ? "Di sản thiên nhiên" : "Di sản văn hóa"
  if (category.includes("Lịch sử") || category.includes("Văn hóa") || category.includes("Tâm linh") || category.includes("Kiến trúc")) return "Di sản văn hóa"
  if (category.includes("Thiên nhiên") || category.includes("Sinh thái")) return "Di sản thiên nhiên"
  if (category.includes("Cảnh quan") || category.includes("Biển")) return "Cảnh quan"
  return "Danh thắng"
}

function buildShortDescription(item: DestinationSeed) {
  return `${item.name} tại ${item.province} là điểm đến thuộc nhóm ${item.category.toLowerCase()}, nổi bật với ${item.angle}. Hồ sơ phù hợp để người dùng xem nhanh ảnh đại diện, địa phương, nét đặc trưng và cân nhắc trước khi tham gia bình chọn.`
}

function buildIntroduction(item: DestinationSeed) {
  return `${item.name} là một điểm đến thuộc ${item.province} trong danh sách 68 điểm đến của hội thi. Điểm đến được giới thiệu theo hướng tra cứu thuận tiện, nhấn mạnh trải nghiệm cảnh quan, văn hóa địa phương và cảm xúc khi ghé thăm. Không gian nổi bật bởi ${item.angle}, phù hợp cho du khách muốn tìm hiểu bản sắc vùng miền trước khi lên kế hoạch tham quan. Nội dung hồ sơ tập trung vào thông tin chắc chắn, tránh các số liệu khó kiểm chứng và ưu tiên mô tả dễ hiểu cho công chúng. Trên website, người dùng có thể xem ảnh đại diện, bộ sưu tập hình ảnh, thời điểm nên đi, địa chỉ khu vực, các điểm nhấn đặc trưng và nút bình chọn. Hồ sơ này cũng được thiết kế để quản trị viên cập nhật thêm video, thông báo hoặc trạng thái hiển thị khi cần.`
}

function toDestination(item: DestinationSeed): Destination {
  const slug = slugify(item.name)
  const tag = toTag(item.category)
  const hasImg = item.hasImage !== false
  const thumbnail = hasImg ? `/images/destinations/${item.id}.webp` : ""
  const gallery = hasImg ? [thumbnail] : []
  const secondaryImage = hasImg ? thumbnail : ""
  const shortDescription = buildShortDescription(item)
  const introduction = buildIntroduction(item)

  return {
    id: String(item.id),
    slug,
    name: item.name,
    province: item.province,
    place: item.province,
    region: item.region,
    category: item.category,
    thumbnail,
    image: thumbnail,
    imageCredit: hasImg ? "Ảnh minh họa tạo bằng AI" : "",
    secondaryImage,
    gallery,
    videoUrl: videoIds.has(item.id) ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
    votes: item.votes.toLocaleString("vi-VN"),
    rawVotes: item.votes,
    tag,
    unescoTitle: item.category,
    shortDescription,
    lead: shortDescription,
    introduction,
    description: introduction,
    highlights: [
      item.angle,
      `Đại diện tiêu biểu của ${item.province}`,
      `Phù hợp nhóm trải nghiệm ${item.category.toLowerCase()}`,
      "Có ảnh đại diện, bộ ảnh và nút bình chọn",
    ],
    bestTime: item.bestTime,
    address: `Khu vực ${item.name}, ${item.province}`,
    facts: [
      { label: "Tỉnh/Thành", value: item.province },
      { label: "Loại hình", value: item.category },
      { label: "Thời điểm lý tưởng", value: item.bestTime },
    ],
    status: "active",
    updatedAt: "2026-10-01",
    isVisible: true,
  }
}

export const initialDestinations: Destination[] = seeds.map(toDestination)

/** Refresh bundled artwork without resetting locally stored votes or visibility. */
export function refreshDestinationImages(saved: Destination[]): Destination[] {
  return saved.map((item) => {
    const current = initialDestinations.find((seed) => seed.id === item.id)
    if (!current) return item
    return {
      ...item,
      thumbnail: current.thumbnail,
      image: current.image,
      secondaryImage: current.secondaryImage,
      gallery: current.gallery,
      imageCredit: current.imageCredit,
    }
  })
}

export const news = [
  {
    title: "Mở cổng bình chọn 68 điểm đến yêu thích",
    date: "2026-10-15",
    summary: "Cổng bình chọn chính thức mở để người dùng tra cứu hồ sơ, xem bảng xếp hạng và gửi lượt bình chọn hợp lệ.",
    thumbnail: "https://picsum.photos/seed/news-mo-cong-binh-chon/600/400",
    tag: "Thông báo",
  },
  {
    title: "Cập nhật hướng dẫn tham gia bình chọn",
    date: "2026-10-18",
    summary: "Ban tổ chức bổ sung hướng dẫn từng bước giúp người dùng tìm điểm đến, xem hồ sơ chi tiết và xác nhận lượt bình chọn.",
    thumbnail: "https://picsum.photos/seed/news-huong-dan-binh-chon/600/400",
    tag: "Tin tức",
  },
  {
    title: "Công bố bộ hồ sơ 34 tỉnh thành tham gia",
    date: "2026-10-21",
    summary: "Danh sách mock data gồm các điểm đến đại diện trên toàn quốc để phục vụ thiết kế giao diện.",
    thumbnail: "https://picsum.photos/seed/news-ho-so-34-tinh/600/400",
    tag: "Thông báo",
  },
  {
    title: "Bảng xếp hạng được cập nhật theo lượt bình chọn",
    date: "2026-10-25",
    summary: "Kết quả tạm thời sắp xếp theo số lượt bình chọn, giúp công chúng theo dõi các điểm đến đang được quan tâm.",
    thumbnail: "https://picsum.photos/seed/news-bang-xep-hang/600/400",
    tag: "Tin tức",
  },
  {
    title: "Bổ sung bộ ảnh mock cho từng hồ sơ",
    date: "2026-11-01",
    summary: "Mỗi hồ sơ có ảnh đại diện và bốn ảnh thư viện để kiểm thử bố cục trang danh sách và trang chi tiết điểm đến.",
    thumbnail: "https://picsum.photos/seed/news-bo-anh-mock/600/400",
    tag: "Tin tức",
  },
  {
    title: "Nhắc lại thời hạn bình chọn",
    date: "2026-12-01",
    summary: "Người dùng có thể tiếp tục tham gia bình chọn cho đến ngày kết thúc theo cấu hình của hệ thống.",
    thumbnail: "https://picsum.photos/seed/news-thoi-han/600/400",
    tag: "Thông báo",
  },
] as const

export const voteConfig = {
  title: "Bình chọn 68 điểm đến yêu thích",
  startDate: "2026-10-15",
  endDate: "2026-12-15",
  status: "open",
  rules: [
    "Mỗi người dùng được bình chọn tối đa 3 lượt mỗi ngày.",
    "Lượt bình chọn cần chọn đúng một hồ sơ điểm đến đang hoạt động.",
    "Thông tin người bình chọn chỉ dùng cho mục đích đối soát.",
    "Hệ thống có quyền loại bỏ lượt bình chọn bất thường.",
    "Bảng xếp hạng hiển thị theo số lượt bình chọn hợp lệ.",
    "Kết quả cuối cùng được công bố sau thời gian kiểm tra dữ liệu.",
  ],
  guide: [
    "Tìm kiếm hoặc lọc điểm đến trong danh sách 68 hồ sơ.",
    "Mở hồ sơ chi tiết để xem ảnh, mô tả và điểm nổi bật.",
    "Nhấn nút bình chọn và nhập thông tin xác nhận cần thiết.",
    "Theo dõi biên nhận và bảng xếp hạng tại trang kết quả.",
  ],
  limitPerDay: 3,
} as const

export const leaderboard = [...initialDestinations]
  .sort((a, b) => b.rawVotes - a.rawVotes)
  .slice(0, 10)
  .map((item, index) => ({
    rank: index + 1,
    id: item.id,
    slug: item.slug,
    name: item.name,
    province: item.province,
    votes: item.rawVotes,
  }))
